# users/views.py
from rest_framework import status, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers import UserSerializer, CustomTokenObtainPairSerializer
from rest_framework.decorators import action

User = get_user_model()

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "admin"

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def get_me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='role/(?P<role>[^/.]+)')
    def list_users_by_role(self, request, role=None):
        if role not in ["admin", "professor", "student", "parent"]:
            return Response({"error": "Invalid role"}, status=status.HTTP_400_BAD_REQUEST)
        users = User.objects.filter(role=role)
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], permission_classes=[IsAdmin])
    def update_role(self, request, pk=None):
        user = self.get_object()
        new_role = request.data.get("role")
        if new_role not in ["admin", "professor", "student", "parent"]:
            return Response({"error": "Invalid role."}, status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.save()
        return Response({"message": f"User {user.username} role updated to {new_role}."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-students')
    def my_students(self, request):
        if request.user.role != "professor":
            return Response({"error": "Only professors can access this resource."}, status=status.HTTP_403_FORBIDDEN)
        result = []
        from classes.models import Classe
        classes = Classe.objects.filter(matieres__professor=request.user).distinct()
        for classe in classes:
            students = User.objects.filter(role='student', classe=classe)
            students_serializer = self.get_serializer(students, many=True)
            result.append({
                "class_id": classe.id,
                "class_name": classe.name,
                "students": students_serializer.data
            })
        return Response(result, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='my-children')
    def my_children(self, request):
        """Returns all children (students) associated with the logged-in parent."""
        if request.user.role != "parent":
            return Response({"error": "Only parents can access this resource."}, status=status.HTTP_403_FORBIDDEN)

        children = User.objects.filter(parent=request.user, role='student')
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='class/(?P<class_id>\d+)/students')
    def students_by_class(self, request, class_id=None):
        """
        Return all students for a given class.
        URL example: /api/users/class/3/students/
        """
        students = User.objects.filter(role='student', classe__id=class_id)
        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RegisterUserView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                "message": "User created successfully.",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
