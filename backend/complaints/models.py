from django.conf import settings
from django.db import models


class Complaint(models.Model):

    CATEGORY_CHOICES = (
        ("academic", "Academic"),
        ("infrastructure", "Infrastructure"),
        ("hostel", "Hostel"),
        ("electricity", "Electricity"),
        ("water", "Water"),
        ("cleanliness", "Cleanliness"),
        ("internet", "Internet"),
        ("other", "Other"),
    )

    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("assigned", "Assigned"),
        ("in_progress", "In Progress"),
        ("resolved", "Resolved"),
        ("rejected", "Rejected"),
    )

    # ==============================
    # STUDENT
    # ==============================

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="complaints"
    )

    # ==============================
    # COMPLAINT DETAILS
    # ==============================

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default="other"
    )

    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    location = models.CharField(
        max_length=200,
        blank=True
    )

    # ==============================
    # ASSIGNED FACULTY
    # ==============================

    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_complaints"
    )

    # ==============================
    # STATUS
    # ==============================

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    # ==============================
    # TIMESTAMPS
    # ==============================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.title} - {self.student.username}"