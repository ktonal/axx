from flask import Blueprint, send_from_directory, request, current_app as app, Response
from bson.json_util import dumps as json_dumps
import re
import json


bp = Blueprint("experiments", __name__, url_prefix="/experiments/")


@bp.route('/', methods=("GET",))
def get_experiments():

    # get the collection
    raw = app.db.Experiments.find()
    sanitized = re.sub(r"NaN", "null", json_dumps(raw))
    exps = json.loads(sanitized)
    columns = list(set([k for e in exps for k in e.keys()
                        if k not in ("_id", "audios")]))
    resp = {"columns": columns, "data": exps}
    return resp
