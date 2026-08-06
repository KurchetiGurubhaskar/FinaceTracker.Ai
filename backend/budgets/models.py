from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization
from transactions.models import Category

class Budget(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budgets')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='budgets', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='budgets')
    
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    period = models.CharField(max_length=20, choices=[('MONTHLY', 'Monthly'), ('QUARTERLY', 'Quarterly'), ('YEARLY', 'Yearly')], default='MONTHLY')
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.category.name} Budget - {self.amount} ({self.period})"
