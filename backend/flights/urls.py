from django.urls import path, include
from rest_framework import routers
from .views import FlightViewSet

router = routers.DefaultRouter()
router.register(r'flights', FlightViewSet, basename='flight')

urlpatterns = [
    path('', include(router.urls)),
]
