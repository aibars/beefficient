# Beefficient

Plataforma para el negocio ganadero de carne en Argentina. Módulos: mercado y precios, noticias del sector, biblioteca técnica, herramientas de cálculo, chat técnico con IA, y plataforma de suscripción.

## Stack

- **Backend:** Node.js + Express (o similar)
- **Frontend Web:** React
- **Frontend Mobile:** React Native
- **Landing:** React
- **Database:** PostgreSQL + PostGIS (futuro)
- **Orchestration:** Docker Compose

## Estructura del proyecto

```
beefficient/
├── backend/              # API Node.js
│   ├── src/
│   ├── tests/
│   ├── migrations/       # DB migrations
│   └── package.json
├── frontend/
│   ├── web/             # React web app
│   ├── mobile/          # React Native mobile app
│   └── landing/         # Landing page
├── docker/              # Docker files
│   └── docker-compose.yml
├── .github/workflows/   # CI/CD
├── docs/                # Documentación
└── package.json         # Root workspace (pnpm/yarn)
```

## Desarrollo local

### Requisitos
- Node.js >= 20
- Docker & Docker Compose
- `pnpm` o `yarn`

### Setup inicial

```bash
# Clonar y entrar al directorio
git clone https://github.com/aibars/beefficient.git
cd beefficient

# Instalar dependencias
pnpm install

# Levantar servicios (PostgreSQL, etc)
docker-compose up -d

# Correr migraciones (cuando existan)
cd backend && pnpm migrate

# Desarrollo
pnpm dev
```

Esto inicia en paralelo:
- Backend en `http://localhost:3001`
- Frontend web en `http://localhost:3000`
- Landing en `http://localhost:3002` (si está separado)

### Variables de entorno

Ver `backend/.env.example` y `frontend/.env.example` para referencias.

## Documentación

- [Workspace Beefficient](https://github.com/aibars/beefficient-workspace) — Specs, ADRs, planes
- [Linear Tracker](https://linear.app/beefficient/team/BFC) — Tareas y seguimiento
- [docs/](./docs/) — Notas técnicas, decisiones de arquitectura

## Contribuir

Las tareas viven en [Linear](https://linear.app/beefficient/team/BFC). PRs se revisan siguiendo [workflow del workspace](https://github.com/aibars/beefficient-workspace/blob/main/docs/workflow.md).

## License

Por definir.
