DROP FUNCTION IF EXISTS insert_user;
DROP FUNCTION IF EXISTS insert_venue;
DROP FUNCTION IF EXISTS insert_visit;
DROP FUNCTION IF EXISTS select_user_by_username;
DROP FUNCTION IF EXISTS select_venues;
DROP FUNCTION IF EXISTS select_venues_by_user;
DROP FUNCTION IF EXISTS select_visits;
DROP FUNCTION IF EXISTS select_user_summary;

CREATE OR REPLACE FUNCTION insert_user (
    p_user_name TEXT,
    p_display_name TEXT,
    p_hashed_password TEXT
)
RETURNS INTEGER
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
)
RETURNING user_id;
$$;

CREATE OR REPLACE FUNCTION insert_venue (
    p_venue_name TEXT,
    p_address TEXT,
    p_latitude DECIMAL,
    p_longitude DECIMAL
)
RETURNS INTEGER
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
)
RETURNING venue_id;
$$;

CREATE OR REPLACE FUNCTION insert_visit (
    p_user_id INTEGER,
    p_venue_id INTEGER,
    p_visit_date TIMESTAMP WITH TIME ZONE,
    p_notes TEXT,
    p_rating INTEGER
)
RETURNS INTEGER
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
)
RETURNING visit_id;
$$;

CREATE OR REPLACE FUNCTION select_user_by_username (
    p_user_name TEXT
)
RETURNS user_data
LANGUAGE sql
AS
$$
SELECT (
    app_user.user_id,
    app_user.user_name,
    app_user.display_name,
    app_user.hashed_password)::user_data
FROM app_user
WHERE app_user.user_name = p_user_name;
$$;

CREATE OR REPLACE FUNCTION select_venues ()
RETURNS SETOF venue_data
LANGUAGE sql
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(visit_data_table.visits, ARRAY[]::venue_visit_data[]) AS visits
FROM venue
LEFT JOIN (
    SELECT
        visit_table.venue_id,
        ARRAY_AGG((
            visit_table.visit_id,
            visit_table.user_id,
            visit_table.display_name,
            visit_table.visit_date,
            visit_table.notes,
            visit_table.rating)::venue_visit_data
            ORDER BY visit_table.visit_date
        ) AS visits
    FROM (
        SELECT
            venue.venue_id,
            visit.visit_id,
            app_user.user_id,
            app_user.display_name,
            visit.visit_date,
            visit.notes,
            visit.rating
        FROM venue
        INNER JOIN visit
        ON venue.venue_id = visit.venue_id
        INNER JOIN app_user
        ON visit.user_id = app_user.user_id
    ) visit_table
    GROUP BY visit_table.venue_id
) visit_data_table
ON venue.venue_id = visit_data_table.venue_id;
$$;

CREATE OR REPLACE FUNCTION select_venue_by_venue_id (
    p_venue_id INTEGER
)
RETURNS SETOF venue_data
LANGUAGE sql
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(visit_data_table.visits, ARRAY[]::venue_visit_data[]) AS visits
FROM venue
LEFT JOIN (
    SELECT
        visit_table.venue_id,
        ARRAY_AGG((
            visit_table.visit_id,
            visit_table.user_id,
            visit_table.display_name,
            visit_table.visit_date,
            visit_table.notes,
            visit_table.rating)::venue_visit_data
            ORDER BY visit_table.visit_date
        ) AS visits
    FROM (
        SELECT
            venue.venue_id,
            visit.visit_id,
            app_user.user_id,
            app_user.display_name,
            visit.visit_date,
            visit.notes,
            visit.rating
        FROM venue
        INNER JOIN visit
        ON venue.venue_id = visit.venue_id
        INNER JOIN app_user
        ON visit.user_id = app_user.user_id
    ) visit_table
    GROUP BY visit_table.venue_id
) visit_data_table
ON venue.venue_id = visit_data_table.venue_id
WHERE venue.venue_id = p_venue_id;
$$;

CREATE OR REPLACE FUNCTION select_venues_by_user (
    p_user_id INTEGER
)
RETURNS SETOF venue_data
LANGUAGE sql
AS
$$
SELECT
    venue.venue_id,
    venue.venue_name,
    venue.venue_address,
    venue.latitude,
    venue.longitude,
    COALESCE(visit_data_table.visits, ARRAY[]::venue_visit_data[]) AS visits
FROM venue
LEFT JOIN (
    SELECT
        visit_table.venue_id,
        ARRAY_AGG((
            visit_table.visit_id,
            visit_table.user_id,
            visit_table.display_name,
            visit_table.visit_date,
            visit_table.notes,
            visit_table.rating)::venue_visit_data
            ORDER BY visit_table.visit_date
        ) AS visits
    FROM (
        SELECT
            venue.venue_id,
            visit.visit_id,
            app_user.user_id,
            app_user.display_name,
            visit.visit_date,
            visit.notes,
            visit.rating
        FROM venue
        INNER JOIN visit
        ON venue.venue_id = visit.venue_id
        INNER JOIN app_user
        ON visit.user_id = app_user.user_id
        WHERE app_user.user_id = p_user_id
    ) visit_table
    GROUP BY visit_table.venue_id
) visit_data_table
ON venue.venue_id = visit_data_table.venue_id;
$$;

CREATE OR REPLACE FUNCTION select_visits ()
RETURNS SETOF user_visit_data
LANGUAGE sql
AS
$$
SELECT
    visit.visit_id,
    visit.user_id,
    venue.venue_id,
    venue.venue_name,
    visit.visit_date,
    visit.notes,
    visit.rating
FROM visit
INNER JOIN venue
ON visit.venue_id = venue.venue_id;
$$;

CREATE OR REPLACE FUNCTION select_user_summary (
    p_user_id INTEGER
)
RETURNS SETOF user_summary_data
LANGUAGE sql
AS
$$
SELECT
    app_user.user_id,
    app_user.user_name,
    app_user.display_name,
    visit_table.visits
FROM app_user
INNER JOIN (
    SELECT
        visit.user_id,
        ARRAY_AGG((
            visit.visit_id,
            venue.venue_id,
            venue.venue_name,
            visit.visit_date,
            visit.notes,
            visit.rating)::single_user_visit_data
            ORDER BY visit.visit_date
        ) AS visits
    FROM visit
    INNER JOIN venue
    ON visit.venue_id = venue.venue_id
    GROUP BY visit.user_id
) visit_table
ON app_user.user_id = visit_table.user_id
WHERE app_user.user_id = p_user_id;
$$;