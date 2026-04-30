/* app.js – Tennisplatz-Buchung Westfalia Osterwick */
(function () {
  'use strict';

  // ── Config ─────────────────────────────────────────
  var HOUR_START = 9;
  var HOUR_END   = 21;
  var HOUR_HEIGHT = 60; // px per hour

  // ── State ──────────────────────────────────────────
  var state = {
    date:       new Date(),
    view:       'day',
    auth:       null,
    courts:     [],
    schedule:   null,
    weekData:   null,
  };

  // ── Helpers ────────────────────────────────────────
  function toISO(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + dd;
  }

  function formatDate(d) {
    return d.toLocaleDateString('de-DE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  var WD_SHORTS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  function isToday(d) {
    var t = new Date();
    return d.getFullYear() === t.getFullYear()
      && d.getMonth() === t.getMonth()
      && d.getDate() === t.getDate();
  }

  function addDays(d, n) {
    var r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function minutesToPx(minutes) {
    return (minutes / 60) * HOUR_HEIGHT;
  }

  function el(id) { return document.getElementById(id); }

  function showToast(msg, type) {
    var toast = el('toast');
    toast.textContent = msg;
    toast.className = 'toast toast--' + (type || 'success') + ' toast--show';
    setTimeout(function () { toast.classList.remove('toast--show'); }, 4000);
  }

  // ── Auth ───────────────────────────────────────────
  function loadAuth() {
    fetch('/api/auth/status/', { credentials: 'include' })
      .then(function (r) { return r.ok ? r.json() : { authenticated: false }; })
      .catch(function () { return { authenticated: false }; })
      .then(function (data) {
        state.auth = data;
        renderAuth();
      });
  }

  function renderAuth() {
    var a = state.auth;
    if (a && a.authenticated) {
      el('btn-login').style.display = 'none';
      el('btn-logout').style.display = '';
      var u = el('topbar-user');
      u.textContent = '👤 ' + a.name;
      u.style.display = '';
      if (a.is_admin) el('btn-admin').style.display = '';
    } else {
      el('btn-login').style.display = '';
      el('btn-logout').style.display = 'none';
      el('topbar-user').style.display = 'none';
      el('btn-admin').style.display = 'none';
    }
  }

  // ── Day chips (±3 days) ────────────────────────────
  function renderDayChips() {
    var container = el('day-chips');
    container.innerHTML = '';
    for (var i = -3; i <= 3; i++) {
      var d = addDays(state.date, i);
      var chip = document.createElement('button');
      chip.className = 'day-chip' + (i === 0 ? ' day-chip--active' : '');
      chip.innerHTML =
        '<span class="day-chip__wd">' + WD_SHORTS[d.getDay()] + '</span>' +
        '<span class="day-chip__d">' + d.getDate() + '</span>';
      if (isToday(d) && i !== 0) {
        chip.innerHTML += '<span class="day-chip__dot"></span>';
      }
      (function (date) {
        chip.addEventListener('click', function () {
          state.date = date;
          refresh();
        });
      })(d);
      container.appendChild(chip);
    }
  }

  // ── Date display ───────────────────────────────────
  function renderDateDisplay() {
    el('date-display').textContent = formatDate(state.date);
    var badge = el('today-badge');
    if (isToday(state.date)) {
      badge.style.display = '';
    } else {
      badge.style.display = 'none';
    }
  }

  // ── Day View ───────────────────────────────────────
  function renderDayView(data) {
    var main = el('main-content');
    if (!data || !data.courts || data.courts.length === 0) {
      main.innerHTML = '<div class="loader"><span>Keine Plätze gefunden.</span></div>';
      return;
    }

    var courts = data.courts;
    var numCourts = courts.length;
    var hours = HOUR_END - HOUR_START;

    var grid = document.createElement('div');
    grid.className = 'day-grid';
    grid.style.setProperty('--courts', numCourts);

    // Time gutter
    var gutter = document.createElement('div');
    gutter.className = 'time-gutter';
    for (var h = HOUR_START; h <= HOUR_END; h++) {
      var lbl = document.createElement('div');
      lbl.className = 'time-label';
      lbl.textContent = h + ':00';
      gutter.appendChild(lbl);
    }
    grid.appendChild(gutter);

    // Current time offset (minutes from HOUR_START)
    var now = new Date();
    var nowMinutes = now.getHours() * 60 + now.getMinutes() - HOUR_START * 60;
    var showNow = isToday(state.date) && nowMinutes >= 0 && nowMinutes <= hours * 60;

    // Court columns
    courts.forEach(function (court) {
      var col = document.createElement('div');
      col.className = 'court-col';

      // Header
      var hdr = document.createElement('div');
      hdr.className = 'court-header';
      hdr.innerHTML =
        '<div class="court-header__name">' + court.name + '</div>' +
        '<div class="court-header__desc">' + (court.description || '') + '</div>';

      var bookBtn = document.createElement('button');
      bookBtn.className = 'court-header__book-btn';
      bookBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Jetzt buchen';
      (function (cid, cname) {
        bookBtn.addEventListener('click', function () { openModal(cid, cname); });
      })(court.id, court.name);
      hdr.appendChild(bookBtn);
      col.appendChild(hdr);

      // Timeline
      var timeline = document.createElement('div');
      timeline.className = 'court-timeline';
      timeline.style.height = (hours * HOUR_HEIGHT) + 'px';
      timeline.style.position = 'relative';

      // Hour lines
      for (var h = 0; h < hours; h++) {
        var hr = document.createElement('div');
        hr.className = 'timeline-hour timeline-hour--half';
        hr.style.cssText = 'position:absolute;left:0;right:0;height:' + HOUR_HEIGHT + 'px;top:' + (h * HOUR_HEIGHT) + 'px;border-bottom:1px solid #f1f5f9;';
        timeline.appendChild(hr);
      }

      // Current time indicator
      if (showNow) {
        var indicator = document.createElement('div');
        indicator.className = 'time-indicator';
        indicator.style.top = minutesToPx(nowMinutes) + 'px';
        timeline.appendChild(indicator);
      }

      // Slots
      if (court.slots && court.slots.length > 0) {
        court.slots.forEach(function (slot) {
          var topMin = slot.start_minutes - HOUR_START * 60;
          var heightMin = slot.end_minutes - slot.start_minutes;
          if (topMin < 0) topMin = 0;

          var div = document.createElement('div');
          var cls = 'slot ';
          if (slot.type === 'booking') {
            cls += 'slot--booking';
          } else {
            cls += 'slot--block-' + (slot.block_type || 'training');
          }
          div.className = cls;
          div.style.top = minutesToPx(topMin) + 'px';
          div.style.height = Math.max(minutesToPx(heightMin) - 4, 20) + 'px';

          var label = slot.type === 'booking' ? slot.booker_name : slot.title;
          div.innerHTML =
            '<div class="slot__name">' + label + '</div>' +
            '<div class="slot__time">' + slot.start + ' – ' + slot.end + '</div>';
          timeline.appendChild(div);
        });
      }

      col.appendChild(timeline);

      // Click on empty area → open booking modal
      (function (cid, cname) {
        timeline.addEventListener('click', function (e) {
          if (e.target !== timeline && !e.target.classList.contains('timeline-hour')) return;
          openModal(cid, cname);
        });
      })(court.id, court.name);

      grid.appendChild(col);
    });

    main.innerHTML = '';
    main.appendChild(grid);

    // Scroll to current time or 09:00
    if (showNow) {
      var scrollTarget = Math.max(0, minutesToPx(nowMinutes) - 120);
      setTimeout(function () { window.scrollBy({ top: scrollTarget, behavior: 'smooth' }); }, 100);
    }
  }

  // ── Week View ──────────────────────────────────────
  function renderWeekView(data) {
    var main = el('main-content');
    if (!data || !data.days || data.days.length === 0) {
      main.innerHTML = '<div class="loader"><span>Keine Daten.</span></div>';
      return;
    }

    var today = toISO(new Date());
    var grid = document.createElement('div');
    grid.className = 'week-grid';

    // Header
    var header = document.createElement('div');
    header.className = 'week-header';
    var cornerCell = document.createElement('div');
    cornerCell.className = 'week-header__cell';
    cornerCell.textContent = 'Platz';
    header.appendChild(cornerCell);

    data.days.forEach(function (day) {
      var d = new Date(day.date);
      var cell = document.createElement('div');
      cell.className = 'week-header__cell' + (day.date === today ? ' week-header__cell--today' : '');
      cell.innerHTML = WD_SHORTS[d.getDay()] + '<br><strong>' + d.getDate() + '.' + (d.getMonth() + 1) + '.</strong>';
      header.appendChild(cell);
    });
    grid.appendChild(header);

    // Court rows — build from first day's courts
    if (data.days[0] && data.days[0].courts) {
      data.days[0].courts.forEach(function (court, ci) {
        var row = document.createElement('div');
        row.className = 'week-row';

        var lbl = document.createElement('div');
        lbl.className = 'week-court-label';
        lbl.textContent = court.name;
        row.appendChild(lbl);

        data.days.forEach(function (day) {
          var c = day.courts[ci] || {};
          var cell = document.createElement('div');
          cell.className = 'week-cell' + (day.date === today ? ' week-cell--today' : '');

          if (c.has_activity) {
            cell.innerHTML = '<span class="week-cell__count">✓</span>';
          } else {
            cell.innerHTML = '<span class="week-cell__free">Frei</span>';
          }

          // Click → jump to day
          (function (dateStr) {
            cell.addEventListener('click', function () {
              state.date = new Date(dateStr);
              state.view = 'day';
              el('btn-day').classList.add('view-toggle__btn--active');
              el('btn-week').classList.remove('view-toggle__btn--active');
              refresh();
            });
          })(day.date);

          row.appendChild(cell);
        });
        grid.appendChild(row);
      });
    }

    main.innerHTML = '';
    main.appendChild(grid);
  }

  // ── Data loading ───────────────────────────────────
  function showLoader() {
    el('main-content').innerHTML =
      '<div class="loader"><div class="loader__spinner"></div><span>Lade Belegungsplan…</span></div>';
  }

  function loadDaySchedule() {
    showLoader();
    fetch('/api/schedule/?date=' + toISO(state.date), { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.schedule = data;
        renderDayView(data);
      })
      .catch(function () {
        el('main-content').innerHTML = '<div class="loader"><span>Fehler beim Laden.</span></div>';
      });
  }

  function loadWeekData() {
    showLoader();
    // Start of week (Monday)
    var d = new Date(state.date);
    var day = d.getDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    fetch('/api/week/?start=' + toISO(d), { credentials: 'include' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        state.weekData = data;
        renderWeekView(data);
      })
      .catch(function () {
        el('main-content').innerHTML = '<div class="loader"><span>Fehler beim Laden.</span></div>';
      });
  }

  function refresh() {
    renderDateDisplay();
    renderDayChips();
    if (state.view === 'day') {
      loadDaySchedule();
    } else {
      loadWeekData();
    }
  }

  // ── Booking Modal ──────────────────────────────────
  function openModal(courtId, courtName) {
    if (!state.auth || !state.auth.authenticated) {
      window.location.href = '/api/auth/login/';
      return;
    }
    el('f-court-id').value = courtId;
    el('f-date').value = toISO(state.date);
    el('modal-subtitle').textContent = courtName + ' · ' + formatDate(state.date);
    el('modal-error').style.display = 'none';
    el('modal-error').textContent = '';
    el('f-name').value = state.auth.name || '';
    el('f-email').value = state.auth.email || '';
    el('f-start').value = '';
    el('f-end').value = '';
    el('f-phone').value = '';
    el('f-notes').value = '';

    var overlay = el('modal-overlay');
    overlay.classList.add('modal-overlay--open');
    overlay.setAttribute('aria-hidden', 'false');
    setTimeout(function () { el('f-name').focus(); }, 100);
  }

  function closeModal() {
    var overlay = el('modal-overlay');
    overlay.classList.remove('modal-overlay--open');
    overlay.setAttribute('aria-hidden', 'true');
  }

  function getCookie(name) {
    var m = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return m ? m.pop() : '';
  }

  el('modal-close').addEventListener('click', closeModal);
  el('modal-cancel').addEventListener('click', closeModal);
  el('modal-overlay').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  el('booking-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = el('modal-submit');
    btn.disabled = true;
    btn.innerHTML = '<div class="loader__spinner" style="width:16px;height:16px;border-width:2px;margin:0"></div> Wird gebucht…';

    var dateVal = el('f-date').value;
    var startVal = el('f-start').value;
    var endVal   = el('f-end').value;

    if (!startVal || !endVal) {
      showFormError('Bitte Startzeit und Endzeit angeben.');
      resetBtn(btn);
      return;
    }

    var payload = {
      court: el('f-court-id').value,
      booker_name: el('f-name').value.trim(),
      booker_email: el('f-email').value.trim(),
      booker_phone: el('f-phone').value.trim(),
      notes: el('f-notes').value.trim(),
      start_datetime: dateVal + 'T' + startVal + ':00',
      end_datetime:   dateVal + 'T' + endVal   + ':00',
    };

    fetch('/api/bookings/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken'),
      },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, data: d }; }); })
      .then(function (res) {
        if (res.ok) {
          closeModal();
          showToast('✅ Buchung bestätigt! Eine Bestätigung wird per E-Mail gesendet.', 'success');
          loadDaySchedule();
        } else {
          var msg = res.data.non_field_errors
            ? res.data.non_field_errors.join(' ')
            : (res.data.detail || JSON.stringify(res.data));
          showFormError(msg);
          resetBtn(btn);
        }
      })
      .catch(function () {
        showFormError('Netzwerkfehler. Bitte versuche es erneut.');
        resetBtn(btn);
      });
  });

  function showFormError(msg) {
    var errEl = el('modal-error');
    errEl.textContent = '⚠️ ' + msg;
    errEl.style.display = '';
  }

  function resetBtn(btn) {
    btn.disabled = false;
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Jetzt buchen';
  }

  // ── Navigation ─────────────────────────────────────
  el('btn-prev').addEventListener('click', function () {
    state.date = addDays(state.date, -1);
    refresh();
  });
  el('btn-next').addEventListener('click', function () {
    state.date = addDays(state.date, 1);
    refresh();
  });

  el('btn-day').addEventListener('click', function () {
    state.view = 'day';
    el('btn-day').classList.add('view-toggle__btn--active');
    el('btn-week').classList.remove('view-toggle__btn--active');
    refresh();
  });
  el('btn-week').addEventListener('click', function () {
    state.view = 'week';
    el('btn-week').classList.add('view-toggle__btn--active');
    el('btn-day').classList.remove('view-toggle__btn--active');
    refresh();
  });

  // ── Init ───────────────────────────────────────────
  loadAuth();
  refresh();

})();
