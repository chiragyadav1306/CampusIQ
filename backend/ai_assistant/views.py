
from django.conf import settings
from django.db.models import Count, Q

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from groq import Groq

from .models import KnowledgeBase

from events.models import Event
from complaints.models import Complaint
from emergency.models import EmergencyReport
from notifications.models import Notification
from users.models import User


def get_campus_context(user):

    # =========================================
    # KNOWLEDGE BASE
    # =========================================

    knowledge_items = KnowledgeBase.objects.filter(
        is_active=True
    ).order_by("-created_at")

    knowledge_context = ""

    for item in knowledge_items:
        knowledge_context += (
            f"\nTitle: {item.title}\n"
            f"Category: {item.get_category_display()}\n"
            f"Information: {item.content}\n"
        )

    # =========================================
    # EVENTS
    # =========================================

    events = Event.objects.all().order_by(
        "date",
        "time"
    )[:20]

    events_context = ""

    for event in events:
        events_context += (
            f"\nEvent: {event.title}\n"
            f"Description: {event.description}\n"
            f"Date: {event.date}\n"
            f"Time: {event.time}\n"
            f"Venue: {event.venue}\n"
            f"Organizer: {event.organizer}\n"
        )

    # =========================================
    # USER COMPLAINTS
    # =========================================

    if getattr(user, "role", "") == "faculty":
        complaints = Complaint.objects.filter(
            assigned_to=user
        ).order_by("-created_at")[:20]
    else:
        complaints = Complaint.objects.filter(
            student=user
        ).order_by("-created_at")[:20]

    complaints_context = ""

    for complaint in complaints:
        complaints_context += (
            f"\nComplaint ID: {complaint.id}\n"
            f"Title: {complaint.title}\n"
            f"Description: {complaint.description}\n"
            f"Category: {complaint.get_category_display()}\n"
            f"Priority: {complaint.get_priority_display()}\n"
            f"Status: {complaint.get_status_display()}\n"
            f"Location: {complaint.location}\n"
        )

    # =========================================
    # USER EMERGENCY REPORTS
    # =========================================

    emergency_reports = EmergencyReport.objects.filter(
        student=user
    ).order_by("-created_at")[:20]

    emergency_context = ""

    for emergency in emergency_reports:
        emergency_context += (
            f"\nEmergency ID: {emergency.id}\n"
            f"Type: {emergency.get_emergency_type_display()}\n"
            f"Title: {emergency.title}\n"
            f"Description: {emergency.description}\n"
            f"Location: {emergency.location}\n"
            f"Status: {emergency.get_status_display()}\n"
        )

    # =========================================
    # USER NOTIFICATIONS
    # =========================================

    notifications = Notification.objects.filter(
        user=user
    ).order_by("-created_at")[:20]

    notifications_context = ""

    for notification in notifications:
        notifications_context += (
            f"\nTitle: {notification.title}\n"
            f"Message: {notification.message}\n"
            f"Type: {notification.get_notification_type_display()}\n"
            f"Read: {notification.is_read}\n"
        )

    # =========================================
    # FACULTY INFORMATION
    # =========================================

    faculty_members = User.objects.filter(
        role="faculty"
    ).order_by(
        "first_name",
        "username"
    )[:50]

    faculty_context = ""

    for faculty in faculty_members:
        full_name = (
            f"{faculty.first_name} "
            f"{faculty.last_name}"
        ).strip()

        if not full_name:
            full_name = faculty.username

        faculty_context += (
            f"\nName: {full_name}\n"
            f"Department: {faculty.department}\n"
        )

    # =========================================
    # ADMIN COMPLAINT ANALYTICS
    # =========================================

    admin_analytics_context = ""

    if getattr(user, "role", "") == "admin":

        # Overall complaint statistics
        total = Complaint.objects.count()

        pending = Complaint.objects.filter(
            status="pending"
        ).count()

        assigned = Complaint.objects.filter(
            status="assigned"
        ).count()

        in_progress = Complaint.objects.filter(
            status="in_progress"
        ).count()

        resolved = Complaint.objects.filter(
            status="resolved"
        ).count()

        rejected = Complaint.objects.filter(
            status="rejected"
        ).count()

        urgent = Complaint.objects.filter(
            priority="urgent"
        ).count()

        high = Complaint.objects.filter(
            priority="high"
        ).count()

        admin_analytics_context = f"""
OVERALL COMPLAINT ANALYTICS:

Total Complaints: {total}
Pending Complaints: {pending}
Assigned Complaints: {assigned}
In Progress Complaints: {in_progress}
Resolved Complaints: {resolved}
Rejected Complaints: {rejected}
Urgent Priority Complaints: {urgent}
High Priority Complaints: {high}
"""

        # Department-wise complaint analytics
        departments = Complaint.objects.values(
            "student__department"
        ).annotate(
            total=Count("id"),
            pending=Count(
                "id",
                filter=Q(status="pending")
            ),
            assigned=Count(
                "id",
                filter=Q(status="assigned")
            ),
            in_progress=Count(
                "id",
                filter=Q(status="in_progress")
            ),
            resolved=Count(
                "id",
                filter=Q(status="resolved")
            ),
            rejected=Count(
                "id",
                filter=Q(status="rejected")
            ),
            high=Count(
                "id",
                filter=Q(priority="high")
            ),
            urgent=Count(
                "id",
                filter=Q(priority="urgent")
            ),
        ).order_by("-total")

        department_analytics = ""

        for dept in departments:
            department_name = (
                dept["student__department"]
                or "Not specified"
            )

            department_analytics += (
                f"\nDepartment: {department_name}\n"
                f"Total: {dept['total']}\n"
                f"Pending: {dept['pending']}\n"
                f"Assigned: {dept['assigned']}\n"
                f"In Progress: {dept['in_progress']}\n"
                f"Resolved: {dept['resolved']}\n"
                f"Rejected: {dept['rejected']}\n"
                f"High Priority: {dept['high']}\n"
                f"Urgent Priority: {dept['urgent']}\n"
            )

        admin_analytics_context += (
            "\nDEPARTMENT-WISE COMPLAINT ANALYTICS:\n"
            + (
                department_analytics
                if department_analytics
                else "No department complaint data available."
            )
        )

    # =========================================
    # FINAL CAMPUS CONTEXT
    # =========================================

    context = f"""
CAMPUS KNOWLEDGE BASE:
{knowledge_context}

CURRENT CAMPUS EVENTS:
{events_context}

LOGGED-IN USER'S COMPLAINTS:
{complaints_context}

LOGGED-IN USER'S EMERGENCY REPORTS:
{emergency_context}

LOGGED-IN USER'S NOTIFICATIONS:
{notifications_context}

FACULTY INFORMATION:
{faculty_context}

ADMIN COMPLAINT ANALYTICS:
{admin_analytics_context}

CURRENT USER:
Username: {user.username}
Role: {user.role}
Department: {user.department}
"""

    return context


