from django.urls import path

from .views import (
    AIAssistantView,
    KnowledgeBaseListView,
)


urlpatterns = [

    path(
        "",
        AIAssistantView.as_view(),
        name="ai-assistant"
    ),

    path(
        "knowledge/",
        KnowledgeBaseListView.as_view(),
        name="knowledge-base"
    ),
]