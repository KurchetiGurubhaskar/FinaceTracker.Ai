from django.db import models
from django.conf import settings
from common.models import TimeStampedModel

class Course(TimeStampedModel):
    title = models.CharField(max_length=255)
    description = models.TextField()
    instructor = models.CharField(max_length=255, blank=True)
    total_xp = models.IntegerField(default=100)
    thumbnail = models.URLField(blank=True, help_text="URL to course thumbnail image")

    def __str__(self):
        return self.title

class Video(TimeStampedModel):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='videos')
    title = models.CharField(max_length=255)
    video_url = models.URLField(help_text="YouTube or Vimeo URL")
    order = models.IntegerField(default=1)
    xp_reward = models.IntegerField(default=10)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

class UserProgress(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='lms_progress')
    completed_videos = models.ManyToManyField(Video, blank=True, related_name='completed_by')
    total_xp = models.IntegerField(default=0)
    level = models.IntegerField(default=1)

    def update_stats(self):
        # Calculate total XP from completed videos
        self.total_xp = sum(video.xp_reward for video in self.completed_videos.all())
        # Basic leveling logic: Level 1 (0-100), Level 2 (101-300), Level 3 (301-600)...
        # Roughly: level = (total_xp / 100) + 1 (very simple for MVP)
        self.level = (self.total_xp // 100) + 1
        self.save()

    def __str__(self):
        return f"{self.user.email} - Lvl {self.level} ({self.total_xp} XP)"