class AIAssistantView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        user_message = request.data.get(
            "message",
            ""
        ).strip()

        history = request.data.get(
            "history",
            []
        )

        if not user_message:
            return Response(
                {
                    "error": "Message is required."
                },
                status=400
            )

        try:

            # =========================================
            # GROQ CLIENT
            # =========================================

            client = Groq(
                api_key=settings.GROQ_API_KEY
            )

            # =========================================
            # CAMPUS CONTEXT
            # =========================================

            campus_context = get_campus_context(
                request.user
            )

            # =========================================
            # SYSTEM PROMPT
            # =========================================

            system_prompt = f"""
You are CampusIQ AI Assistant.

CampusIQ is an AI-powered smart campus intelligence
platform used by students, faculty and administrators.

Your job is to provide helpful, clear and accurate
answers using the information available in the
CampusIQ system.

IMPORTANT RULES:

1. Use the CAMPUS KNOWLEDGE BASE for campus-related
   questions whenever relevant.

2. Prefer actual CampusIQ data over assumptions.

3. If information is not available in the provided
   context, clearly say that the information is
   currently not available.

4. Never invent college rules, policies, facilities,
   timings, contacts, events or procedures.

5. Never reveal private information belonging to
   another user.

6. For student-specific questions, only use the
   logged-in user's own complaints, emergencies and
   notifications.

7. Give concise and easy-to-understand answers.

8. If the user asks about an event, use the current
   event information provided in the context.

9. If the user asks about their complaint status,
   use their complaint data.

10. If the user asks about their emergency reports,
    use their emergency data.

11. If the user asks about notifications, use their
    notification data.

12. If the user asks about faculty, use the faculty
    information available in the context.

13. Do not claim that you performed an action unless
    the CampusIQ system actually performed it.

14. If the user asks something unrelated to CampusIQ,
    you can still answer normally when appropriate.

15. Only when the logged-in user is an admin, use the
    ADMIN COMPLAINT ANALYTICS for campus-wide complaint
    statistics. Do not reveal individual student details.

16. For department-wise complaint analytics, use only
    the aggregated department data provided in the
    ADMIN COMPLAINT ANALYTICS context. Do not infer
    missing department information.

17. Faculty members can only access complaints assigned
    to them. Students can only access their own complaints.

18. Never assume a user has a role different from the
    role shown in the CURRENT USER context.

19. If no complaint data is available for a requested
    statistic, clearly say that it is unavailable.


20. When a faculty member asks for a solution or
    resolution suggestions for an assigned complaint,
    use the complaint details available in the context.

21. Provide practical, step-by-step initial troubleshooting
    suggestions relevant to the complaint category,
    description and location.

22. Do not claim that a suggested solution has been
    implemented or that the complaint is resolved.

23. Do not recommend unsafe electrical, structural,
    medical or other hazardous repairs. Recommend
    contacting qualified campus staff or emergency
    services when appropriate.

24. If complaint details are insufficient, clearly
    mention what information is missing instead of
    inventing a cause or solution.

25. Keep suggestions concise, actionable and easy
    for faculty members to follow.


CURRENT CAMPUS CONTEXT:

{campus_context}
"""

            # =========================================
            # CHAT HISTORY
            # =========================================

            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                }
            ]

            if isinstance(history, list):
                for message in history[-10:]:

                    if not isinstance(message, dict):
                        continue

                    role = message.get("role")
                    content = message.get("content")

                    if role not in [
                        "user",
                        "assistant"
                    ]:
                        continue

                    if not content:
                        continue

                    messages.append(
                        {
                            "role": role,
                            "content": str(content)
                        }
                    )

            # =========================================
            # CURRENT USER MESSAGE
            # =========================================

            messages.append(
                {
                    "role": "user",
                    "content": user_message
                }
            )

            # =========================================
            # GROQ REQUEST
            # =========================================

            completion = client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=messages,
                temperature=0.3,
                max_tokens=500
            )

            # =========================================
            # AI RESPONSE
            # =========================================

            reply = completion.choices[0].message.content

            return Response(
                {
                    "message": user_message,
                    "reply": reply
                }
            )

        except Exception as error:

            print(
                "AI Assistant Error:",
                error
            )

            return Response(
                {
                    "error": "Unable to get AI response."
                },
                status=500
            )


class KnowledgeBaseListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        knowledge = KnowledgeBase.objects.filter(
            is_active=True
        ).order_by(
            "-created_at"
        )

        data = []

        for item in knowledge:
            data.append(
                {
                    "id": item.id,
                    "title": item.title,
                    "content": item.content,
                    "category": item.category,
                }
            )

        return Response(data)
