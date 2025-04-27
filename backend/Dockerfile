FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install all dependencies (including dev)
RUN pnpm install

# Explicitly install typescript again (workaround for pnpm/Docker bug)
RUN pnpm add -D typescript

COPY . .

RUN ls -l ./node_modules
RUN ls -l ./node_modules/.bin
RUN ls -l ./node_modules/typescript/bin || true

RUN pnpm exec tsc

RUN pnpm prune --prod

EXPOSE 3001

CMD ["pnpm", "run", "start:prod"]