from flask import Flask, send_from_directory
from flask_cors import CORS
from database import db
from routes.stock_routes import stock_blueprint
import os

# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv("DATABASE_URL", "sqlite:///stocks.db")
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Frontend paths
frontend_folder = os.path.abspath(os.path.join(os.getcwd(), "..", "mission"))
dist_folder = os.path.abspath(os.path.join(os.getcwd(), "../mission/dist"))
print("Frontend folder:", frontend_folder)
print("Dist folder:", dist_folder)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Serve frontend
@app.route("/", defaults={"filename": ""})
@app.route("/<path:filename>")
def index(filename):
    print("Requested file:", filename)
    print("Dist folder exists:", os.path.exists(dist_folder))
    if os.path.exists(dist_folder):
        print("Files in dist folder:", os.listdir(dist_folder))
    if not filename:
        filename = "index.html"
    try:
        return send_from_directory(dist_folder, filename)
    except FileNotFoundError:
        return send_from_directory(dist_folder, "index.html"), 404


# Initialize database
db.init_app(app)

# Register blueprints
app.register_blueprint(stock_blueprint, url_prefix='/api')

# Create database tables when the app starts
def create_tables():
    with app.app_context():
        db.create_all()

# Run the app
if __name__ == '__main__':
    create_tables()  # Explicitly call the table creation
    app.run(debug=True)
