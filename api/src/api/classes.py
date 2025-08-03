from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass
class User:
    user_id: int
    email: str
    display_name: str
    hashed_password: str
    is_active: bool
    is_superuser: bool
    is_verified: bool
    last_verify_request: datetime


@dataclass
class SingleUserVisit:
    visit_id: int
    venue_id: int
    venue_name: str
    visit_date: datetime
    notes: str
    rating: int
    drink: str


@dataclass
class UserPublicDetails:
    user_id: int
    email: str
    display_name: str
    is_verified: bool
    visits: list[SingleUserVisit]


@dataclass
class VenueVisit:
    visit_id: int
    user_id: int
    user_display_name: str
    visit_date: datetime
    notes: str
    rating: int
    drink: str


@dataclass
class AreaInput:
    area_name: str


@dataclass
class VenueInput:
    venue_name: str
    area_id: int
    venue_address: str
    latitude: Decimal
    longitude: Decimal
    pin_location: bool


@dataclass
class Venue:
    venue_id: int
    venue_name: str
    venue_address: str
    latitude: Decimal
    longitude: Decimal
    visits: list[VenueVisit]
    pin_location: bool
    area_id: int
    area_name: str


@dataclass
class UserVisit:
    visit_id: int
    user_id: int
    user_display_name: str
    venue_id: int
    venue_name: str
    visit_date: datetime
    notes: str
    rating: int
    drink: str


@dataclass
class UserSummary:
    user_id: int
    email: str
    display_name: str
    visits: list[SingleUserVisit]


@dataclass
class InsertVisitResult:
    insert_visit: int


@dataclass
class InsertVenueResult:
    insert_venue: int


@dataclass
class InsertAreaResult:
    insert_area: int
