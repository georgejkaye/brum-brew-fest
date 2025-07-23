from datetime import datetime
from decimal import Decimal
from typing import Optional
from api.classes import User, UserVisit, Venue, VenueVisit
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
        return cur.execute("SELECT * FROM select_venues()").fetchmany()


def select_venues_by_user(conn: Connection, user_id: int) -> list[Venue]:
    register_type(conn, "venue_visit_data", VenueVisit)
    with conn.cursor(row_factory=class_row(Venue)) as cur:
        return cur.execute(
            "SELECT * FROM select_venues_by_user(%s)", [user_id]
        ).fetchmany()


def select_visits(conn: Connection) -> list[UserVisit]:
    with conn.cursor(row_factory=class_row(UserVisit)) as cur:
        return cur.execute("SELECT * FROM select_visits()").fetchmany()


def select_visits_by_user(conn: Connection, user_id: int) -> list[UserVisit]:
    with conn.cursor(row_factory=class_row(UserVisit)) as cur:
        return cur.execute(
            "SELECT * FROM select_visits_by_user(%s)", [user_id]
        ).fetchmany()


def register_type[T](conn: Connection, name: str, factory: type) -> None:
    info = CompositeInfo.fetch(conn, name)
    if info is not None:
        register_composite(info, conn, factory)
    else:
        raise RuntimeError(f"Could not find composite type {name}")
