"""
Elastic Beanstalk entry point
This file imports the Flask app from app.py
"""
from app import app as application

if __name__ == '__main__':
    application.run()
