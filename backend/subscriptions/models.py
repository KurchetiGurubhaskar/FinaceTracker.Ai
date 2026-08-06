from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization

class Subscription(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='subscriptions')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='subscriptions', null=True, blank=True)
    service_name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    billing_cycle = models.CharField(max_length=50, choices=[('MONTHLY', 'Monthly'), ('YEARLY', 'Yearly'), ('WEEKLY', 'Weekly')])
    next_billing_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.service_name} ({self.amount})"
