from flask import Flask
from flask_cors import CORS

from neptune_server.sources import sources

app = Flask(__name__)
CORS(app)
app.register_blueprint(sources)



