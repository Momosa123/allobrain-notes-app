# Stage 1: Build the Next.js application
FROM node:22 AS builder

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN pnpm run build

# Stage 2: Production environment
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm globally (needed again in this stage)
RUN npm install -g pnpm

# Copy package manager files from builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml* ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose the port the app runs on
EXPOSE 3000

# Set the environment to production
ENV NODE_ENV=production
# Command to run the application
CMD ["pnpm", "start"]
