# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from classes.models import Classe
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    classe = serializers.PrimaryKeyRelatedField(
        queryset=Classe.objects.all(), required=False, allow_null=True
    )

    parent = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='parent'),
        required=False,
        allow_null=True
    )
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'password', 'classe', 'parent']

    def create(self, validated_data):
        role = validated_data.get('role', 'student')
        # Allow classe assignment only if role is student.
        if role != 'student':
            validated_data.pop('classe', None)
            validated_data.pop('parent', None)
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["role"] = self.user.role
        data["username"] = self.user.username
        data["user_id"] = self.user.id


        return data
