FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package.json and lock file
COPY package.json pnpm-lock.yaml ./

# Copy backend specific files
COPY backend ./backend

# Install dependencies
RUN pnpm install --frozen-lockfile

EXPOSE 3001

CMD ["pnpm", "--filter", "backend", "dev"]
