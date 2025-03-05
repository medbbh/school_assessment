from rest_framework import serializers
from .models import Presence

class PresenceSerializer(serializers.ModelSerializer):
    recorded_by = serializers.ReadOnlyField(source="recorded_by.username")  # Read-only field

    class Meta:
        model = Presence
        fields = ['id', 'person', 'classe', 'status', 'date', 'recorded_by']
