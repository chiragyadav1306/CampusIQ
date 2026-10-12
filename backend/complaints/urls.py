from django.urls import path

from .views import (
    ComplaintListCreateView,
    AdminComplaintListView,
    AdminComplaintUpdateView,
    FacultyComplaintListView,
    FacultyComplaintUpdateView,
    AIComplaintAnalysisView,
)

urlpatterns = [

    path(
        "",
        ComplaintListCreateView.as_view(),
        name="complaint-list-create"
    ),

    path(
        "admin/",
        AdminComplaintListView.as_view(),
        name="admin-complaints"
    ),

    path(
        "admin/<int:complaint_id>/",
        AdminComplaintUpdateView.as_view(),
        name="admin-complaint-update"
    ),

    path(
        "faculty/",
        FacultyComplaintListView.as_view(),
        name="faculty-complaints"
    ),

    path(
        "faculty/<int:complaint_id>/",
        FacultyComplaintUpdateView.as_view(),
        name="faculty-complaint-update"
    ),

    path(
        "ai-analyze/",
        AIComplaintAnalysisView.as_view(),
        name="ai-complaint-analysis"
    ),
]