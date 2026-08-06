from django.db import models
from django.conf import settings
from common.models import TimeStampedModel
from core.models import Organization

class Notification(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    type = models.CharField(max_length=50, default='INFO')

    def __str__(self):
        return f"{self.title} (Read: {self.is_read})"
