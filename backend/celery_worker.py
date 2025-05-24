from celery import Celery
import os

def make_celery(app_name=__name__):
    return Celery(
        app_name,
        backend=os.getenv('REDIS_URL'),
        broker=os.getenv('REDIS_URL'),
        include=['tasks.stock_tasks'] 
    )

celery = make_celery()
