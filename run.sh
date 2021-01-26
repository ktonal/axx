#!/bin/bash

export FLASK_APP=./neptune_server/app.py
flask run &
pid[0]=$!
npm start --prefix frontend/ &
pid[1]=$!
trap "kill ${pid[0]} ${pid[1]}; exit 1" INT
wait
