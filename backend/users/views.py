from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .serializers import UserSerializer
from .models import User


# =====================================================
# CURRENT LOGGED-IN USER
# =====================================================

class CurrentUserView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = UserSerializer(
            request.user
        )

        return Response(
            serializer.data
        )


# =====================================================
# FACULTY LIST
# =====================================================

class FacultyListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        faculty = User.objects.filter(
            role="faculty"
        ).order_by(
            "first_name",
            "username"
        )

        serializer = UserSerializer(
            faculty,
            many=True
        )

        return Response(
            serializer.data
        )
    