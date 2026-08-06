import os
import re
import json
import pdfplumber
import pandas as pd
import google.generativeai as genai
from datetime import datetime
from celery import shared_task
from .models import Transaction, Category
from django.contrib.auth import get_user_model

User = get_user_model()

@shared_task
def process_statement_task(file_path, user_id, file_type, password=None, upload_record_id=None):
    from .models import StatementUpload
    try:
        user = User.objects.get(id=user_id)
        
        # 1. Parse File
        transactions_data = []
        if file_type == 'pdf':
            transactions_data = parse_kotak_pdf(file_path, password)
        elif file_type == 'csv':
            transactions_data = parse_kotak_csv(file_path)
            
        if not transactions_data:
            if upload_record_id:
                StatementUpload.objects.filter(id=upload_record_id).update(status='FAILED')
            return {"status": "error", "message": "No transactions found or unable to parse file."}
            
        # 2. AI Categorization
        categorized_data = categorize_transactions_with_ai(transactions_data)
        
        # 3. Save to DB
        save_transactions_to_db(categorized_data, user)
        
        if upload_record_id:
            StatementUpload.objects.filter(id=upload_record_id).update(status='COMPLETED')
            
        return {"status": "success", "count": len(categorized_data)}
        
    except Exception as e:
        if upload_record_id:
            StatementUpload.objects.filter(id=upload_record_id).update(status='FAILED')
        return {"status": "error", "message": str(e)}

def extract_upi_and_merchant(description):
    """Extract UPI details and Merchant name using regex from Kotak description format."""
    upi_details = ""
    merchant = ""
    
    # Common UPI format: UPI/REF_NO/MERCHANT/...
    upi_match = re.search(r'UPI/([A-Za-z0-9]+)/([^/]+)/', description)
    if upi_match:
        upi_details = upi_match.group(1)
        merchant = upi_match.group(2).strip()
    
    # POS/ECOM format: POS/MERCHANT_NAME/CITY or ECOM/MERCHANT_NAME/...
    pos_match = re.search(r'(?:POS|ECOM|INF)/([^/]+)/', description)
    if pos_match and not merchant:
        merchant = pos_match.group(1).strip()
        
    if not merchant:
        # Fallback to the first few words if it's not a standard recognized format
        merchant = " ".join(description.split()[:3])
        
    return upi_details, merchant

def parse_kotak_pdf(file_path, password=None):
    extracted = []
    try:
        with pdfplumber.open(file_path, password=password) as pdf:
            for page in pdf.pages:
                table = page.extract_table()
                if table:
                    for row in table[1:]: # Skip header
                        if len(row) >= 7 and row[0]: # Date column is not empty
                            try:
                                # Kotak standard format: [Date, Value Date, Description, Ref/Chq No, Debit, Credit, Balance]
                                date_str = row[0].replace('\n', ' ') if row[0] else ''
                                value_date_str = row[1].replace('\n', ' ') if len(row) > 1 and row[1] else ''
                                desc = row[2].replace('\n', ' ') if len(row) > 2 and row[2] else ''
                                ref_no = row[3].replace('\n', ' ') if len(row) > 3 and row[3] else ''
                                
                                debit_str = row[4].replace(',', '').replace('\n', '') if len(row) > 4 and row[4] else '0'
                                credit_str = row[5].replace(',', '').replace('\n', '') if len(row) > 5 and row[5] else '0'
                                balance_str = row[6].replace(',', '').replace('\n', '') if len(row) > 6 and row[6] else '0'
                                
                                debit = float(debit_str) if debit_str.strip() else 0.0
                                credit = float(credit_str) if credit_str.strip() else 0.0
                                balance = float(balance_str) if balance_str.strip() else 0.0
                                
                                # Date parsing
                                try:
                                    parsed_date = datetime.strptime(date_str, '%d-%b-%y').date() if '-' in date_str else datetime.now().date()
                                except ValueError:
                                    parsed_date = datetime.now().date()
                                    
                                try:
                                    parsed_value_date = datetime.strptime(value_date_str, '%d-%b-%y').date() if '-' in value_date_str else parsed_date
                                except ValueError:
                                    parsed_value_date = parsed_date

                                upi_details, merchant = extract_upi_and_merchant(desc)

                                extracted.append({
                                    'date': parsed_date,
                                    'value_date': parsed_value_date,
                                    'description': desc,
                                    'reference_number': ref_no,
                                    'debit': debit,
                                    'credit': credit,
                                    'balance': balance,
                                    'upi_details': upi_details,
                                    'merchant': merchant,
                                    'amount': credit - debit,
                                })
                            except Exception as e:
                                print(f"Error parsing PDF row {row}: {e}")
                                continue
    except Exception as e:
        print(f"PDF parsing error: {e}")
    return extracted

