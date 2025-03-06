from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from attendance.models import Presence
from attendance.serializers import PresenceSerializer
from users.models import CustomUser
from django.db.models import Count
from django.db.models import Q
from datetime import datetime

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
        """Automatically set date, time, and recorded_by"""
        today_date = datetime.today().date()  # Auto-generate today's date (YYYY-MM-DD)
        current_time = datetime.now().strftime("%H:%M")  # Auto-generate time (HH:MM)

        serializer.save(
            date=today_date, 
            time=current_time, 
            recorded_by=self.request.user  # Auto-assign the user taking attendance
        )
        
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
    
    @action(detail=False, methods=["get"], url_path="history")
    def get_attendance_history(self, request):
        """Get attendance history filtered by date, person, or class"""
        date = request.query_params.get("date")
        person_id = request.query_params.get("person")
        classe_id = request.query_params.get("classe")  # New filter for class history

        filters = Q()
        if date:
            filters &= Q(date=date)
        if person_id:
            filters &= Q(person_id=person_id)
        if classe_id:
            filters &= Q(classe_id=classe_id)  # Only fetch students from selected class

        attendance_records = Presence.objects.filter(filters).order_by("-date", "-time")
        serializer = self.get_serializer(attendance_records, many=True)
        return Response(serializer.data)
