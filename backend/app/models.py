from flask_pymongo import PyMongo
from flask import current_app as app


client = PyMongo(app)
db = client.db
