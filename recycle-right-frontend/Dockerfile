# Use Node.js as base image
FROM gdssingapore/airbase:node-22-builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and serve (for hosting the built app)
RUN npm ci && npm install -g serve

# Environment variables for API URLs (can be overridden at runtime)
# This will be overridden during deployment with the appropriate backend URL
ENV REACT_APP_API_URL=http://localhost:8080
# Mapbox token should be provided at runtime via environment variables
# Do not hardcode sensitive tokens in the Dockerfile
ENV REACT_APP_MAPBOX_TOKEN=''

# Copy .env.default file specifically to ensure it's available in the container
COPY .env.default /app/.env.default

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Command to serve the built application
CMD ["serve", "-s", "build", "-l", "3000", "--cors"]

