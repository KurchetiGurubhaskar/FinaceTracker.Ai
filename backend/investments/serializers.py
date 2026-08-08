from rest_framework import serializers
from .models import InvestmentPortfolio, Asset

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'
        read_only_fields = ('portfolio',)

class InvestmentPortfolioSerializer(serializers.ModelSerializer):
    assets = AssetSerializer(many=True, read_only=True)
    
    class Meta:
        model = InvestmentPortfolio
        fields = '__all__'
        read_only_fields = ('user', 'organization')