def parse_kotak_csv(file_path):
    extracted = []
    try:
        # Kotak CSVs usually have meta info at the top, skip first 1-2 lines. We try skipping 1.
        df = pd.read_csv(file_path, skiprows=1)
        
        # Determine column indices mapping based on Kotak standard
        # Expected: Date, Value Date, Description, Chq/Ref No, Debit, Credit, Balance
        for _, row in df.iterrows():
            if pd.isna(row.iloc[0]): continue
            
            try:
                date_str = str(row.iloc[0]).strip()
                val_date_str = str(row.iloc[1]).strip() if len(row) > 1 else ''
                desc = str(row.iloc[2]).strip() if len(row) > 2 else ''
                ref_no = str(row.iloc[3]).strip() if len(row) > 3 else ''
                
                debit_str = str(row.iloc[4]).replace(',', '') if len(row) > 4 and not pd.isna(row.iloc[4]) else '0'
                credit_str = str(row.iloc[5]).replace(',', '') if len(row) > 5 and not pd.isna(row.iloc[5]) else '0'
                balance_str = str(row.iloc[6]).replace(',', '') if len(row) > 6 and not pd.isna(row.iloc[6]) else '0'

                debit = float(debit_str) if debit_str.strip() else 0.0
                credit = float(credit_str) if credit_str.strip() else 0.0
                balance = float(balance_str) if balance_str.strip() else 0.0

                try:
                    parsed_date = datetime.strptime(date_str, '%d-%m-%Y').date()
                except ValueError:
                    try:
                        parsed_date = datetime.strptime(date_str, '%d-%b-%y').date()
                    except ValueError:
                        parsed_date = datetime.now().date()
                        
                try:
                    parsed_val_date = datetime.strptime(val_date_str, '%d-%m-%Y').date()
                except ValueError:
                    parsed_val_date = parsed_date

                upi_details, merchant = extract_upi_and_merchant(desc)

                extracted.append({
                    'date': parsed_date,
                    'value_date': parsed_val_date,
                    'description': desc,
                    'reference_number': ref_no,
                    'debit': debit,
                    'credit': credit,
                    'balance': balance,
                    'upi_details': upi_details,
                    'merchant': merchant,
                    'amount': credit - debit,
                })
            except Exception as e:
                print(f"Error parsing CSV row: {e}")
                continue
    except Exception as e:
        print(f"CSV parsing error: {e}")
        
    return extracted

def categorize_transactions_with_ai(transactions):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return transactions
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Process in smaller batches if large, but we'll assume MVP small statement for now
    descriptions = [t['description'] for t in transactions]
    
    prompt = f"""
    Categorize the following bank transaction descriptions into EXACTLY one of these categories:
    Food, Travel, Shopping, Healthcare, Salary, Investment, Bills, Entertainment, Fuel, Education, Subscription, Transfer.
    
    Descriptions:
    {json.dumps(descriptions)}
    
    Return ONLY a raw JSON array of strings matching the categories in the exact same order. Do NOT include markdown formatting like ```json.
    """
    try:
        response = model.generate_content(prompt)
        categories_text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
        categories = json.loads(categories_text)
        
        for i, t in enumerate(transactions):
            t['ai_category'] = categories[i] if i < len(categories) else 'Transfer'
    except Exception as e:
        print(f"AI Categorization error: {e}")
        
    return transactions

def save_transactions_to_db(data, user):
    for item in data:
        cat_name = item.get('ai_category', 'Transfer')
        category, _ = Category.objects.get_or_create(user=user, name=cat_name, defaults={'type': 'EXPENSE' if item.get('debit', 0) > 0 else 'INCOME'})
        
        Transaction.objects.create(
            user=user,
            category=category,
            date=item.get('date'),
            value_date=item.get('value_date'),
            description=item.get('description', ''),
            reference_number=item.get('reference_number', ''),
            debit=item.get('debit', 0.0),
            credit=item.get('credit', 0.0),
            balance=item.get('balance', 0.0),
            upi_details=item.get('upi_details', ''),
            merchant=item.get('merchant', ''),
            amount=item.get('amount', 0.0)
        )

