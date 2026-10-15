from django.contrib import admin
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [

    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/users/",
        include("users.urls")
    ),

    path(
        "api/events/",
        include("events.urls")
    ),

    path(
        "api/complaints/",
        include("complaints.urls")
    ),

    path(
        "api/notifications/",
        include("notifications.urls")
    ),

    path(
        "api/emergency/",
        include("emergency.urls")
    ),

    path(
        "api/token/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),

    path(
    "api/analytics/",
    include("analytics.urls")
    ),


    path(
        "api/lost-found/",
        include("lost_found.urls")
    ),


    path(
    "api/ai/",
    include("ai_assistant.urls")
),
]