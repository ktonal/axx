from flask import Flask

from neptune_server.sources import sources

app = Flask(__name__)
app.register_blueprint(sources)



