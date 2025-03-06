# Use Node.js as base image
FROM gdssingapore/airbase:node-22-builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies and serve (for hosting the built app)
RUN npm ci && npm install -g serve

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose port 3000 (default for serve)
EXPOSE 3000

# Environment variable for the backend API (can be overridden at runtime)
ENV REACT_APP_API_URL=http://localhost:8080

# Command to serve the built application
CMD ["serve", "-s", "build", "-l", "3000"]
