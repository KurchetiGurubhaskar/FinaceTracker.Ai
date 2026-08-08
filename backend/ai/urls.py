from django.urls import path
from .views import PredictSpendingView, DetectAnomaliesView, ChatAssistantView

urlpatterns = [
    path('predict-spending/', PredictSpendingView.as_view(), name='ai-predict-spending'),
    path('detect-anomalies/', DetectAnomaliesView.as_view(), name='ai-detect-anomalies'),
    path('chat/', ChatAssistantView.as_view(), name='ai-chat'),
]
