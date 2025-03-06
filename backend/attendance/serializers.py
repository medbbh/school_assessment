from rest_framework import serializers
from .models import Presence

class PresenceSerializer(serializers.ModelSerializer):
    recorded_by = serializers.ReadOnlyField(source="recorded_by.username")
    date = serializers.DateField(format="%Y-%m-%d", read_only=True)
    time = serializers.TimeField(format="%H:%M", read_only=True)  # Display time without seconds
    classe_name = serializers.CharField(source="classe.name", read_only=True)  # Get class name
    student_name = serializers.CharField(source="person.username", read_only=True)  # Get student name


    class Meta:
        model = Presence
        fields = ["id", "person", "classe","student_name", "classe_name", "status", "date", "time", "recorded_by"]
        read_only_fields = ['date','time','recorded_by']

