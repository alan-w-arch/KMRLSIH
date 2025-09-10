# Use official Postgres image
FROM postgres:16

# Install pgvector extension
RUN apt-get update && \
    apt-get install -y postgresql-16-pgvector && \
    rm -rf /var/lib/apt/lists/*

# Copy initialization scripts into the container
# Anything in /docker-entrypoint-initdb.d/ runs automatically at first startup
COPY init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
