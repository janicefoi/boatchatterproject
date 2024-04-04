document.addEventListener('DOMContentLoaded', function () {

    // Add an event listener to the "Pay Now" button
    document.getElementById('payNowButton').addEventListener('click', function (event) {
        event.preventDefault();

        // Check if Mpesa is selected
        var mpesaOption = document.getElementById('mpesa');
        if (mpesaOption.checked) {
            initiateMpesaPayment();
        } else {
            // Handle other payment methods or show an error
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
        Swal.fire({
            title: 'Mpesa Payment Initiated',
            text: 'The Mpesa payment process has been started. Please check your phone for a payment request and enter your Mpesa pin.',
            icon: 'info',
            confirmButtonText: 'OK',
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
        // Log the response for debugging
        console.log('Mpesa payment initiation response:', data);
    
        // Display a dialog box based on the response
        if (data.ResponseCode === "0") {
            Swal.fire({
                title: 'Payment Successful',
                text: 'Your payment was successful. Your booking is now confirmed.',
                icon: 'success',
                confirmButtonText: 'OK',
            });
    
            // Update booking status to 'confirmed'
            updateBookingStatus(bookingId, 'confirmed'); // Change 'confirmed' here
        } else {
            Swal.fire({
                title: 'Booking Cancelled',
                text: 'Your payment was unsuccessful or cancelled. Your booking has been cancelled.',
                icon: 'error',
                confirmButtonText: 'OK',
            });
    
            // Update booking status to 'pending'
            updateBookingStatus(bookingId, 'pending'); // Change 'pending' here
        }
    }    
    
    function updateBookingStatus(bookingId, status) {
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
            console.log('Booking status update response:', data);
        })
        .catch(error => {
            console.error('Error updating booking status:', error);
            // Handle the error (e.g., inform the user or log for debugging)
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
