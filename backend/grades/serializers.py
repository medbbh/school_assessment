from rest_framework import serializers

from classes.models import Matiere
from classes.serializers import MatiereSerializer
from .models import Assignment, Note

class AssignmentSerializer(serializers.ModelSerializer):
    # Return a nested representation for the subject
    matiere = MatiereSerializer(read_only=True)
    # Allow setting the subject via a write-only field
    matiere_id = serializers.PrimaryKeyRelatedField(
        queryset=Matiere.objects.all(), source='matiere', write_only=True
    )
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'matiere','matiere_id']


# Nested serializer for Assignment
class AssignmentNestedSerializer(serializers.ModelSerializer):
    # Nest the Matiere object to get subject name
    matiere = MatiereSerializer(read_only=True)

    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'matiere']
        
class NoteSerializer(serializers.ModelSerializer):
    # The professor is auto-assigned, so it's read-only.
    professor = serializers.PrimaryKeyRelatedField(read_only=True)
    assignment_detail = AssignmentNestedSerializer(source='assignment', read_only=True)

    class Meta:
        model = Note
        # fields = ['id', 'student', 'assignment', 'professor', 'grade', 'date']
        fields = [
            'id',
            'student',
            'assignment',
            'assignment_detail',
            'professor',
            'grade',
            'date'
        ]