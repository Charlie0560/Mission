from flask import Blueprint, request, jsonify
from tasks.stock_tasks import process_stocks_task
from flask_cors import CORS

stock_blueprint = Blueprint('stocks', __name__)
CORS(stock_blueprint, origins=["https://mission-beta.vercel.app"])

@stock_blueprint.route('/process-stocks', methods=['POST'])
def process_stocks_route():
    data = request.json
    price = data.get('price')
    interval = data.get('interval')
    cdate = data.get('cdate')

    if not price or not interval:
        return jsonify({"error": "Missing required parameters"}), 400

    task = process_stocks_task.delay(price, interval, cdate)
    return jsonify({"task_id": task.id})


@stock_blueprint.route('/task-status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    from celery.result import AsyncResult
    from celery_worker import celery

    task = AsyncResult(task_id, app=celery)

    if task.state == 'PENDING':
        response = {"status": "pending"}
    elif task.state == 'SUCCESS':
        response = {"status": "completed", "data": task.result}
    elif task.state == 'FAILURE':
        response = {"status": "failed", "error": str(task.result)}
    else:
        response = {"status": task.state}

    return jsonify(response)
