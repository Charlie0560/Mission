from celery import Celery

def make_celery(app_name=__name__):
    return Celery(
        app_name,
        backend='redis://localhost:6379/0',
        broker='redis://localhost:6379/0',
        include=['tasks.stock_tasks'] 
    )

celery = make_celery()
