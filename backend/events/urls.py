from django.urls import path
from .views import EventListView, EventRegistrationView


urlpatterns = [
    path(
        "",
        EventListView.as_view(),
        name="event-list"
    ),

    path(
        "register/",
        EventRegistrationView.as_view(),
        name="event-register"
    ),
]