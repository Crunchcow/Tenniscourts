const BASE = '/api'

async function api(path, options = {}) {
  const res = await fetch(BASE + path, {
    credentials: 'include',
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw { status: res.status, data: err }
  }
  return res.json()
}

function getCsrf() {
  const m = document.cookie.match('(^|;)\\s*csrftoken\\s*=\\s*([^;]+)')
  return m ? m.pop() : ''
}

export const authStatus  = ()       => api('/auth/status/')
export const getSchedule = (date)   => api(`/schedule/?date=${date}`)
export const getWeek     = (start)  => api(`/week/?start=${start}`)

export const createBooking = (payload) =>
  api('/bookings/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-CSRFToken': getCsrf() },
    body: JSON.stringify(payload),
  })
