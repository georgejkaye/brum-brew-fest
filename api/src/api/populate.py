import json
import sys

from psycopg import Connection

from api.classes import AreaInput, VenueInput
from api.db import insert_area, insert_venues
from api.utils import get_secret_file_contents

venue_json_path = sys.argv[1]

with open(venue_json_path, "r") as f:
    venue_json = json.load(f)

venues: list[VenueInput] = []

areas_data = venue_json["areas"]

conn = Connection.connect(
    host=sys.argv[2],
    dbname=sys.argv[3],
    user=sys.argv[4],
    password=get_secret_file_contents(sys.argv[5]),
)

for area in areas_data:
    area_id = insert_area(conn, AreaInput(area["name"]))
    if area_id is None:
        raise RuntimeError(f"Could not insert area {area['name']}")

    for venue in area["venues"]:
        pin_location = venue.get("pin_location")
        venues.append(
            VenueInput(
                venue["name"],
                area_id,
                venue["address"],
                venue["latitude"],
                venue["longitude"],
                pin_location if pin_location is not None else False,
            )
        )

insert_venues(conn, venues)
