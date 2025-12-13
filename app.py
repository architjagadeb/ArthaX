from flask import Flask, render_template, jsonify, request, redirect, url_for, flash
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import check_password_hash
from datetime import datetime, date
import json
import os

from models import db, User, UserProfile, Expense, Saving

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///arthax.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message = 'Please log in to access this page.'

@login_manager.user_loader
def load_user(user_id):
    """Load user for Flask-Login"""
    return User.query.get(int(user_id))

# Create tables
with app.app_context():
    db.create_all()

# Load dummy data for non-auth pages
def load_data():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'dummy_data.json')
    with open(data_path, 'r') as f:
        return json.load(f)

# ==================== Financial Calculation Helpers ====================

def calculate_financial_data(user):
    """Calculate all financial metrics for a user"""
    if not user or not user.profile:
        return None
    
    profile = user.profile
    today = date.today()
    first_day = date(today.year, today.month, 1)
    
    # Get current month expenses
    expenses = Expense.query.filter_by(user_id=user.id)\
                           .filter(Expense.date >= first_day)\
                           .all()
    total_spent = sum(exp.amount for exp in expenses)
    
    # Get all savings
    all_savings = Saving.query.filter_by(user_id=user.id).all()
    total_savings = sum(sav.amount for sav in all_savings)
    
    # Get current month savings
    month_savings = Saving.query.filter_by(user_id=user.id)\
                                .filter(Saving.date >= first_day)\
                                .all()
    savings_this_month = sum(sav.amount for sav in month_savings)
    
    # Calculate monthly budget
    # Monthly Budget = Monthly Income (available for spending)
    monthly_budget = profile.monthly_income
    
    # Calculate budget used percentage (capped at 100%)
    budget_used_percent = min((total_spent / monthly_budget * 100) if monthly_budget > 0 else 0, 100)
    
    # Calculate savings progress (capped at 100%)
    savings_progress = min((total_savings / profile.savings_goal * 100) if profile.savings_goal > 0 else 0, 100)
    
    # Get recent expenses and savings (last 10 each)
    recent_expenses = Expense.query.filter_by(user_id=user.id)\
                                   .order_by(Expense.date.desc())\
                                   .limit(10)\
                                   .all()
    
    recent_savings = Saving.query.filter_by(user_id=user.id)\
                                 .order_by(Saving.date.desc())\
                                 .limit(10)\
                                 .all()
    
    return {
        'profile': profile,
        'total_spent': total_spent,
        'total_savings': total_savings,
        'savings_this_month': savings_this_month,
        'monthly_budget': monthly_budget,
        'budget_used_percent': budget_used_percent,
        'savings_progress': savings_progress,
        'expenses': [exp.to_dict() for exp in recent_expenses],
        'savings': [sav.to_dict() for sav in recent_savings]
    }

# ==================== Routes ====================

@app.route('/')
def home():
    data = load_data()
    
    # If user is logged in, show their real financial data
    if current_user.is_authenticated:
        financial_data = calculate_financial_data(current_user)
        if financial_data:
            return render_template('home.html',
                                 financial_data=financial_data,
                                 chart_data=data['studentChartData'],
                                 student_tips=data['studentTips'][:3],
                                 markets=data['markets'],
                                 is_authenticated=True)
    
    # Otherwise show dummy data
    return render_template('home.html', 
                         student_stats=data['studentStats'],
                         chart_data=data['studentChartData'],
                         student_tips=data['studentTips'][:3],
                         markets=data['markets'],
                         is_authenticated=False)

@app.route('/markets')
def markets():
    data = load_data()
    return render_template('markets.html', markets=data['markets'])

@app.route('/news')
def news():
    data = load_data()
    return render_template('news.html', news=data['news'])

# ==================== Authentication Routes ====================

