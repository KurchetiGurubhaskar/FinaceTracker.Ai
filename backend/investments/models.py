from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization

class InvestmentPortfolio(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='portfolios')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='portfolios', null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class Asset(TimeStampedModel):
    ASSET_TYPES = [
        ('STOCK', 'Stock'),
        ('MUTUAL_FUND', 'Mutual Fund'),
        ('BOND', 'Bond'),
        ('REAL_ESTATE', 'Real Estate'),
        ('GOLD', 'Gold'),
        ('CRYPTO', 'Crypto'),
        ('OTHER', 'Other'),
    ]
    portfolio = models.ForeignKey(InvestmentPortfolio, on_delete=models.CASCADE, related_name='assets')
    name = models.CharField(max_length=255)
    ticker = models.CharField(max_length=50, blank=True)
    type = models.CharField(max_length=50, choices=ASSET_TYPES)
    quantity = models.DecimalField(max_digits=18, decimal_places=6)
    average_buy_price = models.DecimalField(max_digits=18, decimal_places=4)
    current_price = models.DecimalField(max_digits=18, decimal_places=4, null=True, blank=True)
    currency = models.CharField(max_length=3, default='INR')

    def __str__(self):
        return f"{self.name} ({self.quantity})"
