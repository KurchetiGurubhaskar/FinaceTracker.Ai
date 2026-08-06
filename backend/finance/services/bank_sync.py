import random
from datetime import datetime, timedelta
import uuid

class SimulatedBankService:
    """
    A mock Open Banking service (like Plaid Sandbox) that generates
    realistic transaction data for testing the sync and AI engines.
    """

    @staticmethod
    def exchange_public_token(public_token):
        """Simulate exchanging a public token for an access token."""
        return {
            'access_token': f"access-sandbox-{uuid.uuid4()}",
            'account_id': f"acc_{uuid.uuid4().hex[:8]}",
            'institution_name': "HDFC Bank (Sandbox)"
        }

    @staticmethod
    def fetch_transactions(access_token, start_date, end_date):
        """Generate some random but realistic transactions for the period."""
        transactions = []
        
        # Determine number of days
        days = (end_date - start_date).days
        if days < 0:
            return []

        # We will generate a few typical transactions
        # Salary
        transactions.append({
            'date': start_date + timedelta(days=1),
            'description': 'NEFT-SALARY-TECHCORP INC',
            'amount': 85000.00,
            'type': 'CREDIT',
            'reference': f"REF{uuid.uuid4().hex[:8].upper()}"
        })

        # Subscriptions
        transactions.append({
            'date': start_date + timedelta(days=5),
            'description': 'NETFLIX PREMIUM',
            'amount': 649.00,
            'type': 'DEBIT',
            'reference': f"REF{uuid.uuid4().hex[:8].upper()}"
        })

        # EMI
        transactions.append({
            'date': start_date + timedelta(days=10),
            'description': 'EMI HDFC HOME LOAN',
            'amount': 25000.00,
            'type': 'DEBIT',
            'reference': f"REF{uuid.uuid4().hex[:8].upper()}"
        })

        # Random Expenses
        for _ in range(3):
            random_day = random.randint(0, days)
            amount = round(random.uniform(100.0, 2000.0), 2)
            merchants = ['UBER RIDES', 'ZOMATO ONLINE', 'AMAZON PAY', 'STARBUCKS', 'SHELL PETROL']
            transactions.append({
                'date': start_date + timedelta(days=random_day),
                'description': f"UPI-{random.choice(merchants)}-{uuid.uuid4().hex[:6]}",
                'amount': amount,
                'type': 'DEBIT',
                'reference': f"REF{uuid.uuid4().hex[:8].upper()}"
            })

        # Sort by date
        transactions.sort(key=lambda x: x['date'])
        return transactions
