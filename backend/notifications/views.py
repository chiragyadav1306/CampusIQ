from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Notification
from .serializers import NotificationSerializer


# =====================================================
# USER - VIEW NOTIFICATIONS
# =====================================================

class NotificationListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        notifications = Notification.objects.filter(
            user=request.user
        ).order_by(
            "-created_at"
        )

        serializer = NotificationSerializer(
            notifications,
            many=True
        )

        return Response(
            serializer.data
        )


# =====================================================
# USER - MARK NOTIFICATION AS READ
# =====================================================

class NotificationReadView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(self, request, notification_id):

        try:

            notification = Notification.objects.get(
                id=notification_id,
                user=request.user
            )

        except Notification.DoesNotExist:

            return Response(
                {
                    "error": "Notification not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        notification.is_read = True
        notification.save()

        serializer = NotificationSerializer(
            notification
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )