from django.db import models

class TimeStampedModel(models.Model):
    """
    An abstract base class model that provides self-updating
    'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class Currency(TimeStampedModel):
    """
    Enterprise multi-currency support.
    """
    code = models.CharField(max_length=3, unique=True, help_text="ISO 4217 code, e.g., USD, INR")
    name = models.CharField(max_length=50)
    symbol = models.CharField(max_length=10)
    exchange_rate_to_base = models.DecimalField(
        max_digits=12, decimal_places=6, default=1.0, 
        help_text="Exchange rate to the base system currency"
    )

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        verbose_name_plural = "Currencies"
