
from django.contrib import admin
from .models import LostFoundItem


@admin.register(LostFoundItem)
class LostFoundItemAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "report_type",
        "category",
        "location",
        "status",
        "reporter",
        "created_at",
    )

    list_filter = (
        "report_type",
        "category",
        "status",
    )

    search_fields = (
        "title",
        "description",
        "location",
        "reporter__username",
    )
