from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from psycopg import Connection
from psycopg.rows import TupleRow, class_row
from psycopg.types.composite import CompositeInfo, register_composite

from api.classes import (
    SingleUserVisit,
    User,
    UserSummary,
    UserVisit,
    Venue,
    VenueInput,
    VenueVisit,
)
from api.utils import get_env_variable, get_secret


def insert_user(
    conn: Connection,
    email: str,
    display_name: str,
    hashed_password: str,
) -> Optional[User]:
    with conn.cursor(row_factory=class_row(User)) as cur:
        result = cur.execute(
            "SELECT * FROM insert_user(%s, %s, %s)",
            [email, display_name, hashed_password],
        ).fetchone()
        conn.commit()
        return result


def insert_venue(
    conn: Connection,
    venue_name: str,
    address: str,
    latitude: Decimal,
    longitude: Decimal,
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(int)) as cur:
        result = cur.execute(
            "SELECT * FROM insert_venue(%s, %s, %s)",
            [venue_name, address, latitude, longitude],
        ).fetchone()
        conn.commit()
        return result


def insert_venues(conn: Connection, venues: list[VenueInput]) -> None:
    venue_tuples = [
        (venue.venue_name, venue.venue_address, venue.latitude, venue.longitude)
        for venue in venues
    ]
    conn.execute(
        "SELECT * FROM insert_venues(%s)",
        [venue_tuples],
    )
    conn.commit()


def insert_visit(
    conn: Connection,
    user_id: int,
    venue_id: int,
    visit_date: datetime,
    notes: str,
    rating: int,
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(int)) as cur:
        return cur.execute(
            "SELECT * FROM insert_visit(%s, %s, %s)",
            [user_id, venue_id, visit_date, notes, rating],
        ).fetchone()


def select_user_by_user_id(conn: Connection, user_id: int) -> Optional[User]:
    with conn.cursor(row_factory=class_row(User)) as cur:
        return cur.execute(
            "SELECT * FROM select_user_by_user_id(%s)", [user_id]
        ).fetchone()


def select_user_by_email(conn: Connection, email: str) -> Optional[User]:
    with conn.cursor(row_factory=class_row(User)) as cur:
        return cur.execute(
            "SELECT * FROM select_user_by_email(%s)", [email]
        ).fetchone()


def select_venues(conn: Connection) -> list[Venue]:
    register_type(conn, "venue_visit_data", VenueVisit)
    with conn.cursor(row_factory=class_row(Venue)) as cur:
        return cur.execute("SELECT * FROM select_venues()").fetchall()


def select_venue_by_venue_id(
    conn: Connection, venue_id: int
) -> Optional[Venue]:
    register_type(conn, "venue_visit_data", VenueVisit)
    with conn.cursor(row_factory=class_row(Venue)) as cur:
        return cur.execute(
            "SELECT * FROM select_venue_by_venue_id(%s)", [venue_id]
        ).fetchone()


def select_venues_by_user(conn: Connection, user_id: int) -> list[Venue]:
    register_type(conn, "venue_visit_data", VenueVisit)
    with conn.cursor(row_factory=class_row(Venue)) as cur:
        return cur.execute(
            "SELECT * FROM select_venues_by_user(%s)", [user_id]
        ).fetchall()


def select_visits(conn: Connection) -> list[UserVisit]:
    with conn.cursor(row_factory=class_row(UserVisit)) as cur:
        return cur.execute("SELECT * FROM select_visits()").fetchall()


def select_user_summary(
    conn: Connection, user_id: int
) -> Optional[UserSummary]:
    register_type(conn, "single_user_visit_data", SingleUserVisit)
    with conn.cursor(row_factory=class_row(UserSummary)) as cur:
        return cur.execute(
            "SELECT * FROM select_user_summary(%s)", [user_id]
        ).fetchone()


def update_user(
    conn: Connection,
    user_id: int,
    email: Optional[str],
    display_name: Optional[str],
    hashed_password: Optional[str],
    is_active: Optional[bool],
    is_superuser: Optional[bool],
    is_verified: Optional[bool],
    last_verify_request: Optional[datetime],
) -> Optional[User]:
    with conn.cursor(row_factory=class_row(User)) as cur:
        result = cur.execute(
            "SELECT * FROM update_user(%s, %s, %s, %s, %s, %s, %s, %s)",
            [
                user_id,
                email,
                display_name,
                hashed_password,
                is_active,
                is_superuser,
                is_verified,
                last_verify_request,
            ],
        ).fetchone()
        conn.commit()
        return result


def update_user_display_name(
    conn: Connection, user_id: int, new_display_name: str
) -> None:
    conn.execute(
        "SELECT * FROM update_user_display_name(%s, %s)",
        [user_id, new_display_name],
    )


def update_user_last_verify_request(
    conn: Connection, user_id: int, new_last_verify_request: str
) -> None:
    conn.execute(
        "SELECT * FROM update_user_last_verify_request(%s, %s)",
        [user_id, new_last_verify_request],
    )


def delete_user(conn: Connection, user_id: int) -> None:
    conn.execute(
        "SELECT * FROM delete_user(%s)",
        [user_id],
    )


def register_type[T](conn: Connection, name: str, factory: type) -> None:
    info = CompositeInfo.fetch(conn, name)
    if info is not None:
        register_composite(info, conn, factory)
    else:
        raise RuntimeError(f"Could not find composite type {name}")


@dataclass
class DbConnectionData:
    db_name: Optional[str]
    db_user: Optional[str]
    db_password: Optional[str]
    db_host: Optional[str]


class DbConnection:
    def __init__(
        self,
        db_host: Optional[str],
        db_name: Optional[str],
        db_user: Optional[str],
        db_password: Optional[str],
    ):
        self.db_name = db_name or get_env_variable("DB_NAME")
        self.db_user = db_user or get_env_variable("DB_USER")
        self.db_password = db_password or get_secret("DB_PASSWORD")
        self.db_host = db_host or get_env_variable("DB_HOST")

    def __enter__(self) -> Connection[TupleRow]:
        self.conn = Connection.connect(
            dbname=self.db_name,
            user=self.db_user,
            password=self.db_password,
            host=self.db_host,
        )
        return self.conn

    def __exit__(self, exc_type: Any, exc_value: Any, traceback: Any) -> None:
        self.conn.close()


def connect_to_db(
    db_host: Optional[str],
    db_name: Optional[str],
    db_user: Optional[str],
    db_password: Optional[str],
) -> DbConnection:
    return DbConnection(db_host, db_name, db_user, db_password)
