CREATE OR REPLACE FUNCTION insert_user (
    p_user_name TEXT,
    p_display_name TEXT,
    p_hashed_password TEXT
)
RETURNS VOID
LANGUAGE sql
AS
$$
INSERT INTO app_user (
    user_name,
    display_name,
    hashed_password
)
VALUES (
    p_user_name,
    p_display_name,
    p_hashed_password
);
$$;

CREATE OR REPLACE FUNCTION insert_venue (
    p_venue_name TEXT,
    p_address TEXT,
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS VOID
LANGUAGE sql
AS
$$
INSERT INTO venue (
    venue_name,
    venue_address,
    latitude,
    longitude
)
VALUES (
    p_venue_name,
    p_address,
    p_latitude,
    p_longitude
);
$$;

CREATE OR REPLACE FUNCTION insert_visit (
    p_user_id INTEGER,
    p_venue_id INTEGER,
    p_visit_date TIMESTAMP WITH TIME ZONE,
    p_notes TEXT,
    p_rating INTEGER
)
RETURNS VOID
LANGUAGE sql
AS
$$
INSERT INTO visit (
    user_id,
    venue_id,
    visit_date,
    notes,
    rating
)
VALUES (
    p_user_id,
    p_venue_id,
    p_visit_date,
    p_notes,
    p_rating
);
$$;