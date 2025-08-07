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