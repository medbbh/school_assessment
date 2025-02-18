from rest_framework import viewsets, permissions, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count
from .models import Presence
from .serializers import PresenceSerializer
from users.models import CustomUser
from classes.models import Classe

class IsProfessor(permissions.BasePermission):
    """Only Professors can mark attendance"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "professor"

class PresenceViewSet(viewsets.ModelViewSet):
    queryset = Presence.objects.all()
    serializer_class = PresenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        """Only Professors can create/update/delete attendance records"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsProfessor()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        """Ensure only professors can mark attendance"""
        if self.request.user.role != "professor":
            raise serializers.ValidationError("Only professors can mark attendance.")
        serializer.save()

    @action(detail=False, methods=['get'], url_path='student/(?P<student_id>[^/.]+)')
    def student_attendance(self, request, student_id=None):
        """Retrieve attendance records for a specific student"""
        student = CustomUser.objects.filter(pk=student_id, role='student').first()
        if not student:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        attendance_records = Presence.objects.filter(student=student)
        serializer = PresenceSerializer(attendance_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='classe/(?P<classe_id>[^/.]+)/date/(?P<date>[^/.]+)')
    def classe_attendance_by_date(self, request, classe_id=None, date=None):
        """Retrieve attendance for a specific class on a given date"""
        try:
            classe = Classe.objects.get(pk=classe_id)
        except Classe.DoesNotExist:
            return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

        attendance_records = Presence.objects.filter(classe=classe, date=date)
        serializer = PresenceSerializer(attendance_records, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='student-attendance/(?P<student_id>[^/.]+)')
    def student_attendance_report(self, request, student_id=None):
        """Retrieve attendance records for a specific student"""
        student = CustomUser.objects.filter(pk=student_id, role='student').first()
        if not student:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        attendance_records = Presence.objects.filter(student=student)
        serializer = PresenceSerializer(attendance_records, many=True)
        return Response({
            "student": student.username,
            "classe": student.classe.name if student.classe else None,
            "attendance": serializer.data
        }, status=status.HTTP_200_OK)