@shared_task
def sync_bank_account(user_id, bank_connection_id):
    """Sync transactions for a specific bank connection."""
    from .models import BankConnection
    from .services.bank_sync import SimulatedBankService
    from datetime import datetime, timedelta
    
    try:
        user = User.objects.get(id=user_id)
        connection = BankConnection.objects.get(id=bank_connection_id, user=user)
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = connection.last_sync.date() if connection.last_sync else (end_date - timedelta(days=30))
        
        # Fetch mock transactions
        raw_txs = SimulatedBankService.fetch_transactions(connection.access_token, start_date, end_date)
        if not raw_txs:
            return {"status": "success", "message": "No new transactions"}
            
        # Map to our standard format
        mapped_txs = []
        for tx in raw_txs:
            debit = tx['amount'] if tx['type'] == 'DEBIT' else 0.0
            credit = tx['amount'] if tx['type'] == 'CREDIT' else 0.0
            mapped_txs.append({
                'date': tx['date'],
                'value_date': tx['date'],
                'description': tx['description'],
                'reference_number': tx['reference'],
                'debit': debit,
                'credit': credit,
                'amount': credit - debit,
                'balance': 0.0,
                'upi_details': '',
                'merchant': ''
            })
            
        # AI Categorize & Save
        categorized = categorize_transactions_with_ai(mapped_txs)
        save_transactions_to_db(categorized, user)
        
        # Update last sync time
        connection.last_sync = datetime.now()
        connection.save()
        
        # Trigger event detection asynchronously
        detect_financial_events.delay(user_id)
        
        return {"status": "success", "count": len(categorized)}
    except Exception as e:
        print(f"Sync error: {e}")
        return {"status": "error", "message": str(e)}

@shared_task
def detect_financial_events(user_id):
    """Detects recurring bills, salary, and loans."""
    from .models import Subscription, Category, Transaction, Notification
    from django.db.models import Sum
    try:
        user = User.objects.get(id=user_id)
        recent_txs = Transaction.objects.filter(user=user).order_by('-date')[:50]
        
        for tx in recent_txs:
            desc = tx.description.lower()
            
            # Detect Salary
            if 'salary' in desc and tx.credit > 5000:
                Notification.objects.get_or_create(
                    user=user, type='SYSTEM', title='Salary Detected',
                    defaults={'message': f"We detected a salary deposit of ₹{tx.credit}."}
                )
            
            # Detect Subscription
            if any(sub in desc for sub in ['netflix', 'spotify', 'amazon', 'prime']):
                Subscription.objects.get_or_create(
                    user=user, name=tx.merchant or tx.description[:20],
                    defaults={'amount': tx.debit, 'next_billing_date': tx.date + timedelta(days=30)}
                )
                
            # Detect Loan EMI
            if 'emi' in desc or 'loan' in desc:
                Notification.objects.get_or_create(
                    user=user, type='SYSTEM', title='EMI Payment Detected',
                    defaults={'message': f"EMI payment of ₹{tx.debit} detected."}
                )
    except Exception as e:
        print(f"Event detection error: {e}")

@shared_task
def generate_ai_insights(user_id):
    """Use Gemini to generate savings insights and budget alerts."""
    from .models import Transaction, Notification
    import google.generativeai as genai
    
    try:
        user = User.objects.get(id=user_id)
        # Gather recent expenses
        txs = Transaction.objects.filter(user=user, debit__gt=0).order_by('-date')[:30]
        if not txs: return
        
        data_str = ", ".join([f"{t.category.name if t.category else 'Misc'}: {t.debit}" for t in txs])
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key: return
        
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Based on these recent expenses: {data_str}.
        Provide ONE short, 2-sentence financial tip or savings recommendation. 
        Focus on the highest spending categories.
        """
        response = model.generate_content(prompt)
        insight = response.text.strip()
        
        Notification.objects.create(
            user=user, type='SAVINGS_INSIGHT', title='AI Savings Insight', message=insight
        )
    except Exception as e:
        print(f"AI Insight error: {e}")
