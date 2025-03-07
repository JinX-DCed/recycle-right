# Recycle Right

A full-stack application with React frontend and Express backend for helping users understand recycling correctly.

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed on your system
- Any required API keys (e.g., Google Gemini API key) for the backend

### Deployment Steps

1. **Setup Environment Variables**
   - Ensure the `.env` file in `recycle-right-backend` contains your API keys
   - For custom frontend settings, you can modify environment variables in the docker-compose.yml file

2. **Build and Run the Application**
   - From the project root directory, run:
   ```bash
   docker-compose up --build
   ```
   - To run in detached mode (background):
   ```bash
   docker-compose up --build -d
   ```

3. **Accessing the Application**
   - Frontend: http://localhost:8080
   - The backend API is not directly exposed outside the Docker network for security

4. **Stopping the Application**
   ```bash
   docker-compose down
   ```

## Architecture

- **Frontend**: React application served on port 8080
- **Backend**: Express server with Gemini API integration
- Docker network ensures secure communication between services

## Development

For local development outside of Docker:

### Frontend
```bash
cd recycle-right-frontend
npm install
npm start
```

### Backend
```bash
cd recycle-right-backend
npm install
npm run build
npm start
```
