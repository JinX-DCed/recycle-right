# Use Node.js as base image
FROM gdssingapore/airbase:node-22-builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Compile TypeScript to JavaScript
RUN npx tsc

# Environment variables
ENV PORT=8080

# Expose port 8080
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/index.js"]
