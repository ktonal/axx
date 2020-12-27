#!/bin/bash

export FLASK_APP=./neptune_server/app.py
flask run & npm start --prefix report-ui/
