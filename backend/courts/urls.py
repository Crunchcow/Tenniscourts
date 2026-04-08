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

    # OIDC Auth
    path('auth/login/', views.oidc_login, name='oidc-login'),
    path('auth/callback/', views.oidc_callback, name='oidc-callback'),
    path('auth/status/', views.oidc_status, name='oidc-status'),
    path('auth/logout/', views.oidc_logout, name='oidc-logout'),

    # Admin (OIDC-Session oder Legacy X-Admin-Token)
    path('admin/bookings/', views.AdminBookingListView.as_view(), name='admin-booking-list'),
    path('admin/bookings/<int:pk>/', views.AdminBookingDetailView.as_view(), name='admin-booking-detail'),
    path('admin/blocks/', views.AdminBlockListView.as_view(), name='admin-block-list'),
    path('admin/blocks/<int:pk>/', views.AdminBlockDetailView.as_view(), name='admin-block-detail'),
]
