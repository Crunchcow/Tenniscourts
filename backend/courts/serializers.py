from rest_framework import serializers
from django.conf import settings
from .models import Court, TimeBlock, Booking


class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Court
        fields = ['id', 'name', 'description']


class TimeBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeBlock
        fields = ['id', 'court', 'title', 'block_type', 'start_datetime', 'end_datetime', 'note', 'created_by']

    def validate(self, data):
        start = data.get('start_datetime')
        end = data.get('end_datetime')
        if start and end and end <= start:
            raise serializers.ValidationError('Das Ende muss nach dem Beginn liegen.')
        return data


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = [
            'id', 'court', 'booker_name', 'booker_email', 'booker_phone',
            'start_datetime', 'end_datetime', 'notes',
        ]

    def validate(self, data):
        start = data.get('start_datetime')
        end = data.get('end_datetime')
        court = data.get('court')

        if not all([start, end, court]):
            return data

        MIN_HOUR = settings.BOOKING_MIN_START_HOUR
        MAX_HOUR = settings.BOOKING_MAX_END_HOUR
        MAX_DUR = settings.BOOKING_MAX_DURATION_MINUTES
        MIN_DUR = settings.BOOKING_MIN_DURATION_MINUTES

        # Zeitfenster prüfen
        if start.hour < MIN_HOUR or (start.hour == MIN_HOUR and start.minute < 0):
            raise serializers.ValidationError(
                f'Buchungen sind frühestens ab {MIN_HOUR:02d}:00 Uhr möglich.'
            )

        end_total_minutes = end.hour * 60 + end.minute
        if end_total_minutes > MAX_HOUR * 60:
            raise serializers.ValidationError(
                f'Buchungen müssen bis spätestens {MAX_HOUR:02d}:00 Uhr enden.'
            )

        # Dauer prüfen
        duration = int((end - start).total_seconds() / 60)
        if duration <= 0:
            raise serializers.ValidationError('Das Ende muss nach dem Beginn liegen.')
        if duration < MIN_DUR:
            raise serializers.ValidationError(
                f'Eine Buchung muss mindestens {MIN_DUR} Minuten dauern.'
            )
        if duration > MAX_DUR:
            raise serializers.ValidationError(
                f'Eine Buchung darf maximal {MAX_DUR} Minuten dauern.'
            )

        # Überschneidung mit anderen Buchungen
        overlapping = Booking.objects.filter(
            court=court,
            status__in=['confirmed', 'pending'],
            start_datetime__lt=end,
            end_datetime__gt=start,
        )
        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)
        if overlapping.exists():
            raise serializers.ValidationError(
                'Dieser Zeitraum ist auf diesem Platz bereits gebucht.'
            )

        # Überschneidung mit Sperrzeiten
        blocking = TimeBlock.objects.filter(
            court=court,
            start_datetime__lt=end,
            end_datetime__gt=start,
        )
        if blocking.exists():
            block = blocking.first()
            raise serializers.ValidationError(
                f'Dieser Zeitraum ist durch "{block.title}" belegt.'
            )

        return data


class BookingAdminSerializer(serializers.ModelSerializer):
    """Serializer für Admin-Ansicht mit mehr Feldern."""
    court_name = serializers.CharField(source='court.name', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'court', 'court_name', 'booker_name', 'booker_email',
            'booker_phone', 'start_datetime', 'end_datetime', 'status',
            'notes', 'created_at',
        ]
