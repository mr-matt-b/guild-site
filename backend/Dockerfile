FROM node:18-alpine

WORKDIR /usr/src/app

# Install specific version of pnpm
RUN npm install -g pnpm@8.15.4

# Copy only package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build the application
RUN pnpm exec tsc

# Create public directory in dist
RUN mkdir -p dist/public

# Copy public directory to dist
COPY public dist/public/

# Remove dev dependencies
RUN pnpm prune --prod

# Set working directory to dist
WORKDIR /usr/src/app/dist

EXPOSE 3001

CMD ["pnpm", "run", "start"]