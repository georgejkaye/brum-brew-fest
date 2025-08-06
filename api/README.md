# Brum Brew Fest Tracker API

## Running locally

This project uses [Poetry](https://python-poetry.org/) to manage dependencies.
Once you have Poetry installed, run the following to set everything up.

```sh
poetry install
```

You can then run the server with the following.

```sh
poetry run python src/api/main.py
```

To check it's working, visit `localhost:8000`.

## Environment variables

|Variable|Summary|Options|Default|
|-|-|-|-|
|`API_ENV`|Toggles whether the server will reload on code changes. If set to `dev`, will reload. If set to `prod`, will not reload.|`dev`, `prod`||
|`API_PORT`|The port the server will listen on.||`8000`|