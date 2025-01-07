-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE IF NOT EXISTS "resumes" (
    "id" SERIAL PRIMARY KEY,
    "user_id" UUID NOT NULL,
    "pdf_key" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "resume_parses" (
    "id" SERIAL PRIMARY KEY,
    "resume_id" INTEGER REFERENCES resumes(id),
    "user_id" UUID NOT NULL,
    "parsed_data" JSONB,
    "error_message" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL
); 