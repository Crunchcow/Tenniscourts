import uuid
from django.db import models
from django.core.exceptions import ValidationError


class Court(models.Model):
    name = models.CharField(max_length=50, verbose_name='Name')
    description = models.TextField(blank=True, verbose_name='Beschreibung')
    is_active = models.BooleanField(default=True, verbose_name='Aktiv')
    order = models.PositiveSmallIntegerField(default=0, verbose_name='Reihenfolge')

    # Slot-based booking configuration
    use_slots = models.BooleanField(default=False, verbose_name='Slot-Buchung aktiv')
    slot_duration_minutes = models.PositiveSmallIntegerField(default=60, verbose_name='Slot-Dauer (Minuten)')
    slot_start_time = models.TimeField(default='09:00', verbose_name='Erster Slot')
    slot_end_time = models.TimeField(default='20:00', verbose_name='Letzter Slot')

    class Meta:
        ordering = ['order', 'name']
        verbose_name = 'Platz'
        verbose_name_plural = 'Plätze'

    def __str__(self):
        return self.name


class BlockType(models.TextChoices):
    TRAINING = 'training', 'Training'
    MATCH = 'match', 'Spieltag'
    MAINTENANCE = 'maintenance', 'Platzsperrung'
    EVENT = 'event', 'Veranstaltung'


class TimeBlock(models.Model):
    """Administrativ verwaltete Sperrzeiten (Training, Spieltage, Wartung)."""

    court = models.ForeignKey(
        Court, on_delete=models.CASCADE, related_name='blocks', verbose_name='Platz'
    )
    title = models.CharField(max_length=100, verbose_name='Bezeichnung')
    block_type = models.CharField(
        max_length=20, choices=BlockType.choices, verbose_name='Typ'
    )
    start_datetime = models.DateTimeField(verbose_name='Beginn')
    end_datetime = models.DateTimeField(verbose_name='Ende')
    note = models.TextField(blank=True, verbose_name='Notiz')
    created_by = models.CharField(max_length=100, default='Verwaltung', verbose_name='Erstellt von')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_datetime']
        verbose_name = 'Sperrzeit'
        verbose_name_plural = 'Sperrzeiten'

    def __str__(self):
        return f"{self.court} – {self.title} ({self.start_datetime:%d.%m.%Y %H:%M})"

    def clean(self):
        if self.start_datetime and self.end_datetime:
            if self.end_datetime <= self.start_datetime:
                raise ValidationError('Das Ende muss nach dem Beginn liegen.')


class Booking(models.Model):
    """Öffentliche Platzbuchung durch Tennisspieler."""

    class Status(models.TextChoices):
        CONFIRMED = 'confirmed', 'Bestätigt'
        PENDING = 'pending', 'Ausstehend'      # Vorbereitet für Freigabe-Workflow
        CANCELLED = 'cancelled', 'Storniert'

    court = models.ForeignKey(
        Court, on_delete=models.CASCADE, related_name='bookings', verbose_name='Platz'
    )
    booker_name = models.CharField(max_length=100, verbose_name='Name')
    booker_email = models.EmailField(verbose_name='E-Mail')
    booker_phone = models.CharField(max_length=30, blank=True, verbose_name='Telefon')
    start_datetime = models.DateTimeField(verbose_name='Beginn')
    end_datetime = models.DateTimeField(verbose_name='Ende')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.CONFIRMED,
        verbose_name='Status',
    )
    cancellation_token = models.UUIDField(
        default=uuid.uuid4, unique=True, editable=False
    )
    notes = models.TextField(blank=True, verbose_name='Anmerkungen')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['start_datetime']
        verbose_name = 'Buchung'
        verbose_name_plural = 'Buchungen'

    def __str__(self):
        return f"{self.court} – {self.booker_name} ({self.start_datetime:%d.%m.%Y %H:%M})"

    @property
    def duration_minutes(self):
        return int((self.end_datetime - self.start_datetime).total_seconds() / 60)
