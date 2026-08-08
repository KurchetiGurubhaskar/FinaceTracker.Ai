from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import InvestmentPortfolio, Asset
from .serializers import InvestmentPortfolioSerializer, AssetSerializer

class InvestmentPortfolioViewSet(viewsets.ModelViewSet):
    serializer_class = InvestmentPortfolioSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return InvestmentPortfolio.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Asset.objects.filter(portfolio__user=self.request.user)
