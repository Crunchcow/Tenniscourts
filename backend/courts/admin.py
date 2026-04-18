from django.contrib import admin
from django.utils.html import format_html
from .models import Court, TimeBlock, Booking


@admin.register(Court)
class CourtAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'is_active', 'description']
    list_editable = ['order', 'is_active']
    ordering = ['order']


@admin.register(TimeBlock)
class TimeBlockAdmin(admin.ModelAdmin):
    list_display = ['court', 'title', 'block_type', 'start_datetime', 'end_datetime', 'created_by']
    list_filter = ['court', 'block_type']
    ordering = ['-start_datetime']
    search_fields = ['title', 'note']
    list_select_related = ['court']

    fieldsets = [
        ('Platz & Typ', {
            'fields': ['court', 'block_type', 'title'],
        }),
        ('Zeitraum', {
            'fields': ['start_datetime', 'end_datetime'],
        }),
        ('Details', {
            'fields': ['note', 'created_by'],
        }),
    ]


STATUS_COLORS = {
    'confirmed': '#27ae60',
    'pending': '#f39c12',
    'cancelled': '#e74c3c',
}


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'court', 'booker_name', 'booker_email', 'booker_phone',
        'start_datetime', 'end_datetime', 'colored_status', 'created_at',
    ]
    list_filter = ['court', 'status']
    ordering = ['-start_datetime']
    search_fields = ['booker_name', 'booker_email', 'booker_phone']
    readonly_fields = ['cancellation_token', 'created_at']
    list_select_related = ['court']

    fieldsets = [
        ('Platz & Zeit', {
            'fields': ['court', 'start_datetime', 'end_datetime'],
        }),
        ('Bucher', {
            'fields': ['booker_name', 'booker_email', 'booker_phone', 'notes'],
        }),
        ('Status', {
            'fields': ['status', 'cancellation_token', 'created_at'],
        }),
    ]

    @admin.display(description='Status')
    def colored_status(self, obj):
        color = STATUS_COLORS.get(obj.status, '#999')
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display(),
        )


# Admin-Site Branding
admin.site.site_header = 'Tennisplatz-Buchung – Verwaltung'
admin.site.site_title = 'TC Westfalia Osterwick'
admin.site.index_title = 'Buchungsverwaltung'
