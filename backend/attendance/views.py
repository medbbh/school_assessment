from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from attendance.models import Presence
from attendance.serializers import PresenceSerializer
from users.models import CustomUser
from django.db.models import Count

class IsSupervisor(permissions.BasePermission):
    """Only Supervisors can mark attendance."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "supervisor"

class PresenceViewSet(viewsets.ModelViewSet):
    queryset = Presence.objects.all()
    serializer_class = PresenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Only Supervisors can create/update attendance."""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsSupervisor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        """Only Supervisors can create attendance records."""
        request = self.request
        if request.user.role != "supervisor":
            return Response({"error": "Seuls les superviseurs peuvent marquer la présence."}, status=403)
        # Assign recorded_by automatically
        serializer.save(recorded_by=request.user)
        
    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def my_attendance(self, request):
        """Fetch attendance for the logged-in user (student or professor)."""
        attendance = Presence.objects.filter(person=request.user)
        serializer = PresenceSerializer(attendance, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def class_attendance(self, request):
        """Fetch attendance stats per class for Admins."""
        if request.user.role != "admin":
            return Response({"error": "Seuls les administrateurs peuvent voir les statistiques de présence."}, status=403)
        
        stats = Presence.objects.values("classe__name").annotate(total=Count("id"))
        return Response(stats)
