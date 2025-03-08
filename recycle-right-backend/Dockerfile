FROM gdssingapore/airbase:node-22-builder

# Set working directory
WORKDIR /app

# Copy everything to the container
COPY . .

# Install dependencies
RUN npm install

# Expose port 3001
EXPOSE 3001

# Set NODE_ENV
ENV NODE_ENV=production

# Command to run the application
CMD ["npm", "start"]
