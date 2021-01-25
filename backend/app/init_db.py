from pymongo import MongoClient
import os
import neptune
import re
import pandas as pd
from zipfile import ZipFile
from multiprocessing import Pool, cpu_count


def init_db():
    client = MongoClient(host=os.environ["MONGODB_HOST"], port=27017)
    admin, admin_pw = os.environ["MONGO_INITDB_ROOT_USERNAME"], os.environ["MONGO_INITDB_ROOT_PASSWORD"]
    client.admin.authenticate(admin, admin_pw)
    db_name = os.environ["MONGO_INITDB_DATABASE"]
    if db_name not in client.list_database_names():
        print("---- Initializing mongodb ----")
        client[db_name].add_user(os.environ["MONGODB_USERNAME"], os.environ["MONGODB_PASSWORD"],
                                 roles=[{"role": "readWrite", "db": db_name}])


def download_audios(index, project_name, exp_id):
    print("----> downloading audios for ", exp_id)
    api_token = os.environ["NEPTUNE_API_TOKEN"]
    session = neptune.Session.with_default_backend(api_token=api_token)
    project = session.get_project("k-tonal/" + project_name)
    exp = project.get_experiments(id=exp_id)[0]
    destination = os.path.join("files", project_name, exp_id)
    try:
        exp.download_artifacts("audios", destination)
    except neptune.exceptions.FileNotFound:
        return (index, {})
    archive = os.path.join(destination, "audios.zip")
    with ZipFile(archive) as f:
        f.extractall(destination)
    os.remove(archive)
    return (
        index, {
            "project": project.name,
            "audios": [os.path.join(destination, "audios", f)
                       for f in os.listdir(os.path.join(destination, "audios"))]
        })


def init_k_tonal(db):
    print("---- Initializing K-TONAL ----")
    init_db()
    api_token = os.environ["NEPTUNE_API_TOKEN"]
    session = neptune.Session.with_default_backend(api_token=api_token)
    projects = session.get_projects("k-tonal")

    Exps = db.Experiments
    # RESET everything!
    # print("----> Dropping pre-existing Experiments Table")
    # Exps.drop()

    for name, project in projects.items():
        if "experiment-" not in project.name:
            continue

        df = project.get_leaderboard()
        df = df.drop(columns=[col for col in df.columns if "property_param__" in col])
        df = df.drop(columns=["name", "finished", "owner", "size", "tags"])
        # should keep those as is for the frontend ?
        df = df.rename(columns={name: re.sub(r"(channel_|parameter_)", "", name) for name in df.columns})
        df["running_time"] = pd.to_datetime(df.running_time, unit='s').dt.strftime("%Hh-%Mm-%Ss")
        df["created"] = df.created.dt.strftime('%B %d, %Y')

        prior = list(Exps.find({"project": {"$in": ["experiment-1", "experiment-2"]}}))
        for e in prior:
            if any(df["id"].str.contains(e["id"])):
                df = df[df["id"] != e["id"]]
        print(len(df), "experiments to add")
        exps = df.to_dict(orient="index")

        # exps = dict([(i, d) for i, d in exps.items() if i < 10])

        with Pool(cpu_count()) as p:
            updates = p.starmap(download_audios, [(i, project.name, exp["id"]) for i, exp in exps.items()])
        updates = dict(updates)
        for i, u in updates.items():
            exp = exps[i]
            exp.update(u)

        Exps.insert_many(list(exps.values()))
        print("-----> Successfully inserted project", project.name)
