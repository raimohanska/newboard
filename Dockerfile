# Stage 1: Install root and backend dependencies
FROM node:20-alpine AS backend-deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY backend/package.json ./backend/

# Install dependencies
RUN npm install --workspace=backend --ignore-scripts

# Stage 2: Install frontend dependencies  
FROM node:20-alpine AS frontend-deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/

# Install dependencies
RUN npm install --workspace=frontend --ignore-scripts

# Stage 3: Build frontend
FROM frontend-deps AS frontend-builder
WORKDIR /app

# Copy frontend source
COPY frontend/src ./frontend/src
COPY frontend/index.html ./frontend/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/tsconfig.node.json ./frontend/
COPY frontend/vite.config.ts ./frontend/

# Build frontend
RUN npm run build --workspace=frontend

# Stage 4: Production image
FROM node:20-alpine AS production
WORKDIR /app

# Copy root package.json
COPY package.json ./

# Copy backend with dependencies from backend-deps stage
COPY --from=backend-deps /app/node_modules ./node_modules
COPY backend ./backend

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose port
EXPOSE 1234

# Set production environment
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:1234', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start server (tsx runs TypeScript)
CMD ["./node_modules/.bin/tsx", "backend/src/server.ts"]

