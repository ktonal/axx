from flask import Blueprint, send_from_directory, send_file
import os

bp = Blueprint("files", __name__, url_prefix="/files/")


@bp.route('/<path:path>', methods=("GET",))
def get_file(path):
    return send_from_directory("/files", path)


@bp.route('/download/<path:path>/', methods=("GET",))
def download_file(path):
    print("Inside download file", path, os.path.exists("/files/" + path))
    return send_from_directory("/files", path, as_attachment=True)