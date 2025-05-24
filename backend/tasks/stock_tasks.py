from celery_worker import celery
from services.stock_service import process_stocks

@celery.task(bind=True)
def process_stocks_task(self, price, interval, cdate):
    try:
        result, failed = process_stocks(price, interval, cdate)
        return {'status': 'completed', 'result': result, 'failed': failed}
    except Exception as e:
        return {'status': 'failed', 'error': str(e)}
