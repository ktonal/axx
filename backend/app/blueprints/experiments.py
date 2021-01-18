from flask import Blueprint, send_from_directory, request, current_app as app
from bson.json_util import dumps as json_dumps


bp = Blueprint("experiments", __name__, url_prefix="/experiments/")


@bp.route('/', methods=("GET",))
def get_experiments():

    # get the collection
    exps = app.db.Experiments
    return json_dumps(exps.find())
