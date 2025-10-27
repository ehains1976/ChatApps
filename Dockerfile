FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (all, including dev dependencies for build)
RUN npm install

# Copy only necessary files
COPY src ./src
COPY simple-backend.js ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "simple-backend.js"]

