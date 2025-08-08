from datetime import datetime

import uvicorn
from fastapi import Depends, FastAPI, HTTPException
from fastapi_users import FastAPIUsers
from psycopg import Connection

from api.classes import (
    UserCount,
    UserFollow,
    UserPublicDetails,
    UserSummary,
    UserVisit,
    Venue,
)
from api.db import (
    delete_follow,
    insert_follow,
    insert_visit,
    select_user_counts,
    select_user_follows,
    select_user_summary,
    select_venue_by_venue_id,
    select_venues,
    select_visits,
    update_user_display_name,
)
from api.users.auth import auth_backend
from api.users.db import FastApiUser
from api.users.manager import get_user_manager
from api.users.schemas import UserCreate, UserRead
from api.utils import (
    get_env_variable,
    get_env_variable_with_default,
    get_secret,
)

app = FastAPI(title="Brum Brew Fest Tracker")

conn = Connection.connect(
    dbname=get_env_variable("DB_NAME"),
    user=get_env_variable("DB_USER"),
    password=get_secret("DB_PASSWORD"),
    host=get_env_variable("DB_HOST"),
)


@app.get("/", summary="Say hello!", tags=["home"])
async def hello() -> str:
    return "Hello!"


fastapi_users = FastAPIUsers[FastApiUser, int](get_user_manager, [auth_backend])
current_user = fastapi_users.current_user()


@app.get("/users", summary="Get all users and their counts", tags=["user"])
async def get_users() -> list[UserCount]:
    return select_user_counts(conn)


@app.get(
    "/users/{user_id}", summary="Get a user and their visits", tags=["user"]
)
async def get_user_by_user_id(user_id: int) -> UserSummary:
    summary = select_user_summary(conn, user_id)
    if summary is None:
        raise HTTPException(status_code=404)
    return summary


@app.get(
    "/venues", summary="Get a list of venues and their visits", tags=["venue"]
)
async def get_venues() -> list[Venue]:
    return select_venues(conn)


@app.get(
    "/venues/{venue_id}", summary="Get a venue and its visits", tags=["venue"]
)
async def get_venue_by_id(venue_id: int) -> Venue:
    venue = select_venue_by_venue_id(conn, venue_id)
    if venue is None:
        raise HTTPException(status_code=404)
    return venue


@app.get("/visits", summary="Get all the visits", tags=["visit"])
async def get_visits() -> list[UserVisit]:
    return select_visits(conn)


@app.post("/visit", summary="Log a visit", tags=["visit"])
async def post_visit(
    venue_id: int,
    visit_date: datetime,
    notes: str,
    rating: int,
    drink: str,
    user: FastApiUser = Depends(current_user),
) -> None:
    insert_visit(conn, user.id, venue_id, visit_date, notes, rating, drink)


@app.get(
    "/auth/me/follows",
    summary="Get list of current user's follows",
    tags=["me"],
)
async def get_user_followers(
    user: FastApiUser = Depends(current_user),
) -> list[UserFollow]:
    return select_user_follows(conn, user.id)


@app.post("/auth/me/follow", summary="Add a new follow for a user", tags=["me"])
async def add_user_follow(
    target_user_id: int, user: FastApiUser = Depends(current_user)
):
    insert_follow(conn, user.id, target_user_id)


@app.delete(
    "/auth/me/follow/{follow_id}",
    summary="Remove a follow for a user",
    tags=["me"],
)
async def remove_user_follow(
    follow_id: int, user: FastApiUser = Depends(current_user)
):
    delete_follow(conn, user.id, follow_id)


app.include_router(
    fastapi_users.get_auth_router(auth_backend, requires_verification=True),
    prefix="/auth/jwt",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)

app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)


@app.get(
    "/auth/me", summary="Get details about the current user", tags=["auth"]
)
async def get_user_details(
    user: FastApiUser = Depends(current_user),
) -> UserPublicDetails:
    user_details = select_user_summary(conn, user.id)
    return UserPublicDetails(
        user.id,
        user.email,
        user.display_name,
        user.is_verified,
        user_details.visits if user_details is not None else [],
    )

@app.patch(
    "/auth/me/display-name", tags=["auth"]
)
async def post_update_display_name(
    display_name: str,
    user: FastApiUser = Depends(current_user)
) -> None:
    update_user_display_name(conn, user.id, display_name)


def start() -> None:
    if get_env_variable("API_ENV") == "prod":
        reload = False
    elif get_env_variable("API_ENV") == "dev":
        reload = True
    else:
        raise RuntimeError("API_ENV not set")
    port_var = get_env_variable_with_default("API_PORT", "8000")
    if not port_var.isnumeric():
        raise RuntimeError(f"API_PORT must be number but it is {port_var}")
    else:
        port = int(port_var)
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        reload=reload,
    )


if __name__ == "__main__":
    start()