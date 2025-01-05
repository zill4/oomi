-- Add migration script here
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    pdf_key TEXT NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX resumes_user_id_idx ON resumes(user_id); 