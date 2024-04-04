from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from datetime import date

class UserProfileManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user  
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)

class UserProfile(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    username = models.CharField(max_length=30, unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    location = models.CharField(max_length=400)
    phone_number = models.CharField(max_length=15)
    objects = UserProfileManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

class Customer(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE)  
    location = models.CharField(max_length=400)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(max_length=255)

    def __str__(self):
        return self.user.username


class Boat(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='jsh/product_images/')
    category = models.CharField(max_length=50, choices=[
        ('fishing', 'Fishing Boats'),
        ('sail', 'Sail Boats'),
        ('yacht', 'Yachts'),
    ])
    brand = models.CharField(max_length=255, default='JSH')
    availability = models.BooleanField(default=True)
    accommodation = models.PositiveIntegerField(default=1)
    booking_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.name

    def is_available_on_date(self, selected_date):
        return self.availability and (self.booking_date is None or self.booking_date != selected_date)

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
    ]

    boat = models.ForeignKey('Boat', on_delete=models.CASCADE)
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    selected_date = models.DateField(default=date.today)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    def __str__(self):
        return f"{self.boat.name} - {self.user.username} - {self.get_status_display()}"

    

 

class Review(models.Model):
    boat = models.ForeignKey(Boat, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    date_posted = models.DateTimeField(auto_now_add=True)
    

    def __str__(self):
        return f"Review by {self.customer.user.username} for {self.boat.name}"



