from rest_framework import serializers
from .models import LostFoundItem


class LostFoundItemSerializer(serializers.ModelSerializer):
    reporter_username = serializers.CharField(
        source="reporter.username",
        read_only=True
    )

    claimed_by = serializers.CharField(
        read_only=True,
        allow_null=True
    )

    claimed_at = serializers.DateTimeField(
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = LostFoundItem

        fields = [
            "id",
            "title",
            "report_type",
            "category",
            "description",
            "location",
            "date_lost_found",
            "photo",
            "reporter",
            "reporter_username",
            "status",
            "claimed_by",
            "claimed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "reporter",
            "reporter_username",
            "status",
            "claimed_by",
            "claimed_at",
            "created_at",
            "updated_at",
        ]