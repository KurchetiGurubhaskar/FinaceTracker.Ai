from rest_framework import serializers
from .models import Category, Transaction, Budget, Subscription, Goal, Loan

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
        read_only_fields = ('user',)

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
        read_only_fields = ('user',)

class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ('user',)

class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ('user',)

class GoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = '__all__'
        read_only_fields = ('user',)

class LoanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Loan
        fields = '__all__'
        read_only_fields = ('user',)

from .models import BankConnection, Notification, StatementUpload

class BankConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = BankConnection
        fields = '__all__'
        read_only_fields = ('user', 'access_token')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ('user',)

class StatementUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatementUpload
        fields = '__all__'
        read_only_fields = ('user',)
