# Build stage: Use Node.js builder image
FROM gdssingapore/airbase:node-22-builder AS builder

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install dependencies with exact versions from package-lock.json
# Using --production=false to ensure dev dependencies needed for build are included
RUN npm ci --production=false

# Copy the rest of the application code
COPY . .

# Set build-time arguments with defaults that can be overridden during build
ARG REACT_APP_API_URL=https://hypergreen-backend.app.tc1.airbase.sg
ARG NODE_ENV=production

# Set environment variables for build - these are REQUIRED for React
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV NODE_ENV=${NODE_ENV}
ENV CI=false

# Create production build
RUN npm run build

# Production stage: Use a smaller runtime image
FROM gdssingapore/airbase:node-22

# Set working directory
WORKDIR /app

# Install serve globally with a specific version
RUN npm install -g serve@14.2.1

# Copy only the built files from the builder stage
COPY --from=builder /app/build ./build

# Expose port 8080
EXPOSE 3000

# Set runtime environment variables with defaults
ENV PORT=3000
ENV NODE_ENV=production

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

# Command to run the application
CMD ["serve", "-s", "build"]