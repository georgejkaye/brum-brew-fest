ALTER TABLE venue
ADD COLUMN pin_location BOOLEAN;

UPDATE venue
SET pin_location = FALSE;

ALTER TABLE venue
ALTER COLUMN pin_location SET NOT NULL;

UPDATE venue
SET pin_location = TRUE
WHERE venue_name IN ('Cherry Reds', 'The Wolf', 'Attic Brew Co.');