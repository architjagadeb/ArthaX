# ArthaX

**ArthaX** is a **Flask-based personal finance web application** designed to help users track **expenses, savings, withdrawals, and financial goals** through a modern glassmorphism dashboard UI. It provides real-time financial insights, CSV export functionality, and interactive charts.

[Live](https://arthax.onrender.com/) | [GitHub](https://github.com/architjagadeb/ArthaX)

---

## Features

### User Accounts & Onboarding
- Sign up, log in, log out with Flask-Login authentication
- First-time onboarding form for:
  - Monthly income
  - Savings goal
  - Current savings

### Portfolio Dashboard (Logged-in Users)
- **Financial summary card**:
  - Total spent (this month)
  - Savings this month
  - Total savings
  - Savings goal with progress bar
- **Add Expense**:
  - Modal form (date, category, amount, note)
  - Updates the recent expenses table in real-time
- **Add Savings / Withdraw Savings**:
  - Deposit or withdraw amounts
  - Withdrawal validation ensures users cannot exceed total savings
- **Edit Savings Goal**
- **Export Expenses (CSV)**:
  - Downloads user-specific expense records as `arthax_expenses.csv`

### Tables & Charts
- Recent Expenses & Recent Savings (deposits + withdrawals)
- **Monthly Spending Overview Chart** powered by Chart.js
- Dynamic financial metrics calculated via backend helper functions

### Home Dashboard
- Monthly Budget Used vs. Income
- Savings Progress
- Recent savings table
- For logged-out users, shows **demo student data** with tips and charts

### Markets & News
- `/markets` page displays financial markets (Bitcoin, Sensex) using dummy data
- `/news` page shows finance tips & student money hacks

---

## Tech Stack

- **Backend**:
  - Python + Flask
  - Flask-Login for authentication
  - SQLAlchemy ORM with SQLite database
  - CSV export using Python `csv` module and `io.StringIO`
- **Frontend**:
  - Jinja2 templates
  - HTML / CSS (custom glassmorphism)
  - Vanilla JavaScript for modals, AJAX, and chart updates
  - Chart.js for interactive charts
- **Data**:
  - Real user data in database
  - Demo/student data via `data/dummy_data.json` for logged-out views

---

## Installation

1. **Clone the repository**
git clone https://github.com/architjagadeb/ArthaX.git
cd ArthaX

2. **Create a virtual environment**
# On Linux/macOS
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate

3. **Install dependencies**
pip install -r requirements.txt

4. **Set environment variables**
# On Linux/macOS
export FLASK_APP=app.py
export FLASK_ENV=development

# On Windows (Command Prompt)
set FLASK_APP=app.py
set FLASK_ENV=development

# On Windows (PowerShell)
$env:FLASK_APP="app.py"
$env:FLASK_ENV="development"

5. **Run the Flask app**
flask run

---
