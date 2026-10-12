from rest_framework import serializers

from .models import EmergencyReport


class EmergencyReportSerializer(serializers.ModelSerializer):

    class Meta:

        model = EmergencyReport

        fields = [
            "id",
            "student",
            "emergency_type",
            "title",
            "description",
            "location",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student",
            "status",
            "created_at",
            "updated_at",
        ]