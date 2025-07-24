from dataclasses import dataclass
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


def user_to_fast_api_user(user: User) -> FastApiUser:
    return FastApiUser(
        user.user_id,
        user.email,
        user.display_name,
        user.hashed_password,
        user.is_active,
        user.is_superuser,
        user.is_verified,
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
        print(update_dict)
        raise NotImplementedError()

    async def delete(self, user: FastApiUser) -> None:
        with connect() as conn:
            delete_user(conn, user.id)


def get_user_db():
    yield UserDatabase()
