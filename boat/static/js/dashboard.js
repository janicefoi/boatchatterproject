document.addEventListener('DOMContentLoaded', function () {
    var rentButtons = document.querySelectorAll('.rent-per-day-btn');
    var currentPicker = null; // Store the current picker to prevent closing when clicking inside

    rentButtons.forEach(function (button) {
        button.addEventListener('mousedown', function (event) {
            event.preventDefault();
            var boatId = this.getAttribute('data-boat-id');
            var userId = this.getAttribute('data-userprofile-id');
            showDatePicker(boatId, userId, button);
        });
    });

    function showDatePicker(boatId, userId, button) {
        var inputField = document.getElementById('datepicker-input-' + boatId);

        // Check if a picker already exists
        if (!currentPicker) {
            // If not, create a new one
            currentPicker = new Pikaday({
                field: inputField,
                format: 'YYYY-MM-DD',
                minDate: new Date(),
                onSelect: function (date) {
                    var formattedDate = moment(date).format('YYYY-MM-DD');
                    console.log(formattedDate);

                    console.log('User:', userId);
                    console.log('Boat:', boatId);
                    console.log('Selected Date:', formattedDate);

                    // Delay the hiding of the picker to allow the user to continue
                    setTimeout(function () {
                        currentPicker.hide();
                    }, 1000);
                },
                onDraw: function () {
                    var bookNowButton = document.createElement('button');
                    bookNowButton.textContent = 'Book Now';
                    bookNowButton.addEventListener('click', function (event) {
                        Swal.fire({
                            title: 'Confirm Booking',
                            text: 'Are you sure you want to book now?',
                            icon: 'question',
                            showCancelButton: true,
                            confirmButtonText: 'Yes, book it!',
                            cancelButtonText: 'Cancel'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                console.log('Booking Now...');
                                bookNow(boatId, userId, currentPicker.toString());
                                event.stopPropagation();
                            }
                        });
                    });

                    var monthContainer = currentPicker.el.querySelector('.pika-lendar');
                    monthContainer.appendChild(bookNowButton);
                }
            });
        }

        // Show the picker
        currentPicker.show();

        var rect = button.getBoundingClientRect();
        currentPicker.el.style.top = rect.bottom + window.scrollY + 'px';
        currentPicker.el.style.left = rect.left + window.scrollX + 'px';
    }

    function bookNow(boatId, userId, selectedDate) {
        var url = '/api/book_boat/' + boatId + '/' + userId + '/' + selectedDate + '/';
        fetch(url, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                console.log('Booking response:', data);
                // Handle success or show a confirmation message to the user
                if (data.booking_id !== undefined) {
                    Swal.fire('Booking Successful', 'Your boat has been booked!', 'success');
                    window.location.href = '/booking_details/' + data.booking_id + '/';
                } else {
                    Swal.fire('Booking Failed', 'There was an error in the booking process.', 'error');
                }
            })
            .catch(error => {
                console.error('Error booking boat:', error);
                Swal.fire('Booking Failed', 'There was an error in the booking process.', 'error');
            });
    }     
       
});


document.addEventListener('DOMContentLoaded', function () {
    const searchBar = document.querySelector('.navbar-search input');
    const itemContainer = document.querySelector('.item-container');

    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();

        // Loop through each item card and check if it matches the search term
        document.querySelectorAll('.item-card').forEach(function (itemCard) {
            const itemName = itemCard.querySelector('.item-name').textContent.toLowerCase();

            if (itemName.includes(searchTerm)) {
                itemCard.style.display = 'block';
            } else {
                itemCard.style.display = 'none';
            }
        });
    });
});




