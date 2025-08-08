#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
API_DIR=$SCRIPT_DIR/../api

VENUES_JSON="$SCRIPT_DIR/venues.json"
DB_NAME=bbf
DB_USER=bbf
DB_HOST=localhost
DB_PASSWORD_FILE="temp.secret"

echo "bbf" > $DB_PASSWORD_FILE
DB_PASSWORD_FILE_PATH=`realpath $DB_PASSWORD_FILE`

pushd $API_DIR > /dev/null

poetry install
poetry run python src/api/populate.py $VENUES_JSON $DB_HOST $DB_NAME $DB_USER $DB_PASSWORD_FILE_PATH

rm $DB_PASSWORD_FILE_PATH

popd > /dev/null