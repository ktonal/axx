from flask import Flask
from flask_cors import CORS

from .sources import sources


def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config["MONGO_URI"] = "mongodb://localhost:27017/webapp"
    with app.app_context():
        from .models import db
    app.register_blueprint(sources)

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000, host="0.0.0.0")