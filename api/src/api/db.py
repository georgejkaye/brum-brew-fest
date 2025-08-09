from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Any, Optional

from psycopg import Connection
from psycopg.errors import UniqueViolation
from psycopg.rows import TupleRow, class_row
from psycopg.types.composite import CompositeInfo, register_composite

from api.classes import (
    Area,
    AreaInput,
    AreaVenue,
    InsertAreaResult,
    InsertFollowResult,
    InsertVenueResult,
    InsertVisitResult,
    SingleUserVisit,
    User,
    UserCount,
    UserFollow,
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
    area_id: int,
    venue_name: str,
    address: str,
    latitude: Decimal,
    longitude: Decimal,
    pin_location: bool,
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(InsertVenueResult)) as cur:
        result = cur.execute(
            "SELECT * FROM insert_venue(%s, %s, %s, %s, %s)",
            [venue_name, address, latitude, longitude, pin_location, area_id],
        ).fetchone()
        conn.commit()
        return result.insert_venue if result is not None else None


def select_area_by_name(conn: Connection, area_name: str) -> Optional[Area]:
    register_type(conn, "venue_visit_data", VenueVisit)
    register_type(conn, "area_venue_data", AreaVenue)
    with conn.cursor(row_factory=class_row(Area)) as cur:
        return cur.execute(
            "SELECT * FROM select_area_by_name(%s)", [area_name]
        ).fetchone()


def insert_area(
    conn: Connection, area: AreaInput, fetch_if_duplicate: bool
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(InsertAreaResult)) as cur:
        result = cur.execute(
            "SELECT * FROM insert_area(%s)",
            [area.area_name],
        ).fetchone()
        conn.commit()
        if result is not None and result.insert_area is not None:
            return result.insert_area
        if fetch_if_duplicate:
            area_result = select_area_by_name(conn, area.area_name)
            return area_result.area_id if area_result is not None else None
        return None


def insert_venues(conn: Connection, venues: list[VenueInput]) -> None:
    venue_tuples = [
        (
            venue.venue_name,
            venue.venue_address,
            venue.latitude,
            venue.longitude,
            venue.pin_location,
            venue.area_id,
        )
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
    drink: str,
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(InsertVisitResult)) as cur:
        result = cur.execute(
            "SELECT * FROM insert_visit(%s, %s, %s, %s, %s, %s)",
            [user_id, venue_id, visit_date, notes, rating, drink],
        ).fetchone()
        conn.commit()
        return result.insert_visit if result is not None else None


def insert_follow(
    conn: Connection, source_user_id: int, target_user_id: int
) -> Optional[int]:
    with conn.cursor(row_factory=class_row(InsertFollowResult)) as cur:
        try:
            result = cur.execute(
                "SELECT * FROM insert_follow(%s, %s)",
                [source_user_id, target_user_id],
            ).fetchone()
            conn.commit()
            return result.insert_follow if result is not None else None
        except UniqueViolation:
            print("Duplicate follow")
            conn.rollback()
            return None


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


def select_user_follows(conn: Connection, user_id: int) -> list[UserFollow]:
    with conn.cursor(row_factory=class_row(UserFollow)) as cur:
        return cur.execute(
            "SELECT * FROM select_user_follows(%s)", [user_id]
        ).fetchall()


def select_user_counts(conn: Connection) -> list[UserCount]:
    with conn.cursor(row_factory=class_row(UserCount)) as cur:
        return cur.execute("SELECT * FROM select_user_counts()").fetchall()


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
    conn.commit()


def update_user_last_verify_request(
    conn: Connection, user_id: int, new_last_verify_request: str
) -> None:
    conn.execute(
        "SELECT * FROM update_user_last_verify_request(%s, %s)",
        [user_id, new_last_verify_request],
    )
    conn.commit()


def update_visit(
    conn: Connection,
    user_id: int,
    visit_id: int,
    new_notes: Optional[str],
    new_rating: Optional[int],
    new_drink: Optional[str],
) -> None:
    conn.execute(
        "SELECT * FROM update_visit(%s, %s, %s, %s, %s)",
        [user_id, visit_id, new_notes, new_rating, new_drink],
    )
    conn.commit()


def delete_user(conn: Connection, user_id: int) -> None:
    conn.execute(
        "SELECT * FROM delete_user(%s)",
        [user_id],
    )
    conn.commit()


def delete_follow(conn: Connection, user_id: int, follow_id: int) -> None:
    conn.execute(
        "SELECT * FROM delete_follow(%s, %s)",
        [user_id, follow_id],
    )
    conn.commit()


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
