from django.conf import settings
from django.db import models


class EmergencyReport(models.Model):

    TYPE_CHOICES = (
        ("medical", "Medical"),
        ("fire", "Fire"),
        ("security", "Security"),
        ("accident", "Accident"),
        ("other", "Other"),
    )

    STATUS_CHOICES = (
        ("reported", "Reported"),
        ("acknowledged", "Acknowledged"),
        ("resolved", "Resolved"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="emergency_reports"
    )

    emergency_type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default="other"
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    location = models.CharField(
        max_length=200
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="reported"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"{self.emergency_type} - "
            f"{self.student.username}"
        )