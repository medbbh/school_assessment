from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import BulletinViewSet, NoteViewSet,AssignmentViewSet

router = DefaultRouter()
router.register(r'grades', NoteViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'bulletins', BulletinViewSet, basename='bulletin')

urlpatterns = [
    path('', include(router.urls)),
]
