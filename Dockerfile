# Stage 1: Build
FROM node:18-slim AS builder

WORKDIR /app

# ติดตั้งไลบรารีที่จำเป็น
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy Prisma schema and directory
COPY prisma ./prisma

# Install Prisma CLI
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Run
FROM node:18-slim

WORKDIR /app

# ติดตั้งไลบรารีที่จำเป็น
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy built application and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Expose the application port
EXPOSE 5623

# Run Prisma migrations before starting the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
