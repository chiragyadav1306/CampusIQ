from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import EmergencyReport
from .serializers import EmergencyReportSerializer

from notifications.utils import create_notification

from users.models import User


# =====================================================
# STUDENT - CREATE & VIEW OWN EMERGENCY REPORTS
# =====================================================

class EmergencyListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        reports = EmergencyReport.objects.filter(
            student=request.user
        ).order_by(
            "-created_at"
        )

        serializer = EmergencyReportSerializer(
            reports,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = EmergencyReportSerializer(
            data=request.data
        )

        if serializer.is_valid():

            emergency = serializer.save(
                student=request.user
            )

            # ==========================================
            # NOTIFY ALL ADMINS
            # ==========================================

            admins = User.objects.filter(
                role="admin"
            )

            for admin in admins:

                create_notification(
                    user=admin,
                    title="Emergency Report",
                    message=(
                        f"Emergency reported: "
                        f"{emergency.title} "
                        f"at {emergency.location}."
                    ),
                    notification_type="emergency"
                )

            return Response(
                EmergencyReportSerializer(
                    emergency
                ).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =====================================================
# ADMIN - VIEW ALL EMERGENCY REPORTS
# =====================================================

class AdminEmergencyListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        if request.user.role != "admin":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        reports = EmergencyReport.objects.all().order_by(
            "-created_at"
        )

        serializer = EmergencyReportSerializer(
            reports,
            many=True
        )

        return Response(
            serializer.data
        )


# =====================================================
# ADMIN - UPDATE EMERGENCY STATUS
# =====================================================

class AdminEmergencyUpdateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def patch(self, request, report_id):

        # ==========================================
        # ADMIN CHECK
        # ==========================================

        if request.user.role != "admin":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # ==========================================
        # FIND EMERGENCY
        # ==========================================

        try:

            emergency = EmergencyReport.objects.get(
                id=report_id
            )

        except EmergencyReport.DoesNotExist:

            return Response(
                {
                    "error": "Emergency report not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ==========================================
        # GET NEW STATUS
        # ==========================================

        new_status = request.data.get(
            "status"
        )

        # ==========================================
        # VALIDATE STATUS
        # ==========================================

        allowed_statuses = [
            "reported",
            "acknowledged",
            "resolved",
        ]

        if new_status not in allowed_statuses:

            return Response(
                {
                    "error": (
                        "Invalid status. "
                        "Use reported, acknowledged "
                        "or resolved."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ==========================================
        # UPDATE STATUS
        # ==========================================

        emergency.status = new_status

        emergency.save(
            update_fields=[
                "status",
                "updated_at"
            ]
        )

        # ==========================================
        # NOTIFY STUDENT
        # ==========================================

        create_notification(
            user=emergency.student,
            title="Emergency Status Updated",
            message=(
                f"Your emergency report "
                f"#{emergency.id} "
                f"status has been changed to "
                f"{emergency.get_status_display()}."
            ),
            notification_type="emergency"
        )

        # ==========================================
        # RETURN UPDATED REPORT
        # ==========================================

        return Response(
            EmergencyReportSerializer(
                emergency
            ).data,
            status=status.HTTP_200_OK
        )