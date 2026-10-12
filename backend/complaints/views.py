from django.conf import settings
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import Complaint
from .serializers import ComplaintSerializer
from .permissions import (
    IsAdminRole,
    IsFacultyRole
)

from notifications.utils import create_notification


# =====================================================
# STUDENT - LIST & CREATE COMPLAINT
# =====================================================

class ComplaintListCreateView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        complaints = Complaint.objects.filter(
            student=request.user
        ).order_by(
            "-created_at"
        )

        serializer = ComplaintSerializer(
            complaints,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):

        serializer = ComplaintSerializer(
            data=request.data
        )

        if serializer.is_valid():

            complaint = serializer.save(
                student=request.user
            )

            response_serializer = ComplaintSerializer(
                complaint
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =====================================================
# ADMIN - VIEW ALL COMPLAINTS
# =====================================================

class AdminComplaintListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]

    def get(self, request):

        complaints = Complaint.objects.all().order_by(
            "-created_at"
        )

        serializer = ComplaintSerializer(
            complaints,
            many=True
        )

        return Response(
            serializer.data
        )


# =====================================================
# ADMIN - UPDATE COMPLAINT / ASSIGN FACULTY
# =====================================================

class AdminComplaintUpdateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminRole
    ]

    def patch(self, request, complaint_id):

        try:

            complaint = Complaint.objects.get(
                id=complaint_id
            )

        except Complaint.DoesNotExist:

            return Response(
                {
                    "error": "Complaint not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        allowed_fields = [
            "status",
            "priority",
            "category",
            "location",
            "assigned_to",
        ]

        update_data = {}

        for field in allowed_fields:

            if field in request.data:
                update_data[field] = request.data[field]

        # ==========================================
        # HANDLE FACULTY ASSIGNMENT
        # ==========================================

        if "assigned_to" in update_data:

            faculty_id = update_data["assigned_to"]

            if faculty_id in [
                None,
                "",
                "null"
            ]:

                update_data["assigned_to"] = None

            else:

                from users.models import User

                try:

                    faculty = User.objects.get(
                        id=faculty_id,
                        role="faculty"
                    )

                    update_data["assigned_to"] = faculty.id

                    # Automatically change status
                    # to assigned if no status was provided

                    if "status" not in update_data:

                        update_data["status"] = "assigned"

                except User.DoesNotExist:

                    return Response(
                        {
                            "error":
                            "Selected user is not a faculty member."
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

        # ==========================================
        # UPDATE COMPLAINT
        # ==========================================

        serializer = ComplaintSerializer(
            complaint,
            data=update_data,
            partial=True
        )

        if serializer.is_valid():

            updated_complaint = serializer.save()

            # ==========================================
            # NOTIFY FACULTY
            # ==========================================

            if (
                "assigned_to" in update_data
                and updated_complaint.assigned_to
            ):

                create_notification(
                    user=updated_complaint.assigned_to,
                    title="New Complaint Assigned",
                    message=(
                        f"You have been assigned complaint "
                        f"#{updated_complaint.id}: "
                        f"{updated_complaint.title}"
                    ),
                    notification_type="complaint"
                )

                # ======================================
                # NOTIFY STUDENT
                # ======================================

                create_notification(
                    user=updated_complaint.student,
                    title="Complaint Assigned",
                    message=(
                        f"Your complaint "
                        f"#{updated_complaint.id} "
                        f"has been assigned to faculty."
                    ),
                    notification_type="complaint"
                )

            return Response(
                ComplaintSerializer(
                    updated_complaint
                ).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =====================================================
# FACULTY - VIEW ASSIGNED COMPLAINTS ONLY
# =====================================================

class FacultyComplaintListView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsFacultyRole
    ]

    def get(self, request):

        complaints = Complaint.objects.filter(
            assigned_to=request.user
        ).order_by(
            "-created_at"
        )

        serializer = ComplaintSerializer(
            complaints,
            many=True
        )

        return Response(
            serializer.data
        )


# =====================================================
# FACULTY - UPDATE ASSIGNED COMPLAINT STATUS
# =====================================================

class FacultyComplaintUpdateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsFacultyRole
    ]

    def patch(self, request, complaint_id):

        try:

            complaint = Complaint.objects.get(
                id=complaint_id,
                assigned_to=request.user
            )

        except Complaint.DoesNotExist:

            return Response(
                {
                    "error":
                    "Complaint not found or not assigned to you."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        allowed_fields = [
            "status",
        ]

        update_data = {}

        for field in allowed_fields:

            if field in request.data:
                update_data[field] = request.data[field]

        # ==========================================
        # UPDATE STATUS
        # ==========================================

        serializer = ComplaintSerializer(
            complaint,
            data=update_data,
            partial=True
        )

        if serializer.is_valid():

            updated_complaint = serializer.save()

            # ==========================================
            # NOTIFY STUDENT
            # ==========================================

            if "status" in update_data:

                create_notification(
                    user=updated_complaint.student,
                    title="Complaint Status Updated",
                    message=(
                        f"Your complaint "
                        f"#{updated_complaint.id} "
                        f"status has been changed to "
                        f"{updated_complaint.get_status_display()}."
                    ),
                    notification_type="complaint"
                )

            return Response(
                ComplaintSerializer(
                    updated_complaint
                ).data,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class AIComplaintAnalysisView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        title = request.data.get("title", "").strip()
        description = request.data.get(
            "description",
            ""
        ).strip()

        if not title or not description:
            return Response(
                {
                    "error": (
                        "Title and description "
                        "are required."
                    )
                },
                status=400
            )

        try:

            client = Groq(
                api_key=settings.GROQ_API_KEY
            )

            prompt = f"""
You are the Smart Complaint AI for CampusIQ.

Analyze the following campus complaint.

TITLE:
{title}

DESCRIPTION:
{description}

Choose exactly ONE category from:

academic
infrastructure
hostel
electricity
water
cleanliness
internet
other

Choose exactly ONE priority from:

low
medium
high
urgent

Return ONLY valid JSON in this exact format:

{{
    "category": "internet",
    "priority": "high",
    "reason": "Short explanation"
}}

Rules:

- Do not invent information.
- Use the complaint description as the main evidence.
- Emergency or immediate safety-related situations may be
  marked urgent.
- Internet/network problems should normally use internet.
- Water supply problems should normally use water.
- Electricity/power problems should normally use electricity.
- Hostel-related issues should normally use hostel.
- Keep the reason short.
"""

            completion = client.chat.completions.create(

                model=settings.GROQ_MODEL,

                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You classify CampusIQ complaints. "
                            "Return only valid JSON."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],

                temperature=0,

                max_tokens=200
            )

            ai_response = (
                completion
                .choices[0]
                .message
                .content
                .strip()
            )

            import json

            try:

                result = json.loads(
                    ai_response
                )

            except json.JSONDecodeError:

                return Response(
                    {
                        "error": (
                            "AI returned an invalid "
                            "classification."
                        ),
                        "raw_response": ai_response
                    },
                    status=500
                )

            allowed_categories = [
                "academic",
                "infrastructure",
                "hostel",
                "electricity",
                "water",
                "cleanliness",
                "internet",
                "other"
            ]

            allowed_priorities = [
                "low",
                "medium",
                "high",
                "urgent"
            ]

            category = result.get(
                "category",
                "other"
            )

            priority = result.get(
                "priority",
                "medium"
            )

            reason = result.get(
                "reason",
                "AI classification based on complaint."
            )

            if category not in allowed_categories:
                category = "other"

            if priority not in allowed_priorities:
                priority = "medium"

            return Response(
                {
                    "category": category,
                    "priority": priority,
                    "reason": reason
                }
            )

        except Exception as error:

            print(
                "AI Complaint Analysis Error:",
                error
            )

            return Response(
                {
                    "error": (
                        "Unable to analyze complaint."
                    )
                },
                status=500
            )    