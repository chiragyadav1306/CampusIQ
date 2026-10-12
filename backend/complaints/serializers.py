from rest_framework import serializers

from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):

    class Meta:
        model = Complaint

        fields = [
            "id",
            "student",
            "title",
            "description",
            "category",
            "priority",
            "location",
            "assigned_to",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "student",
            "created_at",
            "updated_at",
        ]