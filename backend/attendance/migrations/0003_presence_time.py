# Generated by Django 4.2 on 2025-03-06 00:22

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("attendance", "0002_remove_presence_student_presence_person_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="presence",
            name="time",
            field=models.TimeField(
                auto_now_add=True, default=django.utils.timezone.now
            ),
            preserve_default=False,
        ),
    ]
