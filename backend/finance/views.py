from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Category, Transaction, Budget, Subscription, Goal, Loan
from .serializers import CategorySerializer, TransactionSerializer, BudgetSerializer, SubscriptionSerializer, GoalSerializer, LoanSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Subscription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
import csv
from django.http import HttpResponse

from rest_framework.parsers import MultiPartParser, FormParser
from .tasks import process_statement_task
from django.core.files.storage import default_storage
import os
import openpyxl
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

class ReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def cash_flow(self, request):
        transactions = Transaction.objects.filter(user=request.user)
        total_income = transactions.filter(category__type='INCOME').aggregate(Sum('credit'))['credit__sum'] or 0
        total_expense = transactions.filter(category__type='EXPENSE').aggregate(Sum('debit'))['debit__sum'] or 0
        net_cash_flow = total_income - total_expense
        return Response({
            'total_income': total_income,
            'total_expense': total_expense,
            'net_cash_flow': net_cash_flow
        })

    @action(detail=False, methods=['get'])
    def export_excel(self, request):
        transactions = Transaction.objects.filter(user=request.user).select_related('category').order_by('-date')
        response = HttpResponse(content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        response['Content-Disposition'] = 'attachment; filename="transactions.xlsx"'

        workbook = openpyxl.Workbook()
        worksheet = workbook.active
        worksheet.title = 'Transactions'
        worksheet.append(['Date', 'Value Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance', 'Category', 'Merchant', 'UPI Details'])
        
        for tx in transactions:
            cat_name = tx.category.name if tx.category else 'Uncategorized'
            worksheet.append([
                str(tx.date), str(tx.value_date) if tx.value_date else '', 
                tx.description, tx.reference_number, float(tx.debit), 
                float(tx.credit), float(tx.balance) if tx.balance else 0.0, 
                cat_name, tx.merchant, tx.upi_details
            ])
            
        workbook.save(response)
        return response

    @action(detail=False, methods=['get'])
    def export_pdf(self, request):
        transactions = Transaction.objects.filter(user=request.user).select_related('category').order_by('-date')
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="transactions.pdf"'
        
        doc = SimpleDocTemplate(response, pagesize=landscape(letter))
        elements = []
        
        styles = getSampleStyleSheet()
        elements.append(Paragraph("Transaction Report", styles['Title']))
        elements.append(Spacer(1, 20))
        
        data = [['Date', 'Description', 'Ref No', 'Debit', 'Credit', 'Balance', 'Category', 'Merchant']]
        
        for tx in transactions:
            cat_name = tx.category.name if tx.category else 'Uncategorized'
            desc = (tx.description[:30] + '..') if len(tx.description) > 30 else tx.description
            data.append([
                str(tx.date),
                desc,
                str(tx.reference_number),
                f"{tx.debit:.2f}",
                f"{tx.credit:.2f}",
                f"{tx.balance:.2f}" if tx.balance else "0.00",
                cat_name,
                (tx.merchant[:15] + '..') if len(tx.merchant) > 15 else str(tx.merchant)
            ])
            
        t = Table(data, repeatRows=1)
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(t)
        doc.build(elements)
        return response

from .models import StatementUpload
from .serializers import StatementUploadSerializer

class StatementUploadViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    @action(detail=False, methods=['get'])
    def history(self, request):
        uploads = StatementUpload.objects.filter(user=request.user).order_by('-created_at')
        serializer = StatementUploadSerializer(uploads, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def upload(self, request):
        file_obj = request.FILES.get('file')
        password = request.data.get('password')
        
        if not file_obj:
            return Response({"error": "No file provided"}, status=400)
            
        file_name = default_storage.save(file_obj.name, file_obj)
        file_path = default_storage.path(file_name)
        
        file_type = 'pdf' if file_name.lower().endswith('.pdf') else 'csv'
        
        # Create record in DB
        upload_record = StatementUpload.objects.create(
            user=request.user,
            file_name=file_obj.name,
            file_type=file_type,
            status='PENDING'
        )
        
        # Trigger Celery Task
        task = process_statement_task.delay(file_path, request.user.id, file_type, password, upload_record.id)
        
        return Response({
            "message": "File is being processed", 
            "task_id": task.id,
            "upload_id": upload_record.id
        })

class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class LoanViewSet(viewsets.ModelViewSet):
    serializer_class = LoanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Loan.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

from .models import BankConnection, Notification
from .serializers import BankConnectionSerializer, NotificationSerializer
from .services.bank_sync import SimulatedBankService
from .tasks import sync_bank_account, generate_ai_insights

class BankConnectionViewSet(viewsets.ModelViewSet):
    serializer_class = BankConnectionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BankConnection.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def connect(self, request):
        """Simulate connecting to a bank via Open Banking."""
        public_token = request.data.get('public_token', 'mock_token')
        mock_data = SimulatedBankService.exchange_public_token(public_token)
        
        # Save Connection
        conn, created = BankConnection.objects.get_or_create(
            user=request.user,
            account_id=mock_data['account_id'],
            defaults={
                'institution_name': mock_data['institution_name'],
                'access_token': mock_data['access_token']
            }
        )
        
        # Trigger initial sync
        sync_bank_account.delay(request.user.id, conn.id)
        
        return Response({"message": "Bank connected successfully!", "connection_id": conn.id})

    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Trigger a manual sync (useful since celery-beat is offline)."""
        sync_bank_account.delay(request.user.id, pk)
        return Response({"message": "Sync triggered successfully!"})

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=False, methods=['post'])
    def generate_insights(self, request):
        """Manually trigger AI insight generation."""
        generate_ai_insights.delay(request.user.id)
        return Response({"message": "AI Insights generation started."})
