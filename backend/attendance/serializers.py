from rest_framework import serializers
from .models import Presence

class PresenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Presence
        fields = ['id', 'student', 'classe', 'date', 'status']
