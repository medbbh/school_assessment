# Generated by Django 4.2 on 2025-02-16 19:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("classes", "0003_remove_classe_professor_matiere_professor"),
    ]

    operations = [
        migrations.AlterField(
            model_name="matiere",
            name="professor",
            field=models.ForeignKey(
                blank=True,
                limit_choices_to={"role": "professor"},
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="matieres",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
