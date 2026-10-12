from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status

from .models import Event, EventRegistration
from .serializers import (
    EventSerializer,
    EventRegistrationSerializer,
)


class EventListView(APIView):

    permission_classes = [AllowAny]

    def get(self, request):

        events = Event.objects.all().order_by(
            "date",
            "time"
        )

        serializer = EventSerializer(
            events,
            many=True
        )

        return Response(serializer.data)


class EventRegistrationView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        event_id = request.data.get("event")

        if not event_id:
            return Response(
                {"error": "Event ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            event = Event.objects.get(
                id=event_id
            )

        except Event.DoesNotExist:
            return Response(
                {"error": "Event not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        registration, created = EventRegistration.objects.get_or_create(
            event=event,
            student=request.user
        )

        if not created:
            return Response(
                {
                    "message": "You are already registered for this event."
                },
                status=status.HTTP_200_OK
            )

        serializer = EventRegistrationSerializer(
            registration
        )

        return Response(
            {
                "message": "Successfully registered for the event.",
                "registration": serializer.data
            },
            status=status.HTTP_201_CREATED
        )