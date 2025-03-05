from django.db import models
from users.models import CustomUser
from classes.models import Classe

class Presence(models.Model):
    STATUS_CHOICES = [
        ('present', 'Présent'),
        ('late', 'Late'),
        ('absent', 'Absent')
    ]
    
    person = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="attendance")
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, null=True, blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    date = models.DateField(auto_now_add=True)
    recorded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="marked_attendance")

    def __str__(self):
        return f"{self.person.username} - {self.status} ({self.date})"
