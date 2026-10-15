
from django.conf import settings
from django.db import models


class LostFoundItem(models.Model):

    REPORT_TYPE_CHOICES = [
        ("lost", "Lost"),
        ("found", "Found"),
    ]

    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("id_cards", "ID Cards"),
        ("books", "Books"),
        ("clothing", "Clothing"),
        ("accessories", "Accessories"),
        ("bags", "Bags"),
        ("keys", "Keys"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("open", "Open"),
        ("claimed", "Claimed"),
        ("returned", "Returned"),
    ]

    title = models.CharField(max_length=200)

    report_type = models.CharField(
        max_length=10,
        choices=REPORT_TYPE_CHOICES,
    )

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default="other",
    )

    description = models.TextField()

    location = models.CharField(max_length=255)

    date_lost_found = models.DateField()

    photo = models.ImageField(
        upload_to="lost_found/",
        blank=True,
        null=True,
    )

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lost_found_reports",
    )

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default="open",
    )

    # Claim Item feature
    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="claimed_lost_found_items",
    )

    claimed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.report_type})"
