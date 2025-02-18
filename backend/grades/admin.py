# from django.contrib import admin
# from .models import *
# Register your models here.
# admin.site.register(Note)
# admin.site.register(Assignment)


from django.contrib import admin
from .models import Note, Assignment

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('title', 'get_matiere')

    def get_matiere(self, obj):
        return obj.matiere  # Displays the related Matiere
    get_matiere.short_description = 'Matiere'


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    # Instead of listing "matiere", we add a custom column that shows the subject from the assignment.
    list_display = ('student', 'get_subject', 'grade', 'date')

    def get_subject(self, obj):
        return obj.assignment.matiere  # Access the subject via assignment
    get_subject.short_description = 'Matiere'
