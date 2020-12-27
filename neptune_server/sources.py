import neptune
import os
import json
import pandas as pd
from zipfile import ZipFile
import shutil
from flask import Blueprint, send_from_directory, request


sources = Blueprint("sources", __name__)

# the public folder from where we'll serve data
PUBLIC_ROOT = "/tmp/neptune-server"

if not os.path.exists(PUBLIC_ROOT):
    os.mkdir(PUBLIC_ROOT)

# the user we get data for
USER = "k-tonal"


def format_parameters(param_dict):
    return [{"name": k, "value": str(v)} for k, v in param_dict.items()]


@sources.route('/projects', methods=("GET",))
def get_projects():
    api_token = os.environ["NEPTUNE_API_TOKEN"]
    session = neptune.Session.with_default_backend(api_token=api_token)
    projects = session.get_projects(USER)
    return json.dumps([{"name": p,
                        "onDisk": os.path.exists(os.path.join(PUBLIC_ROOT, p.split("/")[-1])),
                        "experiments": [e.id
                                        for e in session.get_project(p).get_experiments()]}
                       for p in projects])


@sources.route('/experiment-data/<namespace>/<project_name>/<exp_id>', methods=("GET",))
def get_experiment_data(namespace, project_name, exp_id):
    """
    Download experiment data when triggered by the route :
    ..../experiment-data?namespace=..,name=...,id=...

    @return: the available data : JSON {"audios": [filename, filename,...], "hparams": {key: value}}
    """
    print(namespace, project_name, exp_id)
    api_token = os.environ["NEPTUNE_API_TOKEN"]
    session = neptune.Session.with_default_backend(api_token=api_token)
    project = session.get_project(namespace + "/" + project_name)
    exp = project.get_experiments(id=exp_id)[0]

    response = dict(audios=[], hparams={}, properties={})
    # get what we can from neptune
    response["properties"] = exp.get_system_properties()
    response["properties"]["channels"] = {k: v.y for k, v in exp.get_logs().items()}
    response["hparams"] = format_parameters(exp.get_parameters())

    destination = os.path.join(PUBLIC_ROOT, project_name, exp_id)
    # clean it up
    if os.path.exists(destination):
        shutil.rmtree(destination)
    else:
        if os.path.exists(os.path.join(PUBLIC_ROOT, project_name)):
            os.mkdir(destination)
        else:
            os.makedirs(os.path.join(PUBLIC_ROOT, project_name))
            os.mkdir(destination)

    # we should have only one root folder in exp_root with sub-folders audios/, logs/ & states/
    for folder in ["audios", "logs", "states"]:
        # download
        try:
            exp.download_artifacts(folder + "/", destination)
        except neptune.exceptions.FileNotFound:
            print("No %s found for experiment %s" % (folder, exp_id))
            continue
        # unzip
        with ZipFile(os.path.join(destination, folder + ".zip")) as f:
            f.extractall(destination)
        # clean up
        os.remove(os.path.join(destination, folder + ".zip"))
        # load response
        if folder == "states":
            shutil.rmtree(os.path.join(destination, "states"))
        elif folder == "audios":
            response["audios"] = os.listdir(os.path.join(destination, folder))
        elif folder == "logs":
            # cache the path to serve tensorboard later
            # response["properties"].setdefault("logs", os.path.join(destination, folder))
            # maybe the experiment was run offline...
            if not response["hparams"]:
                hparams_path = os.path.join(destination, folder, "meta_tags.csv")
                response["hparams"] = pd.read_csv(hparams_path).to_dict()
                # shutil.rmtree(os.path.join(exp_root, "logs"))
                print(response["hparams"])

    try:
        return response
    finally:
        # cache after responding
        with open(os.path.join(destination, "summary.json"), "w") as f:
            f.write(json.dumps(response, indent=4, sort_keys=True, default=str))


@sources.route('/summary/<project_name>/<experiment_id>', methods=("GET",))
def get_summary(project_name, experiment_id):
    with open(os.path.join(PUBLIC_ROOT, project_name, experiment_id, "summary.json"), "r") as f:
        return json.loads(f.read())


@sources.route('/audio/<project_name>/<experiment_id>/<filename>/', methods=("GET",))
def get_audio(project_name, experiment_id, filename):
    return send_from_directory(os.path.join(PUBLIC_ROOT, project_name, experiment_id, "audios"), filename)


@sources.route("/edit/<namespace>/<project_name>/<experiment_id>/", methods=("PUT", ))
def edit_experiment(namespace, project_name, experiment_id):
    api_token = os.environ["NEPTUNE_API_TOKEN"]
    session = neptune.Session.with_default_backend(api_token=api_token)
    project = session.get_project(namespace + "/" + project_name)
    exp = project.get_experiments(id=experiment_id)[0]

    print(request)
    tags = exp.get_tags()
    new_tags = request["tags_append"]
    delete_tags = request["tags_delete"]
    new_description = request["description"]
    new_note = request["note"]
    delete_artifacts = request["artifacts_delete"]