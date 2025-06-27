# Stage 1: Build
FROM node:22.15.0-alpine3.21 AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY .yarnrc.yml ./ 

# Enable corepack and install specific Yarn version
RUN corepack enable && corepack prepare yarn@4.9.1 --activate

# Install dependencies
RUN yarn install --immutable

# Copy source files
COPY . .

# Build the application
RUN yarn build


# Stage 2: Production
FROM node:22.15.0-alpine3.21

# Set working directory
WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:${PORT}/health || exit 1

# Start application
CMD ["node", "dist/src/main.js"]