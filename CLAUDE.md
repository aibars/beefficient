# Beefficient — código

Este repo tiene solo el código. El contexto de producto y las decisiones viven en el
workspace `beefficient-workspace`. Cuando el repo está clonado por bootstrap, el
workspace queda en `../../`; si no, en https://github.com/aibars/beefficient-workspace.

Antes de cambiar algo, leé lo que aplique:

- `../../PRODUCT.md`: usuarios, restricciones y autoridad visual. Manda el prototipo de
  Gastón `Beefficient_29.7.26`. `@beefficient/tokens` ya está alineado con él.
- `../../docs/decisions/`: ADRs. No se contradicen desde el código. Si hace falta cambiar
  una decisión, se escribe una ADR nueva en el workspace.
- `../../docs/fuentes/`: wireframes, prototipos y la planilla CREA con sus fórmulas.
- `../../CLAUDE.md`: instrucciones del workspace.

## Convenciones

- pnpm + Turborepo. `pnpm typecheck && pnpm test && pnpm build` antes de cerrar un cambio.
- Los cálculos van en `packages/domain` (TypeScript puro, con tests). La UI no calcula.
- Textos de la UI en castellano rioplatense. Las pantallas llevan solo labels y datos
  funcionales; las explicaciones van en la documentación (MDX de Storybook).
- Los datos de ejemplo se marcan como ejemplo. Los coeficientes de nutrición los validan
  Gastón Alfaro y Federico Podversich.
- En `apps/mobile`, leé `apps/mobile/AGENTS.md` antes de tocar APIs de Expo.

## Requisitos a futuro

**PostGIS** para el manejo del rodeo: parcelas como geometrías, ganado asignado a
parcelas y consultas espaciales. Implica la extensión PostGIS, migrations con columnas
`geometry/geography` e índices GiST/BRIN. Se planea cuando se defina el alcance de la
feature de rodeos.
