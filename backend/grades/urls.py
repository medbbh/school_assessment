from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import NoteViewSet,AssignmentViewSet

router = DefaultRouter()
router.register(r'grades', NoteViewSet)
router.register(r'assignments', AssignmentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
