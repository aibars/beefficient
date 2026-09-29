FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy root package.json and lock file
COPY package.json pnpm-lock.yaml ./

# Copy frontend files
COPY frontend ./frontend

# Install dependencies
RUN pnpm install --frozen-lockfile

EXPOSE 3000

CMD ["pnpm", "--filter", "frontend-web", "dev"]
