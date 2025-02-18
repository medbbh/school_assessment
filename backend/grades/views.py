from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, F
from .models import Assignment, Note
from .serializers import AssignmentSerializer, NoteSerializer
from users.models import CustomUser
from classes.models import Classe

# ---------------------------
# Assignment ViewSet
# ---------------------------
class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        request = self.request
        # If a professor is creating an assignment, ensure they are assigned to the subject (matiere).
        if request.user.role == "professor":
            matiere = serializer.validated_data.get('matiere')
            if matiere.professor != request.user:
                raise serializers.ValidationError("You are not assigned to this subject.")
        serializer.save()

    @action(
        detail=False,
        methods=['get'],
        url_path='subject/(?P<subject_id>\d+)',
        permission_classes=[permissions.IsAuthenticated]
    )
    def assignments_by_subject(self, request, subject_id=None):
        """
        Return all assignments for a given subject.
        URL example: /api/assignments/subject/1/
        """
        assignments = self.get_queryset().filter(matiere=subject_id)
        serializer = self.get_serializer(assignments, many=True)
        return Response(serializer.data)


# ---------------------------
# Note ViewSet
# ---------------------------
class IsProfessor(permissions.BasePermission):
    """Only professors can assign grades."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "professor"


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Only professors can create, update, or delete notes.
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsProfessor()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        if self.request.user.role != "professor":
            raise serializers.ValidationError("Only professors can assign grades.")
        
        # Validate grade <= 20
        grade_value = self.request.data.get('grade', None)
        if grade_value is not None:
            try:
                grade_value = float(grade_value)
                if grade_value > 20:
                    raise serializers.ValidationError("La note ne peut pas dépasser 20.")
            except ValueError:
                pass  # fallback or raise error

        serializer.save(professor=self.request.user)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def moyenne_generale(self, request, pk=None):
        student = CustomUser.objects.filter(pk=pk, role='student').first()
        if not student:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        notes = Note.objects.filter(student=student)
        if not notes.exists():
            return Response({"moyenne_generale": 0}, status=status.HTTP_200_OK)

        total_weighted_score = Sum(F('grade') * F('assignment__matiere__coefficient'))
        total_coefficients = Sum(F('assignment__matiere__coefficient'))

        moyenne_generale = notes.aggregate(
            moyenne=total_weighted_score / total_coefficients
        )['moyenne'] or 0

        # 1) Clamp before rounding
        moyenne_generale = min(moyenne_generale, 20)

        # 2) Now round
        moyenne_generale = round(moyenne_generale, 2)

        return Response({
            "student": student.username,
            "moyenne_generale": moyenne_generale
        }, status=status.HTTP_200_OK)



    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='classement/(?P<classe_id>\d+)')
    def classement_etudiants(self, request, classe_id=None):
        """
        Rank students in a class based on their overall average (moyenne générale).
        Calculation uses the subject's coefficient from Assignment.
        """
        try:
            classe = Classe.objects.get(pk=classe_id)
        except Classe.DoesNotExist:
            return Response({"error": "Class not found."}, status=status.HTTP_404_NOT_FOUND)

        students = CustomUser.objects.filter(role="student", classe=classe)
        student_data = []

        for student in students:
            notes = Note.objects.filter(student=student)
            if notes.exists():
                total_weighted_score = notes.aggregate(
                    sum_weighted=Sum(F('grade') * F('assignment__matiere__coefficient'))
                )['sum_weighted']
                total_coefficients = notes.aggregate(
                    sum_coefficients=Sum(F('assignment__matiere__coefficient'))
                )['sum_coefficients']
                moyenne_generale = round(total_weighted_score / total_coefficients, 2) if total_coefficients > 0 else 0
            else:
                moyenne_generale = 0

            student_data.append({
                "student": student.username,
                "moyenne_generale": moyenne_generale
            })

        # Sort students descending by average
        student_data.sort(key=lambda x: x["moyenne_generale"], reverse=True)

        # Assign ranking positions
        for i, student in enumerate(student_data, start=1):
            student["rank"] = i

        return Response({
            "classe": classe.name,
            "classement": student_data
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='student-report/(?P<student_id>\d+)')
    def student_report(self, request, student_id=None):
        """
        Return all grades (notes) and the overall average for a specific student.
        """
        student = CustomUser.objects.filter(pk=student_id, role='student').first()
        if not student:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        notes = Note.objects.filter(student=student)
        serialized_notes = NoteSerializer(notes, many=True).data

        if notes.exists():
            total_weighted_score = notes.aggregate(
                sum_weighted=Sum(F('grade') * F('assignment__matiere__coefficient'))
            )['sum_weighted']
            total_coefficients = notes.aggregate(
                sum_coefficients=Sum(F('assignment__matiere__coefficient'))
            )['sum_coefficients']
            moyenne_generale = round(total_weighted_score / total_coefficients, 2) if total_coefficients > 0 else 0
        else:
            moyenne_generale = 0

        return Response({
            "student": student.username,
            "classe": student.classe.name if student.classe else None,
            "moyenne_generale": moyenne_generale,
            "grades": serialized_notes
        }, status=status.HTTP_200_OK)
