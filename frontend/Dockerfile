# Use Node.js LTS version
FROM node:18-alpine AS base

# Set pnpm environment variables
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install pnpm
RUN npm install -g pnpm@8.15.4
# Create app directory
WORKDIR /usr/src/app

# Copy only package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --force

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Use Nginx to serve the built files
FROM nginx:alpine

# Copy built files from the previous stage
COPY --from=base /usr/src/app/dist /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 
