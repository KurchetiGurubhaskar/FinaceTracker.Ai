from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from finance.models import Transaction
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import json
import re

class PredictSpendingView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch last 90 days of transactions for the user
        end_date = timezone.now()
        start_date = end_date - timedelta(days=90)
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__gte=start_date,
            transaction_type='EXPENSE'
        )

        # Mock ML Logic: Calculate average daily spend
        total_spend = sum(t.amount for t in transactions)
        avg_daily_spend = float(total_spend) / 90 if transactions else 500.0

        # Generate predictions for the next 30 days
        predictions = []
        current = end_date
        for i in range(1, 31):
            future_date = current + timedelta(days=i)
            # Add some simulated seasonality/variance (e.g. higher on weekends)
            variance = 1.2 if future_date.weekday() >= 5 else 0.9
            predicted_amount = avg_daily_spend * variance
            predictions.append({
                "date": future_date.strftime('%Y-%m-%d'),
                "predicted_amount": round(predicted_amount, 2)
            })

        return Response({
            "status": "success",
            "model": "Fallback Statistical (Moving Average)",
            "predictions": predictions
        })


class DetectAnomaliesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch last 30 days
        end_date = timezone.now()
        start_date = end_date - timedelta(days=30)
        
        transactions = Transaction.objects.filter(
            user=request.user,
            date__gte=start_date,
            transaction_type='EXPENSE'
        )

        if not transactions:
            return Response({"anomalies": []})

        # Calculate mean and standard deviation
        amounts = [float(t.amount) for t in transactions]
        mean = sum(amounts) / len(amounts)
        variance = sum((x - mean) ** 2 for x in amounts) / len(amounts)
        std_dev = variance ** 0.5

        threshold = mean + (2 * std_dev) # 2 Sigma rule for MVP

        anomalies = []
        for t in transactions:
            if float(t.amount) > threshold:
                anomalies.append({
                    "id": t.id,
                    "date": t.date.strftime('%Y-%m-%d'),
                    "amount": float(t.amount),
                    "merchant": t.merchant,
                    "category": getattr(t.category, 'name', 'Uncategorized'),
                    "reason": f"Amount is significantly higher than 30-day average of {round(mean, 2)}"
                })

        return Response({
            "status": "success",
            "threshold_applied": threshold,
            "anomalies": anomalies
        })


class ChatAssistantView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '').lower()
        reply = "I'm sorry, I didn't understand that. You can ask me about your recent expenses, anomalies, or predictions!"

        if re.search(r'\bspend\b|\bspent\b|\bexpense', message):
            total_spent = sum(t.amount for t in Transaction.objects.filter(user=request.user, transaction_type='EXPENSE'))
            reply = f"Based on your records, your total recorded expenses are ₹{total_spent:,.2f}."
            
        elif re.search(r'\banomalies\b|\bunusual\b|\bweird\b', message):
            reply = "I can analyze your spending for anomalies. Head over to the 'Anomalies' tab to see transactions that break your usual patterns."
            
        elif re.search(r'\bpredict\b|\bfuture\b|\bforecast\b', message):
            reply = "I predict your future spending based on your last 90 days of habits. Check the 'Predictions' tab for a detailed 30-day chart!"

        elif re.search(r'\bhello\b|\bhi\b|\bhey\b', message):
            reply = "Hello! I am your AI Financial Assistant. How can I help you analyze your money today?"

        return Response({"reply": reply})
