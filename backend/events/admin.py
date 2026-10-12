from django.contrib import admin
from .models import Event, EventRegistration


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "date",
        "time",
        "venue",
        "organizer",
    )

    search_fields = (
        "title",
        "venue",
        "organizer",
    )


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):

    list_display = (
        "student",
        "event",
        "registered_at",
    )

    search_fields = (
        "student__username",
        "event__title",
    )

    list_filter = (
        "event",
        "registered_at",
    )