#!/bin/sh
# wait-for-it.sh

set -e

# Split host and port
host=$(echo $1 | cut -d: -f1)
port=$(echo $1 | cut -d: -f2)

until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$host" -p "$port" -U "$POSTGRES_USER" -d "postgres" -c '\q'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"
exec $cmd 