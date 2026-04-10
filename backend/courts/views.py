import datetime
import secrets
import urllib.parse
import zoneinfo
import logging

import requests as http_requests
from django.conf import settings
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.http import HttpResponseForbidden, HttpResponseRedirect, JsonResponse
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Court, TimeBlock, Booking
from .serializers import (
    CourtSerializer,
    TimeBlockSerializer,
    BookingSerializer,
    BookingAdminSerializer,
)
from .email_utils import send_booking_confirmation, send_booking_cancellation

logger = logging.getLogger(__name__)

LOCAL_TZ = zoneinfo.ZoneInfo(settings.TIME_ZONE)


def _make_aware(d: datetime.date, t: datetime.time) -> datetime.datetime:
    """Combines date + time and makes the result timezone-aware (Europe/Berlin)."""
    return datetime.datetime.combine(d, t).replace(tzinfo=LOCAL_TZ)


def _oidc_configured():
    return bool(getattr(settings, 'OIDC_CLIENT_ID', ''))


def _admin_required(request) -> bool:
    """Prüft OIDC-Session (bevorzugt) oder Legacy X-Admin-Token."""
    # OIDC-Session-Check
    if request.session.get('oidc_admin', False):
        return True
    # Legacy-Fallback: statisches Token (für Übergangszeit)
    token = request.headers.get('X-Admin-Token', '')
    if token and token == settings.ADMIN_API_TOKEN:
        return True
    return False


# ── OIDC-Endpunkte ───────────────────────────────────────────────────────────

def oidc_login(request):
    """Leitet zur ClubAuth Authorisierungs-URL weiter."""
    if not _oidc_configured():
        return JsonResponse({'error': 'OIDC nicht konfiguriert.'}, status=503)
    state = secrets.token_urlsafe(32)
    request.session['oidc_state'] = state
    params = urllib.parse.urlencode({
        'response_type': 'code',
        'client_id': settings.OIDC_CLIENT_ID,
        'redirect_uri': settings.OIDC_REDIRECT_URI,
        'scope': 'openid profile email roles',
        'state': state,
    })
    return redirect(f"{settings.OIDC_BASE_URL}/o/authorize/?{params}")


def oidc_callback(request):
    """Empfängt OIDC Code, validiert Rolle, setzt Session."""
    code = request.GET.get('code', '')
    state = request.GET.get('state', '')
    if not code or state != request.session.get('oidc_state'):
        return redirect('/admin/?error=invalid_state')

    _internal = getattr(settings, 'OIDC_INTERNAL_URL', '') or settings.OIDC_BASE_URL
    try:
        resp = http_requests.post(
            f"{_internal}/o/token/",
            data={
                'grant_type': 'authorization_code',
                'code': code,
                'redirect_uri': settings.OIDC_REDIRECT_URI,
                'client_id': settings.OIDC_CLIENT_ID,
                'client_secret': settings.OIDC_CLIENT_SECRET,
            },
            timeout=10,
        )
    except Exception:
        return redirect('/admin/?error=token_exchange')

    if resp.status_code != 200:
        return redirect('/admin/?error=token_exchange')

    access_token = resp.json().get('access_token', '')
    try:
        info = http_requests.get(
            f"{_internal}/o/userinfo/",
            headers={'Authorization': f'Bearer {access_token}'},
            timeout=10,
        )
    except Exception:
        return redirect('/admin/?error=userinfo')

    if info.status_code != 200:
        return redirect('/admin/?error=userinfo')

    claims = info.json()
    app_roles = claims.get('roles', {}).get('tenniscourts', {})
    role = app_roles.get('role', '')

    request.session['oidc_authenticated'] = True
    request.session['oidc_email'] = claims.get('email', '')
    request.session['oidc_name'] = claims.get('name', '')
    request.session.pop('oidc_state', None)

    request.session['oidc_admin'] = role in ('admin', 'verwaltung')
    return redirect('/')


def oidc_status(request):
    """Liefert den aktuellen Auth-Status als JSON."""
    if request.session.get('oidc_authenticated', False) or _admin_required(request):
        return JsonResponse({
            'authenticated': True,
            'email': request.session.get('oidc_email', ''),
            'name': request.session.get('oidc_name', ''),
            'is_admin': request.session.get('oidc_admin', False),
        })
    return JsonResponse({'authenticated': False}, status=401)


def oidc_logout(request):
    """Löscht die OIDC-Session."""
    request.session.flush()
    return redirect('/')


# ---------------------------------------------------------------------------
# Public endpoints
# ---------------------------------------------------------------------------

