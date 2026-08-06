from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization
from accounts.models import BankAccount

class Category(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='categories')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='categories', null=True, blank=True)
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=10, choices=[('INCOME', 'Income'), ('EXPENSE', 'Expense')])
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='subcategories')

    def __str__(self):
        return f"{self.name} ({self.type})"

class Transaction(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    account = models.ForeignKey(BankAccount, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions')
    
    date = models.DateField()
    value_date = models.DateField(null=True, blank=True)
    description = models.TextField()
    reference_number = models.CharField(max_length=255, blank=True)
    
    debit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    amount = models.DecimalField(max_digits=15, decimal_places=2, help_text="Net amount (Credit - Debit)")
    currency = models.CharField(max_length=3, default='INR')
    
    balance = models.DecimalField(max_digits=15, decimal_places=2, null=True, blank=True)
    merchant = models.CharField(max_length=255, blank=True)
    upi_details = models.CharField(max_length=255, blank=True)
    ai_category = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"{self.date} - {self.description[:30]} ({self.amount})"
