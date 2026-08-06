from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, TransactionViewSet, BudgetViewSet, SubscriptionViewSet, GoalViewSet, LoanViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'loans', LoanViewSet, basename='loan')
from .views import ReportViewSet, StatementUploadViewSet, BankConnectionViewSet, NotificationViewSet
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'statement', StatementUploadViewSet, basename='statement')
router.register(r'bank', BankConnectionViewSet, basename='bank')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('', include(router.urls)),
]
