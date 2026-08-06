from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization

class StatementUpload(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='statement_uploads')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='statement_uploads', null=True, blank=True)
    file = models.FileField(upload_to='statements/')
    status = models.CharField(max_length=50, default='PENDING', choices=[
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('COMPLETED', 'Completed'),
        ('FAILED', 'Failed')
    ])
    error_message = models.TextField(blank=True)

    def __str__(self):
        return f"{self.file.name} - {self.status}"
