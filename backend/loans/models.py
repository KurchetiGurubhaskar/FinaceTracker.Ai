from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization
from accounts.models import BankAccount

class Loan(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='loans')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='loans', null=True, blank=True)
    lender_name = models.CharField(max_length=255)
    principal_amount = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, help_text="Annual Interest Rate (%)")
    tenure_months = models.IntegerField()
    start_date = models.DateField()
    linked_account = models.ForeignKey(BankAccount, on_delete=models.SET_NULL, null=True, blank=True, related_name='loans_deducted_from')
    
    def __str__(self):
        return f"{self.lender_name} Loan ({self.principal_amount})"

class EMI(TimeStampedModel):
    loan = models.ForeignKey(Loan, on_delete=models.CASCADE, related_name='emis')
    due_date = models.DateField()
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"EMI for {self.loan} on {self.due_date}"
