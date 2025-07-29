import json
import sys

from psycopg import Connection

from api.classes import VenueInput
from api.db import insert_venues
from api.utils import get_secret_file_contents

venue_json_path = sys.argv[1]

with open(venue_json_path, "r") as f:
    venue_json = json.load(f)

venues: list[VenueInput] = []

for venue in venue_json:
    pin_location = venue.get("pin_location")
    venues.append(
        VenueInput(
            venue["name"],
            venue["address"],
            venue["latitude"],
            venue["longitude"],
            pin_location if pin_location is not None else False,
        )
    )

conn = Connection.connect(
    host=sys.argv[2],
    dbname=sys.argv[3],
    user=sys.argv[4],
    password=get_secret_file_contents(sys.argv[5]),
)

insert_venues(conn, venues)
