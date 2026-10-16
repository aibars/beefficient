FROM node:24-alpine

WORKDIR /app

RUN corepack enable

# Manifiestos del workspace y lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web ./apps/web

RUN pnpm install --frozen-lockfile --filter @beefficient/web...

EXPOSE 3000

CMD ["pnpm", "--filter", "@beefficient/web", "dev"]