class CourtListView(generics.ListAPIView):
    queryset = Court.objects.filter(is_active=True)
    serializer_class = CourtSerializer


class DayScheduleView(APIView):
    """Tagesplan für alle aktiven Plätze (öffentlich)."""

    def get(self, request):
        date_str = request.query_params.get('date')
        if date_str:
            try:
                date = datetime.date.fromisoformat(date_str)
            except ValueError:
                return Response({'error': 'Ungültiges Datum. Format: YYYY-MM-DD'}, status=400)
        else:
            date = datetime.date.today()

        day_start = _make_aware(date, datetime.time.min)
        day_end = _make_aware(date, datetime.time.max)

        courts = Court.objects.filter(is_active=True)
        result = []

        for court in courts:
            bookings = Booking.objects.filter(
                court=court,
                status__in=['confirmed', 'pending'],
                start_datetime__lt=day_end,
                end_datetime__gt=day_start,
            ).order_by('start_datetime')

            blocks = TimeBlock.objects.filter(
                court=court,
                start_datetime__lt=day_end,
                end_datetime__gt=day_start,
            ).order_by('start_datetime')

            slots = []

            for b in bookings:
                local_start = b.start_datetime.astimezone(LOCAL_TZ)
                local_end = b.end_datetime.astimezone(LOCAL_TZ)
                slots.append({
                    'type': 'booking',
                    'id': b.id,
                    'start': local_start.strftime('%H:%M'),
                    'end': local_end.strftime('%H:%M'),
                    'start_minutes': local_start.hour * 60 + local_start.minute,
                    'end_minutes': local_end.hour * 60 + local_end.minute,
                    'booker_name': b.booker_name,
                    'status': b.status,
                })

            for bl in blocks:
                local_start = bl.start_datetime.astimezone(LOCAL_TZ)
                local_end = bl.end_datetime.astimezone(LOCAL_TZ)
                slots.append({
                    'type': 'block',
                    'id': bl.id,
                    'start': local_start.strftime('%H:%M'),
                    'end': local_end.strftime('%H:%M'),
                    'start_minutes': local_start.hour * 60 + local_start.minute,
                    'end_minutes': local_end.hour * 60 + local_end.minute,
                    'title': bl.title,
                    'block_type': bl.block_type,
                    'note': bl.note,
                })

            slots.sort(key=lambda s: s['start_minutes'])

            result.append({
                'id': court.id,
                'name': court.name,
                'description': court.description,
                'slots': slots,
            })

        return Response({'date': str(date), 'courts': result})


class WeekOverviewView(APIView):
    """Kompakte Wochenübersicht (zeigt nur ob Belegungen vorhanden sind)."""

    def get(self, request):
        date_str = request.query_params.get('start')
        if date_str:
            try:
                start_date = datetime.date.fromisoformat(date_str)
            except ValueError:
                return Response({'error': 'Ungültiges Datum. Format: YYYY-MM-DD'}, status=400)
        else:
            today = datetime.date.today()
            start_date = today - datetime.timedelta(days=today.weekday())

        courts = Court.objects.filter(is_active=True)
        days = []

        for i in range(7):
            current = start_date + datetime.timedelta(days=i)
            day_start = _make_aware(current, datetime.time.min)
            day_end = _make_aware(current, datetime.time.max)

            court_data = []
            for court in courts:
                has_activity = (
                    Booking.objects.filter(
                        court=court,
                        status__in=['confirmed', 'pending'],
                        start_datetime__lt=day_end,
                        end_datetime__gt=day_start,
                    ).exists()
                    or TimeBlock.objects.filter(
                        court=court,
                        start_datetime__lt=day_end,
                        end_datetime__gt=day_start,
                    ).exists()
                )
                court_data.append({'id': court.id, 'name': court.name, 'has_activity': has_activity})

            days.append({'date': str(current), 'courts': court_data})

        return Response({'start': str(start_date), 'days': days})


class BookingCreateView(generics.CreateAPIView):
    """Buchung erstellen – Login über ClubAuth erforderlich."""
    serializer_class = BookingSerializer

    def create(self, request, *args, **kwargs):
        if not (request.session.get('oidc_authenticated') or _admin_required(request)):
            return Response({'error': 'Login erforderlich.', 'login_url': '/api/auth/login/'}, status=401)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        booking_status = (
            Booking.Status.PENDING if settings.APPROVAL_REQUIRED else Booking.Status.CONFIRMED
        )
        booking = serializer.save(status=booking_status)
        try:
            send_booking_confirmation(booking)
        except Exception:
            logger.exception('E-Mail-Versand nach Buchung fehlgeschlagen.')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        instance = serializer.instance
        data = serializer.data
        data['cancellation_token'] = str(instance.cancellation_token)
        data['status'] = instance.status
        data['id'] = instance.id
        return Response(data, status=status.HTTP_201_CREATED)


