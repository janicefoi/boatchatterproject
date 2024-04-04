from django.urls import path
from . import views
from .views import check_availability, book_boat_api, initiate_mpesa_payment, send_booking_confirmation_email


urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about_us, name='about_us'), 
    path('contact/', views.contact_us, name='contact_us'),
    path('login/', views.user_login, name='login'),  
    path('register/', views.registration, name='registration'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('api/check_availability/<int:boat_id>/', check_availability, name='check_availability'),
    path('api/book_boat/<int:boat_id>/<int:user_id>/<str:selected_date>/', book_boat_api, name='book_boat_api'),
    path('booking_details/<int:booking_id>/', views.booking_details, name='booking_details'),
    path('initiate_mpesa_payment/', initiate_mpesa_payment, name='initiate_mpesa_payment'),
    path('update_booking_status/', views.update_booking_status, name='update_booking_status'),
    path('check_payment_status/<int:booking_id>/', views.check_payment_status, name='check_payment_status'),
    path('category/<str:category>/', views.category_items_view, name='category_items'),
    path('send-booking-confirmation/<int:booking_id>/', send_booking_confirmation_email, name='send_booking_confirmation_email'),
    path('mpesa-callback/', views.mpesa_callback, name='mpesa_callback'),
]

