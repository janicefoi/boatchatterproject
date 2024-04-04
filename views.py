from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm
from .models import UserProfile, Customer, Boat, Booking
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from dateutil import parser
import requests
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
import datetime
import base64
from django.core.mail import send_mail
from django.template.loader import render_to_string



def home(request):
    return render(request, 'home.html')

def about_us(request):
    return render(request, 'about_us.html')

def contact_us(request):
    return render(request, 'contact_us.html')

def dashboard(request):
    boats = Boat.objects.all()
    return render(request, 'dashboard.html', {'boats': boats})

def registration(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            customer = Customer(user=user, email=user.email)
            customer.save()
            login(request, user)
            print("User registered and logged in successfully.")
            return redirect('dashboard')
        else:
            print("Form is not valid. Errors:", form.errors)
    else:
        form = CustomUserCreationForm()

    return render(request, 'registration.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('dashboard')
    else:
        form = AuthenticationForm()

    return render(request, 'login.html', {'form': form})

@csrf_exempt
@require_POST
@login_required
def book_boat_api(request, boat_id, user_id, selected_date):
    try:
        boat = Boat.objects.get(pk=boat_id)
        user = UserProfile.objects.get(pk=user_id)

        boat.availability = False
        boat.booking_date = selected_date
        boat.save()

        booking = Booking.objects.create(boat=boat, user=user, selected_date=selected_date)
        booking_id = booking.id

        return JsonResponse({'message': 'Booking successful', 'booking_id': booking_id})
    except Boat.DoesNotExist:
        return JsonResponse({'error': 'Boat not found'}, status=404)
    except UserProfile.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



def booking_details(request, booking_id):
    booking = Booking.objects.get(pk=booking_id)
    return render(request, 'booking_details.html', {'booking': booking, 'boat': booking.boat})



def check_availability(request, boat_id):
    boat = get_object_or_404(Boat, pk=boat_id)

    # Get the selected date from the query parameters
    selected_date_str = request.GET.get('date')

    if not selected_date_str:
        return JsonResponse({'error': 'Please provide a valid date parameter.'}, status=400)

    try:
        # Parse the date string into a datetime object
        selected_date = parser.parse(selected_date_str).date()
    except ValueError:
        return JsonResponse({'error': 'Invalid date format.'}, status=400)

    # Check if the boat is available on the selected date
    is_available = boat.is_available_on_date(selected_date)

    return JsonResponse({'is_available': is_available})


@csrf_exempt
@require_POST
def initiate_mpesa_payment(request):
    try:
        json_data = json.loads(request.body)
        boat_price = json_data.get('boat_price')  
        phone_number = json_data.get('phone_number')
        mpesa_api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"


        business_short_code = "174379"
        lipa_na_mpesa_online_passkey ="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"


        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        password = base64.b64encode((business_short_code + lipa_na_mpesa_online_passkey + timestamp).encode('utf-8')).decode('utf-8')
        payload = {
            "BusinessShortCode": int(business_short_code),
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(boat_price),
            "PartyA": int(phone_number),
            "PartyB": int(business_short_code),
            "PhoneNumber": int(phone_number),
            "CallBackURL": "https://43cd-197-237-244-121.ngrok-free.app/mpesa-callback",
            "AccountReference": "BoatBooking",
            "TransactionDesc": "Boat Booking",
        }

        headers = {
                'Content-Type': 'application/json',
                 'Authorization': 'Bearer 8oXopv4OrAToUwvAdEtjk0bC4QCA'
        }

        print("Mpesa Request Body:", json.dumps(payload))

        response = requests.post(mpesa_api_url, json=payload, headers=headers)
        print("Mpesa Response:", response.text)

        response_data = response.json()
        return JsonResponse(response_data)

    except Exception as e:
        return JsonResponse({"error": str(e)})
    
def check_payment_status(request, booking_id):
    booking = get_object_or_404(Booking, id=booking_id)
    data = {'status': booking.status} 
    return JsonResponse(data)

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def mpesa_callback(request):
    if request.method == 'POST':
        try:
            # Parse the JSON data from the request body
            data = json.loads(request.body)

            # Extract relevant information from the result body
            response_code = data.get('ResponseCode')
            customer_message = data.get('CustomerMessage')

            # Process the Mpesa callback data here based on the extracted information
            if response_code == '0' and customer_message.lower().startswith('success'):
                # Payment was successful, update your database accordingly
                # For example, you can retrieve the booking ID from the callback data
                # and update the booking status to 'confirmed'
                booking_id = data.get('booking_id')
                update_booking_status(booking_id, 'confirmed')

                # Return a success response
                return JsonResponse({'status': 'success'})
            else:
                # Payment was unsuccessful or cancelled, handle accordingly
                return JsonResponse({'status': 'failure'})
        except json.JSONDecodeError:
            # Return an error response if JSON decoding fails
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    else:
        # Return a method not allowed response for non-POST requests
        return JsonResponse({'error': 'Method not allowed'}, status=405)


@csrf_exempt
@require_POST
def update_booking_status(request):
    try:
        json_data = json.loads(request.body)

        # Get the booking ID from the JSON data
        booking_id = json_data.get('booking_id')

        # Update the booking status to 'confirmed'
        booking = Booking.objects.get(id=booking_id)
        booking.status = 'confirmed'
        booking.save()

        return JsonResponse({'message': 'Booking status updated to confirmed', 'status': 'confirmed'})

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def category_items_view(request, category):
    category_items = Boat.objects.filter(category=category)
    context = {
        'category_items': category_items,
    }
    return render(request, 'category_items.html', context)


def send_booking_confirmation_email(request, booking_id):
    try:
        booking = Booking.objects.get(id=booking_id)
        user_email = booking.user.email
        
        # Render the email template with booking details
        email_subject = 'Booking Confirmation'
        email_body = render_to_string('booking_confirmation_email.html', {'booking': booking})
        
        # Send the email
        send_mail(email_subject, email_body, 'your_email@example.com', [user_email])
        
        return render(request, 'booking_confirmation_sent.html') 
    except Booking.DoesNotExist:
        return render(request, 'booking_not_found.html')  