@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirmPassword', '')
        
        # Validation
        if not username or not email or not password:
            flash('All fields are required.', 'error')
            return render_template('signup.html')
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('signup.html')
        
        if len(password) < 6:
            flash('Password must be at least 6 characters long.', 'error')
            return render_template('signup.html')
        
        # Check if user already exists
        if User.query.filter_by(username=username).first():
            flash('Username already exists.', 'error')
            return render_template('signup.html')
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered.', 'error')
            return render_template('signup.html')
        
        # Create new user
        user = User(username=username, email=email)
        user.set_password(password)
        
        try:
            db.session.add(user)
            db.session.commit()
            login_user(user)
            flash('Account created successfully!', 'success')
            return redirect(url_for('portfolio'))
        except Exception as e:
            db.session.rollback()
            flash('An error occurred. Please try again.', 'error')
            return render_template('signup.html')
    
    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('portfolio'))
    
    if request.method == 'POST':
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        
        if not email or not password:
            flash('Email and password are required.', 'error')
            return render_template('login.html')
        
        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page) if next_page else redirect(url_for('portfolio'))
        else:
            flash('Invalid email or password.', 'error')
            return render_template('login.html')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('home'))

# ==================== Portfolio Routes ====================

@app.route('/portfolio', methods=['GET', 'POST'])
@login_required
def portfolio():
    # Handle onboarding form submission
    if request.method == 'POST' and 'onboarding' in request.form:
        monthly_income = float(request.form.get('monthly_income', 0))
        savings_goal = float(request.form.get('savings_goal', 0))
        current_savings = float(request.form.get('current_savings', 0))
        
        if monthly_income <= 0 or savings_goal <= 0:
            flash('Please enter valid amounts.', 'error')
            return render_portfolio_page(show_onboarding=True)
        
        # Create or update profile
        profile = current_user.profile
        if not profile:
            profile = UserProfile(
                user_id=current_user.id,
                monthly_income=monthly_income,
                savings_goal=savings_goal,
                current_savings=current_savings
            )
            db.session.add(profile)
        else:
            profile.monthly_income = monthly_income
            profile.savings_goal = savings_goal
            profile.current_savings = current_savings
            profile.updated_at = datetime.utcnow()
        
        db.session.commit()
        flash('Profile updated successfully!', 'success')
        return redirect(url_for('portfolio'))
    
    return render_portfolio_page()

def render_portfolio_page(show_onboarding=False):
    """Helper function to render portfolio page with data"""
    profile = current_user.profile
    
    # Check if onboarding is needed
    if not profile or show_onboarding:
        return render_template('portfolio.html', 
                             financial_data=None,
                             show_onboarding=True)
    
    # Use shared calculation function
    financial_data = calculate_financial_data(current_user)
    
    return render_template('portfolio.html',
                         financial_data=financial_data,
                         show_onboarding=False)

@app.route('/api/expenses', methods=['POST'])
@login_required
def add_expense():
    """API endpoint to add new expense"""
    try:
        data = request.get_json()
        
        expense_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        category = data['category']
        amount = float(data['amount'])
        note = data.get('note', '').strip()
        
        if amount <= 0:
            return jsonify({'success': False, 'error': 'Amount must be greater than 0'}), 400
        
        # Create expense
        expense = Expense(
            user_id=current_user.id,
            date=expense_date,
            category=category,
            amount=amount,
            note=note if note else None
        )
        
        db.session.add(expense)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'expense': expense.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/savings', methods=['POST'])
@login_required
def add_saving():
    """API endpoint to add new savings entry"""
    try:
        data = request.get_json()
        
        saving_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        amount = float(data['amount'])
        note = data.get('note', '').strip()
        
        if amount <= 0:
            return jsonify({'success': False, 'error': 'Amount must be greater than 0'}), 400
        
        # Create saving
        saving = Saving(
            user_id=current_user.id,
            date=saving_date,
            amount=amount,
            note=note if note else None
        )
        
        db.session.add(saving)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'saving': saving.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 400

@app.route('/api/data')
def api_data():
    return jsonify(load_data())

if __name__ == "__main__":
    app.run(debug=True)
