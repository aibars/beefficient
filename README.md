# Beefficient

Plataforma para el negocio ganadero de carne en Argentina: mercado y precios, noticias del
sector, biblioteca técnica, herramientas de cálculo, chat técnico con IA y plataforma de
suscripción. El MVP es la Planilla de Pastoreo móvil, la sync y la autenticación.

Este repo tiene **solo el código**. El producto, las specs, los planes, las ADRs y el
material de origen viven en el workspace,
[`beefficient-workspace`](https://github.com/aibars/beefficient-workspace), y las tareas
en [Linear](https://linear.app/beefficient/team/BFC).

## Relación con el workspace

El workspace clona este repo en `repos/beefficient` con `./scripts/bootstrap.sh`. Desde
ahí, el workspace queda en `../../`:

| Qué | Dónde (workspace) |
|---|---|
| Producto, usuarios y autoridad visual | [`PRODUCT.md`](https://github.com/aibars/beefficient-workspace/blob/main/PRODUCT.md) |
| Decisiones de arquitectura (ADRs) | [`docs/decisions/`](https://github.com/aibars/beefficient-workspace/blob/main/docs/decisions) |
| Specs y planes | [`docs/specs/`](https://github.com/aibars/beefficient-workspace/blob/main/docs/specs), [`docs/superpowers/`](https://github.com/aibars/beefficient-workspace/blob/main/docs/superpowers) |
| Alcance del MVP y modelo de datos | [`docs/mvp-scope.md`](https://github.com/aibars/beefficient-workspace/blob/main/docs/mvp-scope.md), [`docs/modelo-datos-rodeo.md`](https://github.com/aibars/beefficient-workspace/blob/main/docs/modelo-datos-rodeo.md) |
| Autenticación | [`docs/AUTH.md`](https://github.com/aibars/beefficient-workspace/blob/main/docs/AUTH.md) |
| Prototipos, planillas y wireframes | [`docs/fuentes/`](https://github.com/aibars/beefficient-workspace/blob/main/docs/fuentes) |
| Cómo trabajamos (Linear, PRs) | [`docs/workflow.md`](https://github.com/aibars/beefficient-workspace/blob/main/docs/workflow.md) |

Una decisión de arquitectura se registra como ADR en el workspace. Acá se implementa y el
commit o el PR la cita (p. ej., «ADR 0003»).

## Stack

| Parte | Tecnología | ADR |
|---|---|---|
| API | NestJS + TypeORM + PostgreSQL, JWT con Passport | 0002, 0005 |
| App móvil | React Native + Expo SDK 58, offline-first | 0001, 0007 |
| Web | React + Vite | 0003 |
| Monorepo | pnpm workspaces + Turborepo | 0003 |

## Estructura

```
apps/
  api/          @beefficient/api        NestJS (BFC-AUTH1/2)
  mobile/       @beefficient/mobile     Expo SDK 58
  web/          @beefficient/web        React + Vite (scaffold)
  landing/      @beefficient/landing    React + Vite (scaffold)
  storybook/    @beefficient/storybook  Storybook web de la UI móvil
packages/
  design-system/  @beefficient/tokens   tokens del prototipo 29/7 (Style Dictionary)
  domain/         @beefficient/domain   cálculos en TypeScript puro
  ui/             @beefficient/ui       componentes y pantallas React Native
```

`packages/contracts` (DTOs/`zod` compartidos, ADR 0003) todavía no existe.

## Desarrollo local

Requisitos: Node ≥ 22.12 (CI usa 24), pnpm 12 (`corepack enable`), Docker.

```bash
pnpm install
docker-compose up -d                        # PostgreSQL
cp apps/api/.env.example apps/api/.env      # y completar

pnpm dev                                    # todo en paralelo
pnpm storybook                              # http://localhost:6006
pnpm --filter @beefficient/mobile dev       # Expo
pnpm --filter @beefficient/api start:dev    # API en http://localhost:3001

pnpm typecheck && pnpm test && pnpm build   # lo mismo que corre CI
```

Los tests e2e de `apps/api` necesitan PostgreSQL; sin base, `pnpm --filter
@beefficient/api test:unit` corre solo los unitarios.

## Contribuir

Las tareas viven en [Linear](https://linear.app/beefficient/team/BFC). Los PRs siguen el
[workflow del workspace](https://github.com/aibars/beefficient-workspace/blob/main/docs/workflow.md).

## Licencia

Por definir.
