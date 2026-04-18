from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from courts.models import Court
import os


class Command(BaseCommand):
    help = 'Legt die 3 Tennisplätze und einen Admin-User an (falls nicht vorhanden).'

    def handle(self, *args, **options):
        courts = [
            {'name': 'Platz 1', 'order': 1, 'description': 'Trainingsplatz'},
            {'name': 'Platz 2', 'order': 2, 'description': 'Trainingsplatz'},
            {'name': 'Platz 3', 'order': 3, 'description': 'Trainingsplatz'},
        ]
        for data in courts:
            court, created = Court.objects.get_or_create(
                name=data['name'],
                defaults={'order': data['order'], 'description': data['description']},
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Platz erstellt: {court.name}'))
            else:
                self.stdout.write(f'Platz existiert bereits: {court.name}')

        User = get_user_model()
        admin_password = os.environ.get('ADMIN_PASSWORD', 'tennis-admin-2024')
        admin_email = os.environ.get('ADMIN_EMAIL', 'Lemke@westfalia-osterwick.de')

        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email=admin_email,
                password=admin_password,
            )
            self.stdout.write(self.style.SUCCESS(
                f'Admin-User erstellt: admin / {admin_password}'
            ))
        else:
            self.stdout.write('Admin-User existiert bereits.')

        self.stdout.write(self.style.SUCCESS('Setup abgeschlossen.'))
