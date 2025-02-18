from rest_framework import viewsets, permissions, serializers
from classes.models import Classe, Matiere
from classes.serializers import ClasseSerializer, MatiereSerializer
from .models import Classe
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

User = get_user_model()

class ClasseViewSet(viewsets.ModelViewSet):
    queryset = Classe.objects.all()
    serializer_class = ClasseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        print(f"User Role: {self.request.user.role}")  # Debugging Line
        if self.request.user.role != "admin":
            raise serializers.ValidationError("Only admins can create classes.")
        serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated], url_path='my-classes')
    def my_classes(self, request):
        """
        Fetch classes for the logged-in professor.
        URL example: /api/classes/my-classes/
        """
        if request.user.role != "professor":
            return Response(
                {"error": "Seuls les professeurs peuvent accéder à cette ressource."},
                status=403
            )
        # Get distinct classes that have at least one subject taught by the professor.
        classes = Classe.objects.filter(matieres__professor=request.user).distinct()
        serializer = self.get_serializer(classes, many=True)
        return Response(serializer.data)



class IsAdmin(permissions.BasePermission):
    """Custom permission: Only Admins can modify subjects."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"

class MatiereViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing subjects (Matières).
    - Only Admins can create, update, and delete subjects.
    - Authenticated users can view subjects.
    - Professors can fetch only their assigned subjects.
    """
    queryset = Matiere.objects.all()
    serializer_class = MatiereSerializer

    def get_permissions(self):
        """Only allow Admins to modify, others can only read"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        """Ensure only Admins can create subjects and assign a professor"""
        request = self.request
        if request.user.role != "admin":
            raise ValidationError("Seuls les administrateurs peuvent créer des matières.")

        professor_id = request.data.get("professor")
        classe_id = request.data.get("classe")

        if not professor_id or not classe_id:
            raise ValidationError("Veuillez sélectionner une classe et un professeur.")

        try:
            professor = User.objects.get(id=professor_id, role="professor")
            classe = Classe.objects.get(id=classe_id)
        except User.DoesNotExist:
            raise ValidationError("L'utilisateur sélectionné n'est pas un professeur valide.")
        except Classe.DoesNotExist:
            raise ValidationError("La classe sélectionnée est invalide.")

        serializer.save(professor=professor, classe=classe)

    def perform_update(self, serializer):
        """Ensure only Admins can update subjects"""
        request = self.request
        if request.user.role != "admin":
            raise ValidationError("Seuls les administrateurs peuvent modifier les matières.")

        professor_id = request.data.get("professor")
        classe_id = request.data.get("classe")

        update_data = {}
        if professor_id:
            try:
                professor = User.objects.get(id=professor_id, role="professor")
                update_data["professor"] = professor
            except User.DoesNotExist:
                raise ValidationError("L'utilisateur sélectionné n'est pas un professeur valide.")

        if classe_id:
            try:
                classe = Classe.objects.get(id=classe_id)
                update_data["classe"] = classe
            except Classe.DoesNotExist:
                raise ValidationError("La classe sélectionnée est invalide.")

        serializer.save(**update_data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_subjects(self, request):
        """API to fetch Matières assigned to the logged-in Professor"""
        if request.user.role != "professor":
            return Response({"error": "Seuls les professeurs peuvent accéder à cette ressource."}, status=403)

        matieres = Matiere.objects.filter(professor=request.user)
        serializer = MatiereSerializer(matieres, many=True)
        return Response(serializer.data)
    
    @action(
        detail=False,
        methods=['get'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='classe/(?P<class_id>\d+)'
    )
    def subjects_by_class(self, request, class_id=None):
        """
        Fetch subjects for a selected class and logged-in professor.
        URL example: /api/matieres/classe/<class_id>/
        """
        if request.user.role != "professor":
            return Response(
                {"error": "Seuls les professeurs peuvent accéder à cette ressource."},
                status=403
            )
        try:
            classe = Classe.objects.get(pk=class_id)
        except Classe.DoesNotExist:
            return Response({"error": "Classe non trouvée."}, status=404)

        matieres = Matiere.objects.filter(classe=classe, professor=request.user)
        serializer = self.get_serializer(matieres, many=True)
        return Response(serializer.data)

