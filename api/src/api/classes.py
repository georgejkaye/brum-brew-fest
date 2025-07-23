from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass
class User:
    user_id: int
    user_name: str
    display_name: str
    hashed_password: str


@dataclass
class VenueVisit:
    visit_id: int
    user_id: int
    user_display_name: int
    visit_date: datetime
    notes: str
    rating: int


@dataclass
class Venue:
    venue_id: int
    venue_name: str
    venue_address: str
    latitude: Decimal
    longitude: Decimal
    visits: list[VenueVisit]


@dataclass
class UserVisit:
    visit_id: int
    user_id: int
    venue_id: int
    venue_name: str
    visit_date: datetime
    notes: str
    rating: int
