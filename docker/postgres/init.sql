DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'oomi') THEN
        CREATE DATABASE oomi;
    END IF;
END
$$; 