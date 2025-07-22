# Brum Brew Fest Tracker

Tracker for Brum Brew Fest venues

## Running locally

The easiest way to run the app is with [Docker](https://www.docker.com/) and
[Docker Compose](https://docs.docker.com/compose/).
Set up your environment variables as discussed below and run:

```sh
docker compose -f docker-compose.dev.yml up
```

You can also emulate the prod environment by running:

```sh
docker compose -f docker-compose.prod.yml up
```

## Environment variables

When running with Docker, place these in a `.env` file.

|Variable|Summary|Options|Default|
|-|-|-|-|
|`API_PORT`|Port the API runs on||`8000`|
