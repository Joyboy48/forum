# server/Dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy server files
COPY server/ .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["node", "index.js"]