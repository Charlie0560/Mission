from flask import Blueprint, request, jsonify
from services.stock_service import process_stocks
import logging
logging.basicConfig(level=logging.INFO)

stock_blueprint = Blueprint('stocks', __name__)


@stock_blueprint.route('/process-stocks', methods=['POST'])
def process_stocks_route():
    try:
        data = request.get_json()
        logging.info("Received data: %s", data)

        price = data.get('price')
        interval = data.get('interval')
        cdate = data.get('cdate')

        if not price or not interval:
            logging.warning("Missing parameters: price=%s, interval=%s", price, interval)
            return jsonify({"error": "Missing required parameters"}), 400

        logging.info("Starting stock processing...")
        result, failed = process_stocks(price, interval, cdate)
        logging.info("Processing complete.")

        return jsonify({"result": result, "failed": failed}), 200

    except Exception as e:
        logging.exception("Error while processing stocks:")
        return jsonify({"error": str(e)}), 500
