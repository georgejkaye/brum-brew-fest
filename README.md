# Brum Brew Fest Tracker

Tracker for Brum Brew Fest venues

## Running locally

The easiest way to run the app is with [Docker](https://www.docker.com/) and
[Docker Compose](https://docs.docker.com/compose/).

Copy the contents of `setup` to the root of the repo, customise with environment
variables and secrets as discussed below, and then run:

```sh
docker compose -f docker-compose.dev.yml up
```

You can also emulate the prod environment by running:

```sh
docker compose -f docker-compose.prod.yml up
```

## Environment variables

When running with Docker, place these in a `.env` file.

|Variable|Summary|Options|Default|Required for dev|Required for prod|
|-|-|-|-|-|-|
|`API_PORT`|Port the API runs on||`8000`|yes|yes|
|`API_PROTOCOL`|Protocol of the api||`https` (prod) / `http` (dev)|yes|yes|
|`API_HOST`|Hostname of the api||`localhost:8000` (dev)|yes|yes|
|`CLIENT_PORT`|Port the client runs on||`3000`|yes|yes|
|`CLIENT_PROTOCOL`|Protocol of the client||`https` (prod) / `http` (dev)|yes|yes|
|`CLIENT_HOST`|Hostname of the client||`localhost:3000` (dev)|yes|yes|
|`DB_HOST`||||no|yes|
|`DB_NAME`||||no|yes|
|`DB_USER`||||no|yes|
|`FROM_EMAIL`|Address to sends emails from the server|||yes|yes|
|`SMTP_SERVER`|SMTP server to send emails from the server|||yes|yes|
|`SMTP_PORT`|SMTP port to send emails from the server|||yes|yes|
|`SMTP_USER`|SMTP user to send emails from the server|||yes|yes|

## Secrets

When running with Docker, place these files in the root of the repository,
where you run `docker compose`.

|Secret file|Summary|Required for dev|Required for prod|
|-|-|-|-|
|`db.secret`|Password for the user `$DB_USER` on the database `$DB_NAME@$DBHOST`|no|yes|
|`smtp.secret`|Password for the user `$SMTP_USER` on the SMTP server `$SMTP_SERVER`|yes|yes|
|`user.secret`|Key used for user password hashing|no|yes|
