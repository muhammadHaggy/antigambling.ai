# Stage 1: Install dependencies and build the Next.js application
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies using npm ci for clean and reproducible builds
RUN npm ci

# Copy the rest of the application code
COPY . .

# Generate Prisma client and apply migrations
# Ensure your DATABASE_URL is set correctly in .env or passed as build-arg/env-var
# For SQLite, the dev.db file will be created in the root of the app directory
RUN npx prisma generate
RUN npx prisma migrate deploy

# Build the Next.js application
# The output: 'standalone' in next.config.js will create a .next/standalone folder
RUN npm run build

# Stage 2: Create the production-ready image
# Use a lightweight base image for the final production image
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment variables for Next.js to use the standalone output
ENV NODE_ENV production

# Copy the standalone output from the builder stage
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy the prisma folder and the dev.db file from the builder stage
# This ensures the database file is present in the final image,
# and then it will be mounted over by the volume in docker-compose.yml
COPY --from=builder /app/prisma ./prisma

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Command to run the Next.js application
CMD ["node", "server.js"]
