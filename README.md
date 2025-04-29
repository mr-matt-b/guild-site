# Guild Site

## Docker Installation (Linux)

If you're new to Docker, you can install it with a single command:

```bash
# For Ubuntu/Debian
sudo apt update && sudo apt install -y docker.io docker-compose

# For Fedora
sudo dnf install -y docker docker-compose

# For CentOS/RHEL
sudo yum install -y docker docker-compose
```

After installation, start Docker and enable it to run on boot:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

Add your user to the docker group to run Docker commands without sudo:

```bash
sudo usermod -aG docker $USER
```

You'll need to log out and back in for this to take effect.

## Quick Start

1. Clone this repository
2. Run:

```bash
docker-compose up -d
```

This will:

- Build the Docker images
- Start all services
- Set up the MongoDB database with default credentials
- Configure all necessary environment variables

## Accessing the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Mongo Express: http://localhost:8081

## Stopping the Application

```bash
docker-compose down
```

To remove all data (including MongoDB data):

```bash
docker-compose down -v
```
