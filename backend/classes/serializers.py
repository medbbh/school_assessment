from rest_framework import serializers
from .models import Classe, Matiere
from users.models import CustomUser

class ClasseSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()

    class Meta:
        model = Classe
        fields = ['id', 'name','student_count']
    
    def get_student_count(self, obj):
        return obj.students.count()

class MatiereSerializer(serializers.ModelSerializer):
    professor_name = serializers.CharField(source='professor.username', read_only=True)

    class Meta:
        model = Matiere
        fields = ['id', 'name', 'classe', 'professor','coefficient','professor_name']