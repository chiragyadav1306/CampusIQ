from django.contrib import admin
from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "student",
        "category",
        "priority",
        "status",
        "location",
        "created_at",
    )

    list_filter = (
        "category",
        "priority",
        "status",
        "created_at",
    )

    search_fields = (
        "title",
        "description",
        "student__username",
        "location",
    )

    ordering = (
        "-created_at",
    )