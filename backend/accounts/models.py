from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization

class BankConnection(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bank_connections')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='bank_connections', null=True, blank=True)
    institution_name = models.CharField(max_length=255)
    account_id = models.CharField(max_length=255, unique=True)
    access_token = models.CharField(max_length=255)
    last_sync = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.institution_name} ({self.account_id})"

class BankAccount(TimeStampedModel):
    ACCOUNT_TYPES = [
        ('CHECKING', 'Checking'),
        ('SAVINGS', 'Savings'),
        ('BUSINESS_CURRENT', 'Business Current'),
        ('CREDIT_CARD', 'Credit Card'),
    ]
    connection = models.ForeignKey(BankConnection, on_delete=models.CASCADE, related_name='accounts')
    name = models.CharField(max_length=255)
    mask = models.CharField(max_length=4, blank=True)
    type = models.CharField(max_length=50, choices=ACCOUNT_TYPES)
    balance_available = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    balance_current = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, default='INR')

    def __str__(self):
        return f"{self.name} (...{self.mask})"
