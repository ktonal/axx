from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
import os

# from .sources import sources
from .blueprints.experiments import bp as exp_bp
from .blueprints.files import bp as files_bp
from .init_db import init_db, init_k_tonal

app = Flask(__name__)
CORS(app)
init_db()
# to properly configure the db, we need :
# 1. starts with the engine, here : "mongodb://"
# 2. <user>:<password> the ones the container 'api'
# 3. @<db-container-name> else -> unreachable!
# 4. :<port>/<db-name>
app.config["MONGO_URI"] = "mongodb://" + \
                          os.environ["MONGODB_USERNAME"] + ":" + os.environ["MONGODB_PASSWORD"] + \
                          "@" + os.environ["MONGODB_HOST"] + ":27017/" + \
                          os.environ["MONGO_INITDB_DATABASE"]
app.db = PyMongo(app).db

init_k_tonal(app.db)

# app.register_blueprint(sources)
app.register_blueprint(exp_bp)
app.register_blueprint(files_bp)


if __name__ == "__main__":
    app.run(debug=True, port=5000, host="0.0.0.0", threaded=True, use_reloader=False)