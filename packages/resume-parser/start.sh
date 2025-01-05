#!/bin/sh
# Run migrations first
sqlx migrate run

# Start the application with cargo watch
exec cargo watch -x run 