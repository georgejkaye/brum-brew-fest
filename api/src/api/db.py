from datetime import datetime
from decimal import Decimal
from typing import Optional
from api.classes import (
    SingleUserVisit,
    User,
    UserSummary,
    UserVisit,
    Venue,
    VenueVisit,
)
from psycopg import Connection
from psycopg.rows import class_row
from psycopg.types.composite import CompositeInfo, register_composite


def insert_user(
    conn: Connection, user_name: str, display_name: str, hashed_password: str
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(int)) as cur:
        return cur.execute(
            "SELECT * FROM insert_user(%s, %s, %s)",
            [user_name, display_name, hashed_password],
        ).fetchone()


def insert_venue(
    conn: Connection,
    venue_name: str,
    address: str,
    latitude: Decimal,
    longitude: Decimal,
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(int)) as cur:
        return cur.execute(
            "SELECT * FROM insert_venue(%s, %s, %s)",
            [venue_name, address, latitude, longitude],
        ).fetchone()


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


def select_user_by_username(conn: Connection, user_name: str) -> Optional[User]:
    with conn.cursor(row_factory=class_row(User)) as cur:
        return cur.execute(
            "SELECT * FROM select_user_by_username(%s)", [user_name]
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


def update_user_hashed_password(
    conn: Connection, user_id: int, new_hashed_password: str
) -> None:
    conn.execute(
        "SELECT * FROM update_user_password(%s, %s)",
        [user_id, new_hashed_password],
    )


def update_user_display_name(
    conn: Connection, user_id: int, new_display_name: str
) -> None:
    conn.execute(
        "SELECT * FROM update_user_display_name(%s, %s)",
        [user_id, new_display_name],
    )


def register_type[T](conn: Connection, name: str, factory: type) -> None:
    info = CompositeInfo.fetch(conn, name)
    if info is not None:
        register_composite(info, conn, factory)
    else:
        raise RuntimeError(f"Could not find composite type {name}")
