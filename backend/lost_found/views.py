
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.generics import ListAPIView

from .models import LostFoundItem
from .serializers import LostFoundItemSerializer


class LostFoundItemListCreateView(generics.ListCreateAPIView):
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = LostFoundItem.objects.select_related(
            "reporter",
            "claimed_by",
        ).all()

        report_type = self.request.query_params.get("type")
        category = self.request.query_params.get("category")
        item_status = self.request.query_params.get("status")
        search = self.request.query_params.get("search")

        if report_type in ["lost", "found"]:
            queryset = queryset.filter(report_type=report_type)

        if category and category != "all":
            queryset = queryset.filter(category=category)

        if item_status in ["open", "claimed", "returned"]:
            queryset = queryset.filter(status=item_status)

        if search:
            from django.db.models import Q

            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(location__icontains=search)
                | Q(category__icontains=search)
            )

        return queryset.order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)


class LostFoundItemDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        return LostFoundItem.objects.select_related(
            "reporter",
            "claimed_by",
        ).all()

    def perform_update(self, serializer):
        item = self.get_object()

        if (
            item.reporter_id != self.request.user.id
            and getattr(self.request.user, "role", None) != "admin"
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You can only update your own report."
            )

        serializer.save()

    def perform_destroy(self, instance):
        if (
            instance.reporter_id != self.request.user.id
            and getattr(self.request.user, "role", None) != "admin"
        ):
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You can only delete your own report."
            )

        instance.delete()


class ClaimLostFoundItemView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            item = LostFoundItem.objects.get(pk=pk)
        except LostFoundItem.DoesNotExist:
            return Response(
                {"error": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if item.report_type != "found":
            return Response(
                {"error": "Only found items can be claimed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if item.reporter_id == request.user.id:
            return Response(
                {"error": "You cannot claim your own report."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if item.status != "open":
            return Response(
                {
                    "error": (
                        "This item is already claimed "
                        "or returned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.claimed_by = request.user
        item.claimed_at = timezone.now()
        item.status = "claimed"

        item.save(
            update_fields=[
                "claimed_by",
                "claimed_at",
                "status",
                "updated_at",
            ]
        )

        return Response(
            {
                "message": "Item claimed successfully.",
                "item_id": item.id,
                "claimed_by": request.user.username,
                "status": item.status,
            },
            status=status.HTTP_200_OK,
        )


class MarkItemReturnedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            item = LostFoundItem.objects.get(pk=pk)
        except LostFoundItem.DoesNotExist:
            return Response(
                {"error": "Item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if item.claimed_by_id != request.user.id:
            return Response(
                {
                    "error": (
                        "Only the user who claimed this item "
                        "can mark it as returned."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if item.status != "claimed":
            return Response(
                {
                    "error": (
                        "Only claimed items can be marked "
                        "as returned."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        item.status = "returned"
        item.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "message": "Item marked as returned successfully.",
                "item_id": item.id,
                "status": item.status,
            },
            status=status.HTTP_200_OK,
        )


class MyClaimsView(ListAPIView):
    serializer_class = LostFoundItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return LostFoundItem.objects.filter(
            claimed_by=self.request.user
        ).select_related(
            "reporter",
            "claimed_by",
        ).order_by("-claimed_at")
