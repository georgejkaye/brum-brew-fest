DROP TYPE IF EXISTS user_data CASCADE;
DROP TYPE IF EXISTS venue_data CASCADE;
DROP TYPE IF EXISTS venue_visit_data CASCADE;
DROP TYPE IF EXISTS user_summary_data CASCADE;
DROP TYPE IF EXISTS user_visit_data CASCADE;
DROP TYPE IF EXISTS single_user_visit_data CASCADE;

CREATE TYPE user_data AS (
    user_id INTEGER,
    email TEXT,
    display_name TEXT,
    hashed_password TEXT,
    is_active BOOLEAN,
    is_superuser BOOLEAN,
    is_verified BOOLEAN
);

CREATE TYPE venue_visit_data AS (
    visit_id INTEGER,
    user_id INTEGER,
    user_display_name TEXT,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER
);

CREATE TYPE venue_data AS (
    venue_id INTEGER,
    venue_name TEXT,
    venue_address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    visits venue_visit_data[]
);

CREATE TYPE user_visit_data AS (
    visit_id INTEGER,
    user_id INTEGER,
    venue_id INTEGER,
    venue_name TEXT,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER
);

CREATE TYPE single_user_visit_data AS (
    visit_id INTEGER,
    venue_id TEXT,
    venue_name TEXT,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER
);

CREATE TYPE user_summary_data AS (
    user_id INTEGER,
    display_name TEXT,
    visits single_user_visit_data[]
);