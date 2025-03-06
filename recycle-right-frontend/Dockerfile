# Use Node.js as base image
FROM gdssingapore/airbase:node-22-builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and serve (for hosting the built app)
RUN npm ci && npm install -g serve

# Environment variables for API URLs and tokens (can be overridden at runtime)
# This will be overridden during deployment with the appropriate backend URL
ENV REACT_APP_API_URL=http://recycle-right-backend:3000
ENV REACT_APP_MAPBOX_TOKEN=pk.eyJ1IjoieW9qZXJyeSIsImEiOiJjamRsZGZzaDYwNW52MnhxaGVta25pbWM5In0.23w4XcxSUUyeK263dtTOtg

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Command to serve the built application
CMD ["serve", "-s", "build", "-l", "8080"]

