DROP FUNCTION IF EXISTS insert_user;
DROP FUNCTION IF EXISTS insert_area;
DROP FUNCTION IF EXISTS insert_venue;
DROP FUNCTION IF EXISTS insert_venues;
DROP FUNCTION IF EXISTS insert_visit;
DROP FUNCTION IF EXISTS insert_follow;
DROP FUNCTION IF EXISTS select_user_by_user_id;
DROP FUNCTION IF EXISTS select_user_by_email;
DROP FUNCTION IF EXISTS select_area_by_name;
DROP FUNCTION IF EXISTS select_venues;
DROP FUNCTION IF EXISTS select_venues_by_user;
DROP FUNCTION IF EXISTS select_visits;
DROP FUNCTION IF EXISTS select_user_summary;
DROP FUNCTION IF EXISTS select_user_follows;
DROP FUNCTION IF EXISTS select_user_counts;
DROP FUNCTION IF EXISTS update_user;
DROP FUNCTION IF EXISTS update_user_display_name;
DROP FUNCTION IF EXISTS delete_user;
DROP FUNCTION IF EXISTS delete_follow;

CREATE OR REPLACE FUNCTION insert_user (
    p_email TEXT,
    p_display_name TEXT,
    p_hashed_password TEXT
)
RETURNS user_data
LANGUAGE sql
AS
$$
INSERT INTO app_user (
    email,
    display_name,
    hashed_password,
    is_active,
    is_superuser,
    is_verified
)
VALUES (
    p_email,
    p_display_name,
    p_hashed_password,
    TRUE,
    FALSE,
    FALSE
)
RETURNING (
    user_id,
    email,
    display_name,
    hashed_password,
    is_active,
    is_superuser,
    is_verified,
    last_verify_request)
$$;

CREATE OR REPLACE FUNCTION insert_area (
    p_area_name TEXT
)
RETURNS INTEGER
LANGUAGE sql
AS
$$
INSERT INTO area (
    area_name
) VALUES (
    p_area_name
)
ON CONFLICT DO NOTHING
RETURNING area_id;
$$;

CREATE OR REPLACE FUNCTION insert_venue (
    p_venue_name TEXT,
    p_address TEXT,
    p_latitude DECIMAL,
    p_longitude DECIMAL,
    p_pin_location BOOLEAN,
    p_area_id INTEGER
)
RETURNS INTEGER
LANGUAGE sql
AS
$$
INSERT INTO venue (
    venue_name,
    venue_address,
    latitude,
    longitude,
    pin_location,
    area_id
)
VALUES (
    p_venue_name,
    p_address,
    p_latitude,
    p_longitude,
    p_pin_location,
    p_area_id
)
ON CONFLICT (venue_name, venue_address) DO UPDATE
SET
    venue_name = p_venue_name,
    venue_address = p_address,
    latitude = p_latitude,
    longitude = p_longitude,
    pin_location = p_pin_location,
    area_id = p_area_id
RETURNING venue_id;
$$;

CREATE OR REPLACE FUNCTION insert_venues (
    p_venues venue_input_data[]
)
RETURNS VOID
LANGUAGE sql
AS
$$
INSERT INTO venue (
    venue_name,
    venue_address,
    latitude,
    longitude,
    pin_location,
    area_id
)
SELECT
    v_venue.venue_name,
    v_venue.venue_address,
    v_venue.latitude,
    v_venue.longitude,
    v_venue.pin_location,
    v_venue.area_id
FROM UNNEST(p_venues) AS v_venue
ON CONFLICT (venue_name, venue_address) DO NOTHING
$$;

CREATE OR REPLACE FUNCTION insert_visit (
    p_user_id INTEGER,
    p_venue_id INTEGER,
    p_visit_date TIMESTAMP WITH TIME ZONE,
    p_notes TEXT,
    p_rating INTEGER,
    p_drink TEXT
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
    rating,
    drink
)
VALUES (
    p_user_id,
    p_venue_id,
    p_visit_date,
    p_notes,
    p_rating,
    p_drink
)
RETURNING visit_id AS new_visit_id;
$$;

CREATE OR REPLACE FUNCTION insert_follow (
    p_source_user_id INTEGER,
    p_target_user_id INTEGER
)
RETURNS INTEGER
LANGUAGE sql
AS
$$
INSERT INTO follow (follow_source_user_id, follow_target_user_id)
VALUES (p_source_user_id, p_target_user_id)
RETURNING follow_id;
$$;

CREATE OR REPLACE FUNCTION select_user_by_user_id (
    p_user_id INTEGER
)
RETURNS SETOF user_data
LANGUAGE sql
AS
$$
SELECT
    app_user.user_id,
    app_user.email,
    app_user.display_name,
    app_user.hashed_password,
    app_user.is_active,
    app_user.is_superuser,
    app_user.is_verified,
    app_user.last_verify_request
