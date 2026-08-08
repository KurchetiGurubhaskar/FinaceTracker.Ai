from django.contrib import admin
from django.urls import path, include
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.routers import DefaultRouter
from finance.views import CategoryViewSet, TransactionViewSet, BudgetViewSet, SubscriptionViewSet, ReportViewSet, GoalViewSet, LoanViewSet, StatementUploadViewSet, BankConnectionViewSet, NotificationViewSet
from investments.views import InvestmentPortfolioViewSet, AssetViewSet
from lms.views import CourseViewSet, VideoViewSet, UserProgressViewSet

schema_view = get_schema_view(
   openapi.Info(
      title="Finance Intelligence API",
      default_version='v1',
      description="API documentation for the Finance Intelligence Platform",
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'loans', LoanViewSet, basename='loan')
router.register(r'statement', StatementUploadViewSet, basename='statement')
router.register(r'bank', BankConnectionViewSet, basename='bank')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'portfolios', InvestmentPortfolioViewSet, basename='portfolio')
router.register(r'assets', AssetViewSet, basename='asset')
router.register(r'lms/courses', CourseViewSet, basename='course')
router.register(r'lms/videos', VideoViewSet, basename='video')
router.register(r'lms/progress', UserProgressViewSet, basename='progress')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('authentication.urls')),
    path('api/', include(router.urls)),
    path('api/finance/', include('finance.urls')),
    path('api/ai/', include('ai.urls')),
    
    # Swagger UI
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
