from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    kyc_verified = models.BooleanField(default=False)
    pan = models.CharField(max_length=10, blank=True, null=True)
    aadhaar = models.CharField(max_length=12, blank=True, null=True)
    currency = models.CharField(max_length=3, default='INR')
    language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='Asia/Kolkata')

    def __str__(self):
        return self.username