FROM app_user
WHERE app_user.user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION select_user_by_email (
    p_email TEXT
)
RETURNS SETOF user_data
LANGUAGE sql
AS
$$
SELECT
    app_user.user_id,
    app_user.email,
    app_user.display_name,
    app_user.hashed_password,
    app_user.is_active,
    app_user.is_superuser,
    app_user.is_verified,
    app_user.last_verify_request
FROM app_user
WHERE app_user.email = p_email;
$$;

CREATE OR REPLACE FUNCTION select_area_by_name (
    p_area_name TEXT
)
RETURNS SETOF area_data
LANGUAGE sql
AS
$$
SELECT
    area.area_id,
    area.area_name,
    COALESCE(venue_data_table.venues, ARRAY[]::area_venue_data[]) AS venues
FROM area
INNER JOIN (
    SELECT
        area.area_id,
        ARRAY_AGG((
            venue.venue_id,
            venue.venue_name,
            venue.venue_address,
            venue.latitude,
            venue.longitude,
            COALESCE(
                visit_data_table.visits,
                ARRAY[]::venue_visit_data[]
            ),
            venue.pin_location)::area_venue_data
            ORDER BY venue.venue_name
        ) AS venues
    FROM area
    INNER JOIN venue
    ON area.area_id = venue.area_id
    LEFT JOIN (
        SELECT
            visit_table.venue_id,
            ARRAY_AGG((
                visit_table.visit_id,
                visit_table.user_id,
                visit_table.display_name,
                visit_table.visit_date,
                visit_table.notes,
                visit_table.rating,
                visit_table.drink)::venue_visit_data
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
                visit.rating,
                visit.drink
            FROM venue
            INNER JOIN visit
            ON venue.venue_id = visit.venue_id
            INNER JOIN app_user
            ON visit.user_id = app_user.user_id
        ) visit_table
        GROUP BY visit_table.venue_id
    ) visit_data_table
    ON venue.venue_id = visit_data_table.venue_id
    GROUP BY area.area_id
) venue_data_table
ON area.area_id = venue_data_table.area_id
WHERE area.area_name = p_area_name;
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
    COALESCE(visit_data_table.visits, ARRAY[]::venue_visit_data[]) AS visits,
    venue.pin_location,
    venue.area_id,
    area.area_name
FROM venue
LEFT JOIN area
ON venue.area_id = area.area_id
LEFT JOIN (
    SELECT
        visit_table.venue_id,
        ARRAY_AGG((
            visit_table.visit_id,
            visit_table.user_id,
            visit_table.display_name,
            visit_table.visit_date,
            visit_table.notes,
            visit_table.rating,
            visit_table.drink)::venue_visit_data
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
            visit.rating,
            visit.drink
        FROM venue
        INNER JOIN visit
        ON venue.venue_id = visit.venue_id
        INNER JOIN app_user
        ON visit.user_id = app_user.user_id
    ) visit_table
    GROUP BY visit_table.venue_id
) visit_data_table
ON venue.venue_id = visit_data_table.venue_id
ORDER BY venue.venue_name ASC;
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
    COALESCE(visit_data_table.visits, ARRAY[]::venue_visit_data[]) AS visits,
    venue.pin_location,
    venue.area_id,
    area.area_name
