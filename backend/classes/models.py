from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()

class Classe(models.Model):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.name


class Matiere(models.Model):
    name = models.CharField(max_length=100)
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, related_name="matieres")
    professor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="matieres", limit_choices_to={"role": "professor"}, null=True, blank=True)
    coefficient = models.PositiveIntegerField(default=1)
    
    class Meta:
        unique_together = ('name', 'classe')  # Same name allowed only in different classes

    def clean(self):
        """Ensure only professors can be assigned to a Matière."""
        if self.professor and self.professor.role != "professor":
            raise ValidationError("Seuls les professeurs peuvent être assignés aux matières.")

    def save(self, *args, **kwargs):
        """Run validation before saving."""
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.classe.name}) - {self.professor.username if self.professor else 'Non Assigné'}"