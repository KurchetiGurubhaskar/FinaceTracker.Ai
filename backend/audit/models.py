from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization

class AuditLog(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=255)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.user} - {self.action} at {self.created_at}"
