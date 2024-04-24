# Boat Chatter Project

The **Boat Chatter Project** is a web application built using the Django framework and PostgreSQL database. It facilitates the booking of boats for various purposes, providing users with a seamless experience from boat selection to payment confirmation.

## Features

- **User Registration and Authentication**: Users can register for an account and log in securely to access the booking features.
- **Boat Management**: Boats can be easily added and managed through the Django admin interface. Each boat can have a name, description, price, image, category, brand, availability status, accommodation capacity, and booking date.
- **Category-based Navigation**: Boats are divided into categories such as Fishing Boats, Sail Boats, and Yachts. Users can browse through these categories to find the boat that suits their needs.
- **Dashboard Representation**: The dashboard displays boats in an item card format, showcasing boat details, images, and a "Rent Per Day" button for easy access.
- **Booking Process**: When a user selects the "Rent Per Day" option, they are prompted to choose a booking date. The system checks the availability of the selected boat for the chosen date. If available, the user proceeds to the booking page.
- **Payment Integration**: Payment methods include Mpesa, with Daraja API integration for seamless transactions. Users input their Mpesa number and receive a prompt with the booking price. Upon successful payment confirmation, the booking status is updated to "confirmed."
- **Email Notifications**: Users receive booking confirmation emails, providing assurance and details about their confirmed bookings.

![Screenshot 1](/Screenshot%202024-04-15%20at%2009.10.08.png)
![Screenshot 2](/Screenshot%202024-04-15%20at%2009.10.15.png)
![Screenshot 3](/Screenshot%202024-04-23%20at%2009.28.01.png)
![Screenshot 4](/Screenshot%202024-04-15%20at%2009.10.22.png)
![Screenshot 5](/Screenshot%202024-04-15%20at%2009.11.18.png)
![Screenshot 6](/Screenshot%202024-04-15%20at%2009.11.37.png)
![Screenshot 7](/Screenshot%202024-04-15%20at%2009.11.49.png)
![Screenshot 8](/Screenshot%202024-04-15%20at%2009.11.52.png)
![Screenshot 9](/Screenshot%202024-04-15%20at%2009.12.13.png)
## Technologies Used

- **Framework**: Django
- **Database**: PostgreSQL

## Installation

1. Clone the repository.
2. Install dependencies using `pip install -r requirements.txt`.
3. Set up the PostgreSQL database and configure the `settings.py` file with the database credentials.
4. Run migrations using `python manage.py migrate`.
5. Create a superuser using `python manage.py createsuperuser`.
6. Run the development server with `python manage.py runserver`.

## Usage

1. Access the Django admin interface at `http://localhost:8000/admin` to add boats and manage users.
2. Explore the website and select a boat category to view available boats.
3. Click on the "Rent Per Day" button to initiate the booking process.
4. Follow the prompts to select a booking date and complete the payment process.
5. Receive a booking confirmation email upon successful payment.

## Contributors

- [Janice Wambui](https://github.com/janicefoi)

## License

This project is licensed under the [MIT License](LICENSE).

