from django.urls import path
from . import views

urlpatterns = [
    # Öffentlich
    path('courts/', views.CourtListView.as_view(), name='court-list'),
    path('schedule/', views.DayScheduleView.as_view(), name='day-schedule'),
    path('week/', views.WeekOverviewView.as_view(), name='week-overview'),
    path('bookings/', views.BookingCreateView.as_view(), name='booking-create'),
    path('bookings/<uuid:token>/cancel/', views.BookingCancelView.as_view(), name='booking-cancel'),
    path('bookings/<uuid:token>/detail/', views.BookingDetailPublicView.as_view(), name='booking-detail'),

    # Admin (X-Admin-Token required)
    path('admin/bookings/', views.AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/bookings/<int:pk>/', views.AdminBookingDetailView.as_view(), name='admin-booking-detail'),
    path('admin/blocks/', views.AdminBlockListView.as_view(), name='admin-block-list'),
    path('admin/blocks/<int:pk>/', views.AdminBlockDetailView.as_view(), name='admin-block-detail'),
]
