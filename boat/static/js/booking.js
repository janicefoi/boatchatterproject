document.addEventListener('DOMContentLoaded', function () {

    // Add an event listener to the "Pay Now" button
    document.getElementById('payNowButton').addEventListener('click', function (event) {
        event.preventDefault();

        var mpesaOption = document.getElementById('mpesa');
        if (mpesaOption.checked) {
            initiateMpesaPayment();
        } else {
            console.log('Other payment method selected');
        }
    });

    // Function to initiate Mpesa payment
    function initiateMpesaPayment() {
        // Get the boat price, user's phone number, and booking ID from your page
        var boatPrice = parseFloat(document.getElementById('boat-price').textContent); // Adjust as needed
        var phoneNumber = document.getElementById('mpesa-phone-number').value; // Adjust as needed
        var bookingId = document.getElementById('booking-id').value; // Adjust as needed

        // Log values for debugging
        console.log('Boat Price:', boatPrice);
        console.log('Phone Number:', phoneNumber);

        // Display a message box to inform the user about the Mpesa payment initiation
        var initiatedMsg = Swal.fire({
            title: 'Mpesa Payment Initiated',
            text: 'The Mpesa payment process has been started. Please check your phone for a payment request and enter your Mpesa pin.',
            icon: 'info',
            confirmButtonText: 'OK',
            showConfirmButton: false, // Hide the confirm button initially
            allowOutsideClick: false // Prevent the user from dismissing the dialog by clicking outside
        });

        // Create a JSON object to send JSON data
        var jsonData = {
            boat_price: boatPrice,
            phone_number: phoneNumber,
            booking_id: bookingId,
        };

        // Make an AJAX request to your Django view that initiates Mpesa payment
        fetch('/initiate_mpesa_payment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Set content type to JSON
            },
            body: JSON.stringify(jsonData),
        })
        .then(response => response.json())
        .then(data => {
            // Handle the response from Mpesa API
            handleMpesaResponse(data, bookingId);
        })
        .catch(error => {
            console.error('Error initiating Mpesa payment:', error);
            // Handle the error (e.g., inform the user or log for debugging)
        });
    }

    function handleMpesaResponse(data, bookingId) {
        console.log('Mpesa payment initiation response:', data);
    
        // Delay showing the success or error message for 20 seconds
        setTimeout(() => {
            if (data.ResponseCode == 0) {
                Swal.fire({
                    title: 'Payment Successful',
                    text: 'Your payment was successful. Your booking is now confirmed.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                });
    
                console.log('Booking ID:', bookingId);
                updateBookingStatusAndSendEmail(bookingId, 'confirmed');
            } else {
                // Display an error message to the user
                Swal.fire({
                    title: 'Payment Unsuccessful',
                    text: 'Your payment was unsuccessful or cancelled. Your booking could not be confirmed.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
    
                // Update booking status to 'cancelled' or 'pending' based on your business logic
                console.log('Booking ID:', bookingId); // Add this line
                updateBookingStatus(bookingId, 'cancelled'); // Change 'cancelled' or 'pending' based on your business logic
            }
        }, 20000); // Delay for 20 seconds
    }
    
    function updateBookingStatusAndSendEmail(bookingId, status) {
        // Make an AJAX request to update the booking status
        fetch('/update_booking_status/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                booking_id: bookingId,
                status: status,
            }),
        })
        .then(response => response.json())
        .then(data => {
            // Check if booking status update was successful
            if (data.success) {
                // If successful, send the booking confirmation email
                sendBookingConfirmationEmail(bookingId);
            } else {
                console.error('Error updating booking status:', data.message);
                // Handle the error (e.g., inform the user or log for debugging)
            }
        })
        .catch(error => {
            console.error('Error updating booking status:', error);
            // Handle the error (e.g., inform the user or log for debugging)
        });
    }
    
    function sendBookingConfirmationEmail(bookingId) {
        fetch('/send_booking_confirmation_email/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({
                booking_id: bookingId,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from send_booking_confirmation_email:', data);
        })
        .catch(error => {
            console.error('Error sending booking confirmation email:', error);
        });

    }
                 

    // Function to get CSRF token from cookies
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});
