from django.urls import path

from .views import (
    EmergencyListCreateView,
    AdminEmergencyListView,
    AdminEmergencyUpdateView,
)


urlpatterns = [

    # Student
    path(
        "",
        EmergencyListCreateView.as_view(),
        name="emergency-list-create"
    ),

    # Admin
    path(
        "admin/",
        AdminEmergencyListView.as_view(),
        name="admin-emergency-list"
    ),

    # Admin update
    path(
        "admin/<int:report_id>/",
        AdminEmergencyUpdateView.as_view(),
        name="admin-emergency-update"
    ),

]