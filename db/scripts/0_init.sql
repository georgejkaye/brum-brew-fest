CREATE TABLE app_user (
    user_id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL UNIQUE,
    hashed_password TEXT NOT NULL,
    is_active BOOLEAN NOT NULL,
    is_superuser BOOLEAN NOT NULL,
    is_verified BOOLEAN NOT NULL,
    last_verify_request TIMESTAMP WITH TIME ZONE
);

CREATE TABLE area (
    area_id SERIAL PRIMARY KEY,
    area_name TEXT NOT NULL UNIQUE
);

CREATE TABLE venue (
    venue_id SERIAL PRIMARY KEY,
    venue_name TEXT NOT NULL,
    venue_address TEXT NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    pin_location BOOLEAN NOT NULL,
    area_id INTEGER NOT NULL,
    UNIQUE (venue_name, venue_address),
    FOREIGN KEY (area_id) REFERENCES area(area_id)
);

CREATE TABLE visit (
    visit_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    venue_id INTEGER NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    rating INTEGER,
    drink TEXT,
    FOREIGN KEY (user_id) REFERENCES app_user(user_id),
    FOREIGN KEY (venue_id) REFERENCES venue(venue_id)
);

CREATE TABLE follow (
    follow_id SERIAL PRIMARY KEY,
    follow_source_user_id INTEGER NOT NULL,
    follow_target_user_id INTEGER NOT NULL,
    FOREIGN KEY (follow_source_user_id) REFERENCES app_user(user_id),
    FOREIGN KEY (follow_target_user_id) REFERENCES app_user(user_id),
    CONSTRAINT follow_check_source_target_distinct
        CHECK (follow_source_user_id != follow_target_user_id),
    CONSTRAINT follow_unique_source_target
        UNIQUE (follow_source_user_id, follow_target_user_id)
);