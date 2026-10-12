from django.db import models


class KnowledgeBase(models.Model):

    CATEGORY_CHOICES = (
        ("general", "General"),
        ("academic", "Academic"),
        ("rules", "Rules"),
        ("facilities", "Facilities"),
        ("emergency", "Emergency"),
        ("events", "Events"),
        ("complaints", "Complaints"),
        ("contact", "Contact"),
    )

    title = models.CharField(max_length=200)

    content = models.TextField()

    category = models.CharField(
        max_length=30,
        choices=CATEGORY_CHOICES,
        default="general"
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title