# Generated by Django 4.2 on 2025-02-18 18:36

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="parent",
            field=models.ForeignKey(
                blank=True,
                limit_choices_to={"role": "parent"},
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="children",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
