ALTER TABLE area ADD CONSTRAINT area_unique_area_name UNIQUE (area_name);

ALTER TABLE venue
ADD CONSTRAINT venue_unique_venue_name_venue_address
UNIQUE (venue_name, venue_address);