from dataclasses import dataclass
from datetime import datetime
from typing import Any, Optional

from fastapi_users.db import BaseUserDatabase
from fastapi_users.models import UserProtocol

from api.classes import User
from api.db import (
    DbConnection,
    connect_to_db,
    delete_user,
    insert_user,
    select_user_by_email,
    select_user_by_user_id,
    update_user,
)
from api.utils import get_env_variable, get_secret

db_host = get_env_variable("DB_HOST")
db_name = get_env_variable("DB_NAME")
db_user = get_env_variable("DB_USER")
db_password = get_secret("DB_PASSWORD")


def connect() -> DbConnection:
    return connect_to_db(db_host, db_name, db_user, db_password)


@dataclass
class FastApiUser(UserProtocol[int]):
    id: int
    email: str
    display_name: str
    hashed_password: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    last_verify_request: datetime


def user_to_fast_api_user(user: User) -> FastApiUser:
    return FastApiUser(
        user.user_id,
        user.email,
        user.display_name,
        user.hashed_password,
        user.is_active,
        user.is_superuser,
        user.is_verified,
        user.last_verify_request,
    )


def optional_user_to_fast_api_user(
    user: Optional[User],
) -> Optional[FastApiUser]:
    return user_to_fast_api_user(user) if user is not None else None


class UserDatabase(BaseUserDatabase[FastApiUser, int]):
    async def get(self, id: int) -> Optional[FastApiUser]:
        with connect() as conn:
            return optional_user_to_fast_api_user(
                select_user_by_user_id(conn, id)
            )

    async def get_by_email(self, email: str) -> Optional[FastApiUser]:
        with connect() as conn:
            return optional_user_to_fast_api_user(
                select_user_by_email(conn, email)
            )

    async def create(self, create_dict: dict[str, Any]) -> FastApiUser:
        with connect() as conn:
            user = insert_user(
                conn,
                create_dict["email"],
                create_dict["display_name"],
                create_dict["hashed_password"],
            )
            if user is None:
                raise RuntimeError("Could not insert user")
            return user_to_fast_api_user(user)

    async def update(
        self, user: FastApiUser, update_dict: dict[str, Any]
    ) -> FastApiUser:
        with connect() as conn:
            updated_user = update_user(
                conn,
                user.id,
                update_dict.get("email"),
                update_dict.get("display_name"),
                update_dict.get("hashed_password"),
                update_dict.get("is_active"),
                update_dict.get("is_superuser"),
                update_dict.get("is_verified"),
                update_dict.get("last_verify_request"),
            )
            if updated_user is None:
                raise RuntimeError("Could not update user")
            return user_to_fast_api_user(updated_user)

    async def delete(self, user: FastApiUser) -> None:
        with connect() as conn:
            delete_user(conn, user.id)


def get_user_db():
    yield UserDatabase()
