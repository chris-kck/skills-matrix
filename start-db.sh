#!/usr/bin/env bash
# Use this script to start a container for a local development database using OrbStack

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install OrbStack - https://orbstack.dev/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS, ensure OrbStack is installed and initialized, then run this script directly - `./start-database.sh`

DB_CONTAINER_NAME="neo4j"

# Check if OrbStack is installed
if ! [ -x "$(command -v orb)" ]; then
  echo -e "OrbStack is not installed. Please install OrbStack and try again.\nOrbStack install guide: https://orbstack.dev/"
  exit 1
fi

# Ensure OrbStack is running
if ! orb status | grep -q "Running"; then
  echo "OrbStack is not running. Starting OrbStack..."
  orb start
fi

# Check if Docker CLI is available (OrbStack uses Docker CLI)
if ! [ -x "$(command -v docker)" ]; then
  echo "Docker CLI is not available. Ensure it is installed and accessible."
  exit 1
fi

# Check if the container is already running
if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  exit 0
fi

# Check if a stopped container exists
if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  docker start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  exit 0
fi

# Import environment variables from .env
# set -a
# source .env

# DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
# DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')


# # Handle default database password
# if [ "$DB_PASSWORD" = "password" ]; then
#   echo "You are using the default database password"
#   read -p "Should we generate a random password for you? [y/N]: " -r REPLY
#   if ! [[ $REPLY =~ ^[Yy]$ ]]; then
#     echo "Please change the default password in the .env file and try again"
#     exit 1
#   fi
#   # Generate a random URL-safe password
#   DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
#   sed -i -e "s#:password@#:$DB_PASSWORD@#" .env
# fi

# Run the container using Docker CLI (managed by OrbStack)
docker run -d \
  --name $DB_CONTAINER_NAME \
  -p 7474:7474 \
  -p 7687:7687 \
  -e NEO4J_AUTH=neo4j/password \
   neo4j:latest
   && echo "Database container '$DB_CONTAINER_NAME' was successfully created"