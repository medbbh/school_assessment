from django.urls import path, include
from rest_framework.routers import DefaultRouter
from attendance.views import PresenceViewSet

router = DefaultRouter()
router.register(r'attendance', PresenceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]