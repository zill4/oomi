CREATE TABLE IF NOT EXISTS resume_parses (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    resume_id TEXT NOT NULL,
    pdf_key TEXT NOT NULL,
    parsed_data JSONB,
    error_message TEXT,
    confidence_scores JSONB,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX resume_parses_user_id_idx ON resume_parses(user_id);
CREATE INDEX resume_parses_resume_id_idx ON resume_parses(resume_id); 