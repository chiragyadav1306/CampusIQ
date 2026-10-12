from django.urls import path

from .views import (
    CurrentUserView,
    FacultyListView,
)


urlpatterns = [

    # Current logged-in user
    path(
        "me/",
        CurrentUserView.as_view(),
        name="current-user"
    ),

    # Faculty list
    path(
        "faculty/",
        FacultyListView.as_view(),
        name="faculty-list"
    ),

]