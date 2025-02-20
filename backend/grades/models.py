from django.db import models
from users.models import CustomUser
from classes.models import Classe, Matiere


class Assignment(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name="assignments")

    def __str__(self):
        return f"{self.title} ({self.matiere.name})"
    
class Note(models.Model):
    student = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'student'}, related_name="student_notes"
    )
    assignment = models.ForeignKey(
        Assignment, on_delete=models.CASCADE,
        related_name="assignment_notes",
    )
    professor = models.ForeignKey(
        CustomUser, on_delete=models.CASCADE, limit_choices_to={'role': 'professor'}, related_name="professor_notes"
    )
    grade = models.FloatField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} - {self.matiere.name}: {self.grade}/20"

class Bulletin(models.Model):
    """
    A Bulletin (grade sheet) can be tied to a specific class, 
    and possibly represent a specific term/semester, etc.
    """
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name="bulletins")
    term_name = models.CharField(max_length=100, default="Semestre 1")
    is_confirmed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Bulletin {self.term_name} - {self.classe.name}"

