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
dist_folder = os.path.abspath(os.path.join(os.getcwd(), "../mission/build"))
print("Frontend folder:", frontend_folder)
print("Dist folder:", dist_folder)

# Enable CORS
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Serve frontend
@app.route("/", defaults={"filename": "index.html"})
@app.route("/<path:filename>")
def index(filename):
    print("filename: ",filename)
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


# Run the app
if __name__ == '__main__':
     app.run(debug=True ,port=8080,use_reloader=False)
