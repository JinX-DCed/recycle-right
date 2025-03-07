# Recycle Right

A web application to help users identify recyclable items and locate recycling bins.

## Docker Deployment

This project consists of a React frontend and Express backend which can be deployed using Docker.

### Prerequisites

- Docker and Docker Compose installed on your system
- Gemini API key (for backend functionality)

### Running with Docker Compose

If you have Docker Compose installed:

1. Clone this repository
2. Make sure your Gemini API key is in the `.env` file at the root of the project
3. Build and start the containers:

```bash
docker-compose up --build
```

4. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

### Running with Docker Commands (No Docker Compose)

If you don't have Docker Compose installed, you can run the containers separately using Docker:

1. First, create a Docker network for the containers to communicate:

```bash
docker network create recycle-right-network
```

2. Build and run the backend container:

```bash
cd recycle-right-backend
docker build -t recycle-right-backend .
docker run -d --name recycle-right-backend --network recycle-right-network -p 3001:3001 -e GEMINI_API_KEY=your_api_key -e PORT=3001 recycle-right-backend
```

3. Build and run the frontend container:

```bash
cd recycle-right-frontend
docker build -t recycle-right-frontend .
docker run -d --name recycle-right-frontend --network recycle-right-network -p 8080:8080 recycle-right-frontend
```

4. Access the application:
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001

### Individual Container Deployment

You can also build and run each container separately:

#### Backend

```bash
cd recycle-right-backend
docker build -t recycle-right-backend .
docker run -p 3001:3001 -e GEMINI_API_KEY=your_api_key -e PORT=3001 recycle-right-backend
```

#### Frontend

```bash
cd recycle-right-frontend
docker build -t recycle-right-frontend .
docker run -p 8080:8080 -e REACT_APP_API_URL=http://localhost:3001 recycle-right-frontend
```

### Notes

- The frontend container expects the backend to be accessible at `http://recycle-right-backend:3001` when running in Docker Compose
- When running containers individually, make sure to set `REACT_APP_API_URL` to the appropriate backend URL
