from django.db import models
from users.models import CustomUser
from classes.models import Classe

class Presence(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    )

    student = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'student'}, related_name="attendance_records"
    )
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name="class_attendance")
    date = models.DateField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')

    def __str__(self):
        return f"{self.student.username} - {self.classe.name} - {self.date} - {self.status}"
