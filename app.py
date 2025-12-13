from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

# Load dummy data
def load_data():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'dummy_data.json')
    with open(data_path, 'r') as f:
        return json.load(f)

@app.route('/')
def home():
    data = load_data()
    return render_template('home.html', 
                         student_stats=data['studentStats'],
                         chart_data=data['studentChartData'],
                         student_tips=data['studentTips'][:3],
                         markets=data['markets'])

@app.route('/markets')
def markets():
    data = load_data()
    return render_template('markets.html', markets=data['markets'])

@app.route('/portfolio')
def portfolio():
    data = load_data()
    return render_template('portfolio.html', portfolio=data['portfolio'])

@app.route('/news')
def news():
    data = load_data()
    return render_template('news.html', news=data['news'])

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/api/data')
def api_data():
    return jsonify(load_data())

if __name__ == "__main__":
    app.run(debug=True)