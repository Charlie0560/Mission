from flask import Blueprint, request, jsonify
from services.stock_service import process_stocks

stock_blueprint = Blueprint('stocks', __name__)

@stock_blueprint.route('/process-stocks', methods=['POST'])
def process_stocks_route():
    data = request.json
    price = data.get('price')
    interval = data.get('interval')

    if not price or not interval:
        return jsonify({"error": "Missing required parameters"}), 400

    try:
        result,failed = process_stocks(price, interval)
        return jsonify({"result": result, "failed": failed})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
