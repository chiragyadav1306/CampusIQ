
from django.urls import path

from .views import (
    LostFoundItemListCreateView,
    LostFoundItemDetailView,
    ClaimLostFoundItemView,
    MyClaimsView,
    MarkItemReturnedView,
)

urlpatterns = [
    # List all reports and create a new report
    path(
        "",
        LostFoundItemListCreateView.as_view(),
        name="lost-found-list-create",
    ),

    # View all items claimed by the logged-in user
    path(
        "my-claims/",
        MyClaimsView.as_view(),
        name="my-claims",
    ),

    # Claim a found item
    path(
        "<int:pk>/claim/",
        ClaimLostFoundItemView.as_view(),
        name="lost-found-claim",
    ),

    # Mark a claimed item as returned
    path(
        "<int:pk>/return/",
        MarkItemReturnedView.as_view(),
        name="lost-found-return",
    ),

    # Retrieve, update, or delete a report
    path(
        "<int:pk>/",
        LostFoundItemDetailView.as_view(),
        name="lost-found-detail",
    ),
]
