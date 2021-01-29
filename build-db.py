import shutil
import os
import neptune
import re
import pandas as pd
from zipfile import ZipFile
from multiprocessing import Pool, cpu_count
import uuid
import json
import ffmpeg


def download_audios(index, project_name, exp_id):
    print("----> downloading audios for ", exp_id)
    api_token = os.environ["NEPTUNE_API_TOKEN"]
    session = neptune.Session.with_default_backend(api_token=api_token)
    project = session.get_project("k-tonal/" + project_name)
    exp = project.get_experiments(id=exp_id)[0]
    destination = os.path.join("public/files", project_name, exp_id)
    # first clean up
    if os.path.exists(destination):
        shutil.rmtree(destination)
    # then download
    try:
        exp.download_artifacts("audios", destination)
    except neptune.exceptions.FileNotFound:
        return (index, {})
    archive = os.path.join(destination, "audios.zip")
    with ZipFile(archive) as f:
        f.extractall(destination)
    os.remove(archive)
    for f in os.listdir(os.path.join(destination, "audios")):
        stream = ffmpeg.input(os.path.join(destination, "audios", f))
        stream.output(os.path.join(destination, "audios", os.path.splitext(f)[0] + ".mp3")).run()
        os.remove(os.path.join(destination, "audios", f))
    return (
        index, {
            "_id": str(uuid.uuid4()),
            "project": project.name,
            # remove "public" prefix from root!
            "audios": [os.path.join(*destination.split("/")[1:], "audios", f)
                       for f in os.listdir(os.path.join(destination, "audios"))]
        })


def build_db(prior_json, user, projects):
    print("---- Initializing K-TONAL ----")
    print("--------------------", pd.__version__)

    api_token = os.environ["NEPTUNE_API_TOKEN"]
    print(api_token)
    session = neptune.Session.with_default_backend(api_token=api_token)
    prior = [exp for exp in prior_json if exp.get("project", "") in projects]
    projects = {name: proj for name, proj in session.get_projects(user).items() if proj.name in projects}
    print(len(prior), "experiments already on disk")
    all_exps = []
    for name, project in projects.items():
        df = project.get_leaderboard()
        df = df.drop(columns=[col for col in df.columns if "property_param__" in col])
        df = df.drop(columns=["name", "finished", "owner", "size", "tags"])
        df = df.rename(columns={name: re.sub(r"(channel_|parameter_)", "", name) for name in df.columns})
        df["running_time"] = pd.to_datetime(df.running_time, unit='s').dt.strftime("%Hh-%Mm-%Ss")
        df["created"] = df.created.dt.strftime('%B %d, %Y')
        df = df.where(pd.notnull(df), "-")

        for e in prior:
            if any(df["id"].str.contains(e["id"])):
                df = df[df["id"] != e["id"]]
        print(len(df), "experiments to add")

        exps = df.to_dict(orient="index")
        # replace NaN with "-"
        exps = [{k: v if pd.notnull(v) else None for k, v in m.items()} for m in list(exps.values())]
        # exps = dict([(i, d) for i, d in exps.items() if i < 10])

        with Pool(cpu_count()) as p:
            updates = p.starmap(download_audios, [(i, project.name, exp["id"])
                                                  for i, exp in enumerate(exps)])
        updates = dict(updates)
        for i, u in updates.items():
            exp = exps[i]
            exp.update(u)

        all_exps += exps

    all_exps = all_exps + prior
    print("saving", len(all_exps), "experiments")
    with open("src/experiments.json", "w") as f:
        f.write(json.dumps(all_exps))

    return None


if __name__ == '__main__':
    USER = "k-tonal"
    PROJECTS = ("experiment-1", "experiment-2", "experiment-1-K3")
    prior = json.load(open("src/experiments.json", "r"))
    build_db(prior, USER, PROJECTS)
