from rest_framework import serializers
from .models import Event, EventRegistration


class EventSerializer(serializers.ModelSerializer):

    class Meta:
        model = Event
        fields = [
            "id",
            "title",
            "description",
            "date",
            "time",
            "venue",
            "organizer",
            "created_at",
        ]


class EventRegistrationSerializer(serializers.ModelSerializer):

    class Meta:
        model = EventRegistration
        fields = [
            "id",
            "event",
            "student",
            "registered_at",
        ]

        read_only_fields = [
            "student",
            "registered_at",
        ]