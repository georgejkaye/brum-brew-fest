from typing import Optional

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, IntegerIDMixin
from fastapi_users.db import BaseUserDatabase

from api.users.db import FastApiUser, get_user_db
from api.utils import get_secret

secret = get_secret("USER_SECRET")
if secret is None:
    raise RuntimeError("USER_SECRET secret not defined")


class UserManager(IntegerIDMixin, BaseUserManager[FastApiUser, int]):
    reset_password_token_secret = secret
    verification_token_secret = secret

    async def on_after_register(
        self, user: FastApiUser, request: Optional[Request] = None
    ):
        print(f"User {user.id} has registered.")

    async def on_after_forgot_password(
        self, user: FastApiUser, token: str, request: Optional[Request] = None
    ):
        print(f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: FastApiUser, token: str, request: Optional[Request] = None
    ):
        print(
            f"Verification requested for user {user.id}. Verification token: {token}"
        )


async def get_user_manager(
    user_db: BaseUserDatabase[FastApiUser, int] = Depends(get_user_db),
):
    yield UserManager(user_db)
