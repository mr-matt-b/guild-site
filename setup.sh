#!/bin/bash

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env file..."
    cp backend/.env.example backend/.env
    echo "Please update backend/.env with your Blizzard API token"
fi

# Build and start the containers
echo "Building and starting containers..."
docker-compose up -d --build

echo "Setup complete! The application should be running at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:3001"
echo "- Mongo Express: http://localhost:8081"
echo ""
echo "Don't forget to update your Blizzard API token in backend/.env!" 