# Guild Site

A web application for managing guild information and character data.

## Prerequisites

- Docker
- Docker Compose
- A Blizzard API token (get one from https://develop.battle.net/)

## Quick Start

1. Clone this repository
2. Make the setup script executable and run it:

```bash
chmod +x setup.sh
./setup.sh
```

This will:

- Create necessary environment files
- Build the Docker images
- Start all services

## Manual Setup

If you prefer to set up manually:

1. Clone this repository
2. Copy `backend/.env.example` to `backend/.env`
3. Update `backend/.env` with your Blizzard API token
4. Run:

```bash
docker-compose up -d
```

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Mongo Express: http://localhost:8081

## Environment Variables

The application uses the following environment variables:

- `WOW_API_TOKEN`: Blizzard API token for fetching character data (required)
- `MONGO_URI`: MongoDB connection string (configured in docker-compose.yml, override if needed)

## Stopping the Application

```bash
docker-compose down
```

To remove all data (including MongoDB data):

```bash
docker-compose down -v
```
