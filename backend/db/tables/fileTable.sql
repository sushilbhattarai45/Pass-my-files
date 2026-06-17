CREATE TABLE  IF NOT EXISTS fileDetails(
    id SERIAL PRIMARY_KEY,
    name VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    path TEXT NOT NULL,
    expires_at TIMETSAMPZ NOT NULL,
    created_at TIMESTAMPZ DEFAULT NOW(),
    user_id VARCAR(255),
);