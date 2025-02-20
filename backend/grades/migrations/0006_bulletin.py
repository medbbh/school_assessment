# Generated by Django 4.2 on 2025-02-19 17:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("classes", "0007_matiere_coefficient"),
        ("grades", "0005_alter_note_assignment"),
    ]

    operations = [
        migrations.CreateModel(
            name="Bulletin",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("term_name", models.CharField(default="Semestre 1", max_length=100)),
                ("is_confirmed", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "classe",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="bulletins",
                        to="classes.classe",
                    ),
                ),
            ],
        ),
    ]
