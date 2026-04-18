import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def _local(dt):
    """Konvertiert in Europe/Berlin für E-Mail-Anzeige."""
    import zoneinfo
    return dt.astimezone(zoneinfo.ZoneInfo(settings.TIME_ZONE))


def send_booking_confirmation(booking):
    """Sendet Bestätigungs-E-Mail an Bucher und Benachrichtigung an Admin."""
    site_url = getattr(settings, 'SITE_URL', 'http://localhost:5173')
    cancel_url = f"{site_url}/stornieren/{booking.cancellation_token}"

    local_start = _local(booking.start_datetime)
    local_end = _local(booking.end_datetime)

    subject = f'Buchungsbestätigung – {booking.court.name}'
    message = (
        f"Hallo {booking.booker_name},\n\n"
        f"Ihre Buchung wurde erfolgreich bestätigt.\n\n"
        f"Platz:   {booking.court.name}\n"
        f"Datum:   {local_start:%d.%m.%Y}\n"
        f"Uhrzeit: {local_start:%H:%M} – {local_end:%H:%M} Uhr\n\n"
        f"Möchten Sie Ihre Buchung stornieren? Klicken Sie hier:\n"
        f"{cancel_url}\n\n"
        f"Bei Fragen wenden Sie sich an: {settings.ADMIN_EMAIL}\n\n"
        f"Mit freundlichen Grüßen\n"
        f"Tennisabteilung Westfalia Osterwick"
    )

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [booking.booker_email], fail_silently=False)

    # Admin-Benachrichtigung
    admin_msg = (
        f"Neue Buchung eingegangen:\n\n"
        f"Platz:       {booking.court.name}\n"
        f"Datum:       {local_start:%d.%m.%Y}\n"
        f"Uhrzeit:     {local_start:%H:%M} – {local_end:%H:%M} Uhr\n"
        f"Name:        {booking.booker_name}\n"
        f"E-Mail:      {booking.booker_email}\n"
        f"Telefon:     {booking.booker_phone or '–'}\n"
        f"Anmerkungen: {booking.notes or '–'}\n"
    )
    send_mail(
        f'[Tennis] Neue Buchung – {booking.court.name}',
        admin_msg,
        settings.DEFAULT_FROM_EMAIL,
        [settings.ADMIN_EMAIL],
        fail_silently=True,
    )


def send_booking_cancellation(booking):
    """Sendet Stornierungsbestätigung an Bucher und Benachrichtigung an Admin."""
    local_start = _local(booking.start_datetime)
    local_end = _local(booking.end_datetime)

    subject = f'Stornierungsbestätigung – {booking.court.name}'
    message = (
        f"Hallo {booking.booker_name},\n\n"
        f"Ihre Buchung wurde erfolgreich storniert.\n\n"
        f"Platz:   {booking.court.name}\n"
        f"Datum:   {local_start:%d.%m.%Y}\n"
        f"Uhrzeit: {local_start:%H:%M} – {local_end:%H:%M} Uhr\n\n"
        f"Mit freundlichen Grüßen\n"
        f"Tennisabteilung Westfalia Osterwick"
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [booking.booker_email], fail_silently=True)

    admin_msg = (
        f"Buchung storniert:\n\n"
        f"Platz:   {booking.court.name}\n"
        f"Datum:   {local_start:%d.%m.%Y}\n"
        f"Uhrzeit: {local_start:%H:%M} – {local_end:%H:%M} Uhr\n"
        f"Name:    {booking.booker_name} ({booking.booker_email})\n"
    )
    send_mail(
        f'[Tennis] Buchung storniert – {booking.court.name}',
        admin_msg,
        settings.DEFAULT_FROM_EMAIL,
        [settings.ADMIN_EMAIL],
        fail_silently=True,
    )
