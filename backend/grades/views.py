from rest_framework import viewsets, permissions, status, serializers
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum, F
from .models import Assignment, Bulletin, Note
from .serializers import AssignmentSerializer, BulletinSerializer, NoteSerializer
from users.models import CustomUser
from classes.models import Classe
from django.template.loader import render_to_string
from weasyprint import HTML
from django.http import HttpResponse


class IsAdmin(permissions.BasePermission):
    """Custom permission: Only Admins can modify subjects."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"
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


class BulletinViewSet(viewsets.ModelViewSet):
    queryset = Bulletin.objects.all()
    serializer_class = BulletinSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy', 'confirm_bulletin', 'download_pdf']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    @action(detail=True, methods=['post'], url_path='confirm')
    def confirm_bulletin(self, request, pk=None):
        bulletin = self.get_object()
        bulletin.is_confirmed = True
        bulletin.save()
        return Response(
            {"message": f"Bulletin '{bulletin.term_name}' for class '{bulletin.classe.name}' has been confirmed."},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['get'], url_path='download-pdf')
    def download_pdf(self, request, pk=None):
        """
        Generate a PDF with student-report logic from the NoteViewSet.
        """
        bulletin = self.get_object()
        if not bulletin.is_confirmed:
            return Response({"error": "Bulletin not confirmed."}, status=status.HTTP_403_FORBIDDEN)

        classe = bulletin.classe
        students = CustomUser.objects.filter(role='student', classe=classe)

        # We'll build a 'students_data' list, each item replicating what 'student_report' returns
        students_data = []
        for student in students:
            # Reuse the logic from note's student_report, or directly replicate it:
            notes = Note.objects.filter(student=student)
            if notes.exists():
                from django.db.models import Sum, F
                total_weighted_score = notes.aggregate(
                    sum_weighted=Sum(F('grade') * F('assignment__matiere__coefficient'))
                )['sum_weighted'] or 0
                total_coeff = notes.aggregate(
                    sum_coefficients=Sum(F('assignment__matiere__coefficient'))
                )['sum_coefficients'] or 0
                moyenne_generale = round(total_weighted_score / total_coeff, 2) if total_coeff > 0 else 0
            else:
                moyenne_generale = 0

            # If you want the actual notes, you can also serialize them
            serialized_notes = NoteSerializer(notes, many=True).data

            students_data.append({
                "student_name": student.username,
                "classe_name": student.classe.name if student.classe else None,
                "moyenne_generale": moyenne_generale,
                "grades": serialized_notes
            })

        # Render HTML template
        context = {
            "classe_name": classe.name,
            "term_name": bulletin.term_name,
            "students_data": students_data
        }
        html_content = render_to_string("grades/bulletin_pdf.html", context)

        pdf_file = HTML(string=html_content).write_pdf()

        # Return PDF
        response = HttpResponse(pdf_file, content_type='application/pdf')
        filename = f"Bulletin_{classe.name}_{bulletin.term_name}.pdf".replace(" ", "_")
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
    @action(detail=True, methods=['get'], url_path='download-pdf-student/(?P<student_id>\d+)')
    def download_pdf_single_student(self, request, pk=None, student_id=None):
        bulletin = self.get_object()
        if not bulletin.is_confirmed:
            return Response({"error": "Bulletin not confirmed."}, status=status.HTTP_403_FORBIDDEN)

        try:
            student_user = CustomUser.objects.get(pk=student_id, role='student')
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid student ID."}, status=status.HTTP_404_NOT_FOUND)

        if student_user.classe != bulletin.classe:
            return Response({"error": "Student does not belong to this bulletin's class."}, status=status.HTTP_400_BAD_REQUEST)

        # Permissions check: admin, the same student, or the parent
        user = request.user
        if user.role == "admin":
            pass
        elif user.role == "student":
            if user.id != student_user.id:
                return Response({"error": "You can only download your own bulletin."}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == "parent":
            if student_user.parent_id != user.id:
                return Response({"error": "You can only download bulletin for your child."}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"error": "Role not allowed to download single-student bulletin."}, status=status.HTTP_403_FORBIDDEN)

        # ---------------------------
        # 1) Build ranking for the entire class
        # ---------------------------
        from django.db.models import Sum, F
        all_students = CustomUser.objects.filter(role='student', classe=bulletin.classe)
        
        # We'll store (student_obj, avg) in a temp list
        ranking_list = []
        for st in all_students:
            st_notes = Note.objects.filter(student=st)
            if st_notes.exists():
                total_weighted_score = st_notes.aggregate(
                    sum_weighted=Sum(F('grade') * F('assignment__matiere__coefficient'))
                )['sum_weighted'] or 0
                total_coeff = st_notes.aggregate(
                    sum_coefficients=Sum(F('assignment__matiere__coefficient'))
                )['sum_coefficients'] or 0
                st_avg = round(total_weighted_score / total_coeff, 2) if total_coeff else 0
            else:
                st_avg = 0
            ranking_list.append((st, st_avg))
        
        # Sort by avg desc
        ranking_list.sort(key=lambda x: x[1], reverse=True)
        
        # Assign rank
        rank_map = {}
        current_rank = 1
        for (s_obj, s_avg) in ranking_list:
            rank_map[s_obj.id] = current_rank
            current_rank += 1
        
        # Now we have the single student's rank
        student_rank = rank_map.get(student_user.id, None)

        # ---------------------------
        # 2) Gather the student's own notes
        # ---------------------------
        notes = Note.objects.filter(student=student_user)
        if notes.exists():
            total_weighted_score = notes.aggregate(
                sum_weighted=Sum(F('grade') * F('assignment__matiere__coefficient'))
            )['sum_weighted'] or 0
            total_coefficients = notes.aggregate(
                sum_coefficients=Sum(F('assignment__matiere__coefficient'))
            )['sum_coefficients'] or 0
            moyenne_generale = round(total_weighted_score / total_coefficients, 2) if total_coefficients > 0 else 0
        else:
            moyenne_generale = 0

        # 3) Serialize the notes if you want to show them individually
        serialized_notes = NoteSerializer(notes, many=True).data

        # 4) Build context with 'rank'
        context = {
            "term_name": bulletin.term_name,
            "classe_name": bulletin.classe.name,
            "students_data": [
                {
                    "student_name": student_user.username,
                    "moyenne_generale": moyenne_generale,
                    "rank": student_rank,           # <--- ADD RANK HERE
                    "grades": serialized_notes
                }
            ]
        }

        # Render + Return PDF as you do now
        html_content = render_to_string("grades/bulletin_pdf.html", context)
        pdf_file = HTML(string=html_content).write_pdf()

        response = HttpResponse(pdf_file, content_type='application/pdf')
        filename = f"Bulletin_{bulletin.classe.name}_{bulletin.term_name}_student_{student_user.username}.pdf".replace(" ", "_")
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
