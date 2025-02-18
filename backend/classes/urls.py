from django.urls import path, include
from rest_framework.routers import DefaultRouter
from classes.views import ClasseViewSet, MatiereViewSet

router = DefaultRouter()
router.register(r'classes', ClasseViewSet)
router.register(r'subjects', MatiereViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('my-subjects/', MatiereViewSet.as_view({'get': 'my_subjects'}), name='my-subjects'),
]