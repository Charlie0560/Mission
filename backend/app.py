# backend/app.py
from flask import Flask, send_from_directory
from flask_cors import CORS
from database import db
from routes.stock_routes import stock_blueprint
import os

# Initialize Flask app
app = Flask(__name__, static_folder="../mission/build", static_url_path="/")

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///stocks.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Enable CORS for API routes
CORS(app, origins=["https://mission-beta.vercel.app"]) 

# Initialize database
db.init_app(app)

# Register blueprints
app.register_blueprint(stock_blueprint, url_prefix='/api')

# Serve React app
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')
