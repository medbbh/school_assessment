from django.urls import path
from .views import CustomTokenObtainPairView, RegisterUserView, LogoutView, UserViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),

    path('register/', RegisterUserView.as_view(), name='register-user'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
]
