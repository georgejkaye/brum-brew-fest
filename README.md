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
|`CLIENT_URL`||||
|`DB_HOST`||||
|`DB_NAME`||||
|`DB_USER`||||
|`DB_PASSWORD`||||
|`FROM_EMAIL`||||
|`SMTP_SERVER`||||
|`SMTP_PORT`||||
|`SMTP_USER`||||
|`SMTP_PASSWORD`||||

## Secrets

|Secret file|Summary|
|-|-|
|`db.secret`||
|`smtp.secret`||
|`user.secret`||