FROM venue
LEFT JOIN area
ON venue.area_id = area.area_id
LEFT JOIN (
    SELECT
        visit_table.venue_id,
        ARRAY_AGG((
            visit_table.visit_id,
            visit_table.user_id,
            visit_table.display_name,
            visit_table.visit_date,
            visit_table.notes,
            visit_table.rating,
            visit_table.drink)::venue_visit_data
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
            visit.rating,
            visit.drink
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
    COALESCE(visit_data_table.visits, ARRAY[]::venue_visit_data[]) AS visits,
    venue.pin_location,
    venue.area_id,
    area.area_id
FROM venue
LEFT JOIN area
ON venue.area_id = area.area_id
LEFT JOIN (
    SELECT
        visit_table.venue_id,
        ARRAY_AGG((
            visit_table.visit_id,
            visit_table.user_id,
            visit_table.display_name,
            visit_table.visit_date,
            visit_table.notes,
            visit_table.rating,
            visit_table.drink)::venue_visit_data
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
            visit.rating,
            visit.drink
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
    app_user.display_name,
    venue.venue_id,
    venue.venue_name,
    visit.visit_date,
    visit.notes,
    visit.rating,
    visit.drink
FROM visit
INNER JOIN venue
ON visit.venue_id = venue.venue_id
INNER JOIN app_user
ON visit.user_id = app_user.user_id;
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
    app_user.email,
    app_user.display_name,
    COALESCE(visit_table.visits, ARRAY[]::single_user_visit_data[])
FROM app_user
LEFT JOIN (
    SELECT
        visit.user_id,
        ARRAY_AGG((
            visit.visit_id,
            venue.venue_id,
            venue.venue_name,
            visit.visit_date,
            visit.notes,
            visit.rating,
            visit.drink)::single_user_visit_data
            ORDER BY visit.visit_date
        ) AS visits
    FROM visit
    INNER JOIN venue
    ON visit.venue_id = venue.venue_id
    GROUP BY visit.user_id
) visit_table
ON app_user.user_id = visit_table.user_id
WHERE app_user.user_id = p_user_id
AND app_user.is_active = 't'
AND app_user.is_verified = 't';
$$;

CREATE OR REPLACE FUNCTION select_user_follows (
    p_user_id INTEGER
)
RETURNS SETOF user_follow_data
LANGUAGE sql
AS
$$
SELECT
    follow.follow_id,
    follow.follow_target_user_id,
    follow_target_user.display_name,
    COALESCE(user_visit_count.visit_count, 0),
    COALESCE(user_visit_count.unique_visit_count, 0)
FROM follow
INNER JOIN app_user follow_target_user
ON follow.follow_target_user_id = follow_target_user.user_id
LEFT JOIN (
    SELECT
        user_id,
        COUNT(*) AS visit_count,
        COUNT(DISTINCT venue_id) AS unique_visit_count
    FROM visit
    GROUP BY user_id
) user_visit_count
ON follow_target_user.user_id = user_visit_count.user_id
WHERE follow.follow_source_user_id = p_user_id
AND follow_target_user.is_active = 't'
AND follow_target_user.is_verified = 't';
$$;

CREATE OR REPLACE FUNCTION select_user_counts ()
RETURNS SETOF user_count_data
LANGUAGE sql
AS
$$
SELECT
    app_user.user_id,
    app_user.display_name,
    COALESCE(visit_count_table.visit_count, 0),
    COALESCE(visit_count_table.unique_visit_count, 0)
FROM app_user
lEFT JOIN (
    SELECT
        visit.user_id,
        COUNT(visit.*) AS visit_count,
        COUNT(DISTINCT venue_id) AS unique_visit_count
    FROM visit
    GROUP BY user_id
) visit_count_table
ON app_user.user_id = visit_count_table.user_id
WHERE app_user.is_verified = 't'
AND app_user.is_active = 't';
$$;

CREATE OR REPLACE FUNCTION update_user (
    p_user_id INTEGER,
    p_email TEXT,
    p_display_name TEXT,
    p_new_hashed_password TEXT,
    p_is_active BOOLEAN,
    p_is_superuser BOOLEAN,
    p_is_verified BOOLEAN,
    p_last_verify_request TIMESTAMP WITH TIME ZONE
)
RETURNS SETOF user_data
LANGUAGE sql
AS
$$
UPDATE app_user
SET
    email = COALESCE(p_email, email),
    display_name = COALESCE(p_display_name, display_name),
    hashed_password = COALESCE(p_new_hashed_password, hashed_password),
    is_active = COALESCE(p_is_active, is_active),
    is_superuser = COALESCE(p_is_superuser, is_superuser),
    is_verified = COALESCE(p_is_verified, is_verified),
    last_verify_request = COALESCE(p_last_verify_request, last_verify_request)
WHERE user_id = p_user_id
RETURNING
    user_id,
    email,
    display_name,
    hashed_password,
    is_active,
    is_superuser,
    is_verified,
    last_verify_request
$$;

CREATE OR REPLACE FUNCTION update_user_display_name (
    p_user_id INTEGER,
    p_new_display_name TEXT
)
RETURNS VOID
LANGUAGE sql
AS
$$
UPDATE app_user
SET display_name = p_new_display_name
WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION update_user_last_verify_request (
    p_user_id INTEGER,
    p_new_last_verify_request TIMESTAMP WITH TIME ZONE
)
RETURNS VOID
LANGUAGE sql
AS
$$
UPDATE app_user
SET last_verify_request = p_new_last_verify_request
WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION delete_user (
    p_user_id INTEGER
)
RETURNS VOID
LANGUAGE sql
AS
$$
DELETE FROM app_user
WHERE user_id = p_user_id;
$$;

CREATE OR REPLACE FUNCTION delete_follow (
    p_user_id INTEGER,
    p_follow_id INTEGER
)
RETURNS VOID
LANGUAGE sql
AS
$$
DELETE FROM follow
WHERE follow_source_user_id = p_user_id
AND follow_id = p_follow_id;
$$;