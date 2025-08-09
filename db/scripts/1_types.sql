DROP TYPE IF EXISTS user_data CASCADE;
DROP TYPE IF EXISTS venue_input_data CASCADE;
DROP TYPE IF EXISTS venue_data CASCADE;
DROP TYPE IF EXISTS area_venue_data CASCADE;
DROP TYPE IF EXISTS area_data CASCADE;
DROP TYPE IF EXISTS venue_visit_data CASCADE;
DROP TYPE IF EXISTS user_summary_data CASCADE;
DROP TYPE IF EXISTS user_visit_data CASCADE;
DROP TYPE IF EXISTS single_user_visit_data CASCADE;
DROP TYPE IF EXISTS user_follow_data CASCADE;
DROP TYPE IF EXISTS user_count_data CASCADE;

CREATE TYPE user_data AS (
    user_id INTEGER,
    email TEXT,
    display_name TEXT,
    hashed_password TEXT,
    is_active BOOLEAN,
    is_superuser BOOLEAN,
    is_verified BOOLEAN,
    last_verify_request TIMESTAMP WITH TIME ZONE
);

CREATE TYPE venue_visit_data AS (
    visit_id INTEGER,
    user_id INTEGER,
    user_display_name TEXT,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER,
    drink TEXT
);

CREATE TYPE venue_input_data AS (
    venue_name TEXT,
    venue_address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    pin_location BOOLEAN,
    area_id INTEGER
);

CREATE TYPE venue_data AS (
    venue_id INTEGER,
    venue_name TEXT,
    venue_address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    visits venue_visit_data[],
    pin_location BOOLEAN,
    area_id INTEGER,
    area_name TEXT
);

CREATE TYPE area_venue_data AS (
    venue_id INTEGER,
    venue_name TEXT,
    venue_address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    visits venue_visit_data[],
    pin_location BOOLEAN
);

CREATE TYPE area_data AS (
    area_id INTEGER,
    area_name TEXT,
    venues area_venue_data[]
);

CREATE TYPE user_visit_data AS (
    visit_id INTEGER,
    user_id INTEGER,
    user_display_name TEXT,
    venue_id INTEGER,
    venue_name TEXT,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER,
    drink TEXT
);

CREATE TYPE single_user_visit_data AS (
    visit_id INTEGER,
    venue_id INTEGER,
    venue_name TEXT,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER,
    drink TEXT
);

CREATE TYPE user_follow_data AS (
    follow_id INTEGER,
    user_id INTEGER,
    display_name TEXT,
    visit_count INTEGER,
    unique_visit_count INTEGER
);

CREATE TYPE user_summary_data AS (
    user_id INTEGER,
    email TEXT,
    display_name TEXT,
    visits single_user_visit_data[]
);

CREATE TYPE user_count_data AS (
    user_id INTEGER,
    display_name TEXT,
    visit_count INTEGER,
    unique_visit_count INTEGER
);