class BookingCancelView(APIView):
    """Buchung per Token stornieren (öffentlich)."""

    def post(self, request, token):
        booking = get_object_or_404(Booking, cancellation_token=token)
        if booking.status == Booking.Status.CANCELLED:
            return Response({'error': 'Diese Buchung ist bereits storniert.'}, status=400)
        booking.status = Booking.Status.CANCELLED
        booking.save()
        try:
            send_booking_cancellation(booking)
        except Exception:
            logger.exception('E-Mail-Versand nach Stornierung fehlgeschlagen.')
        return Response({'message': 'Buchung erfolgreich storniert.'})


class BookingDetailPublicView(APIView):
    """Buchungsdetails per Token abrufen (für Stornierungsseite)."""

    def get(self, request, token):
        booking = get_object_or_404(Booking, cancellation_token=token)
        local_start = booking.start_datetime.astimezone(LOCAL_TZ)
        local_end = booking.end_datetime.astimezone(LOCAL_TZ)
        return Response({
            'id': booking.id,
            'court': booking.court.name,
            'booker_name': booking.booker_name,
            'date': local_start.strftime('%d.%m.%Y'),
            'start': local_start.strftime('%H:%M'),
            'end': local_end.strftime('%H:%M'),
            'status': booking.status,
        })


# ---------------------------------------------------------------------------
# Admin endpoints (require X-Admin-Token header)
# ---------------------------------------------------------------------------

class AdminBookingListView(APIView):
    def get(self, request):
        if not _admin_required(request):
            return Response({'error': 'Nicht autorisiert.'}, status=401)
        date_str = request.query_params.get('date')
        qs = Booking.objects.select_related('court').order_by('-created_at')
        if date_str:
            try:
                date = datetime.date.fromisoformat(date_str)
                day_start = _make_aware(date, datetime.time.min)
                day_end = _make_aware(date, datetime.time.max)
                qs = qs.filter(start_datetime__lt=day_end, end_datetime__gt=day_start)
            except ValueError:
                return Response({'error': 'Ungültiges Datum.'}, status=400)
        serializer = BookingAdminSerializer(qs, many=True)
        return Response(serializer.data)

    def patch(self, request, pk=None):
        if not _admin_required(request):
            return Response({'error': 'Nicht autorisiert.'}, status=401)
        booking = get_object_or_404(Booking, pk=pk)
        new_status = request.data.get('status')
        if new_status not in [s[0] for s in Booking.Status.choices]:
            return Response({'error': 'Ungültiger Status.'}, status=400)
        booking.status = new_status
        booking.save()
        return Response(BookingAdminSerializer(booking).data)


class AdminBookingDetailView(APIView):
    def patch(self, request, pk):
        if not _admin_required(request):
            return Response({'error': 'Nicht autorisiert.'}, status=401)
        booking = get_object_or_404(Booking, pk=pk)
        new_status = request.data.get('status')
        if new_status not in [s[0] for s in Booking.Status.choices]:
            return Response({'error': 'Ungültiger Status.'}, status=400)
        booking.status = new_status
        booking.save()
        if new_status == 'cancelled':
            try:
                send_booking_cancellation(booking)
            except Exception:
                pass
        return Response(BookingAdminSerializer(booking).data)


class AdminBlockListView(APIView):
    def get(self, request):
        if not _admin_required(request):
            return Response({'error': 'Nicht autorisiert.'}, status=401)
        start_str = request.query_params.get('start')
        end_str = request.query_params.get('end')
        qs = TimeBlock.objects.select_related('court').order_by('start_datetime')
        if start_str:
            try:
                s = datetime.date.fromisoformat(start_str)
                qs = qs.filter(end_datetime__gte=_make_aware(s, datetime.time.min))
            except ValueError:
                pass
        if end_str:
            try:
                e = datetime.date.fromisoformat(end_str)
                qs = qs.filter(start_datetime__lte=_make_aware(e, datetime.time.max))
            except ValueError:
                pass
        return Response(TimeBlockSerializer(qs, many=True).data)

    def post(self, request):
        if not _admin_required(request):
            return Response({'error': 'Nicht autorisiert.'}, status=401)
        serializer = TimeBlockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminBlockDetailView(APIView):
    def delete(self, request, pk):
        if not _admin_required(request):
            return Response({'error': 'Nicht autorisiert.'}, status=401)
        block = get_object_or_404(TimeBlock, pk=pk)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
