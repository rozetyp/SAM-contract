# Use Node.js 22 base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with npm
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]
