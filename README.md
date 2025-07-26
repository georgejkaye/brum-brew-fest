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
|`CLIENT_PORT`|Port the client runs on||`3000`|
|`CLIENT_PROTOCOL`|Protocol of the client||`https` (prod) / `http` (dev)|
|`CLIENT_HOST`|Hostname of the client||`localhost:3000` (dev)|
|`DB_HOST`||||
|`DB_NAME`||||
|`DB_USER`||||
|`DB_PASSWORD`||||
|`FROM_EMAIL`|Address to sends emails from the server|||
|`SMTP_SERVER`|SMTP server to send emails from the server|||
|`SMTP_PORT`|SMTP port to send emails from the server|||
|`SMTP_USER`|SMTP user to send emails from the server|||

## Secrets

|Secret file|Summary|
|-|-|
|`db.secret`|Password for the user `$DB_NAME` on the database `$DB_NAME@$DBHOST`|
|`smtp.secret`|Password for the user `$SMTP_USER` on the SMTP server `$SMTP_SERVER`|
|`user.secret`|Key used for user password hashing|
