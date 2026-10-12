from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from complaints.models import Complaint
from emergency.models import EmergencyReport
from events.models import Event


class AdminAnalyticsView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        # ==========================================
        # ADMIN CHECK
        # ==========================================

        if request.user.role != "admin":

            return Response(
                {
                    "error": "Admin access required."
                },
                status=403
            )

        # ==========================================
        # COMPLAINT ANALYTICS
        # ==========================================

        total_complaints = Complaint.objects.count()

        pending_complaints = Complaint.objects.filter(
            status="pending"
        ).count()

        assigned_complaints = Complaint.objects.filter(
            status="assigned"
        ).count()

        in_progress_complaints = Complaint.objects.filter(
            status="in_progress"
        ).count()

        resolved_complaints = Complaint.objects.filter(
            status="resolved"
        ).count()

        rejected_complaints = Complaint.objects.filter(
            status="rejected"
        ).count()

        # ==========================================
        # EMERGENCY ANALYTICS
        # ==========================================

        total_emergencies = EmergencyReport.objects.count()

        reported_emergencies = EmergencyReport.objects.filter(
            status="reported"
        ).count()

        acknowledged_emergencies = EmergencyReport.objects.filter(
            status="acknowledged"
        ).count()

        resolved_emergencies = EmergencyReport.objects.filter(
            status="resolved"
        ).count()

        # ==========================================
        # EVENT ANALYTICS
        # ==========================================

        total_events = Event.objects.count()

        # ==========================================
        # RESPONSE
        # ==========================================

        return Response(
            {
                "complaints": {
                    "total": total_complaints,
                    "pending": pending_complaints,
                    "assigned": assigned_complaints,
                    "in_progress": in_progress_complaints,
                    "resolved": resolved_complaints,
                    "rejected": rejected_complaints,
                },

                "emergencies": {
                    "total": total_emergencies,
                    "reported": reported_emergencies,
                    "acknowledged": acknowledged_emergencies,
                    "resolved": resolved_emergencies,
                },

                "events": {
                    "total": total_events,
                },
            }
        )