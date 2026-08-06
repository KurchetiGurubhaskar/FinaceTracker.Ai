from django.urls import path, include
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# We will register viewsets here as we build them, e.g.:
# router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('v1/', include(router.urls)),
]
