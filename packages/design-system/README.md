# @beefficient/tokens

Tokens de diseño de Beefficient, alineados con el prototipo de Gastón
`Beefficient_29.7.26` (autoridad visual, ver `PRODUCT.md`): fondo crema, terracota y
oliva, Caprasimo para títulos y cifras, Figtree para texto, radios de 8/16/28 y sombras
cálidas suaves. Un solo tema claro.

## Fuentes

`tokens/*.json` en formato DTF (`value`, `type`, `description`):

- `colors.json`: superficies, texto, escalas `accent` (terracota) y `olive` (accent-2 del
  prototipo) de 100 a 900, `neutral` y la serie de colores de lote.
- `typography.json`: familias, pesos y tamaños.
- `spacing.json`, `borders.json` (radios), `shadows.json` (estructuradas), `transitions.json`.

Los tokens que no salen del prototipo sino del wireframe móvil lo dicen en su descripción.

## Salidas (`npm run build`)

| Import | Archivo | Forma |
|---|---|---|
| `@beefficient/tokens/native` | `dist/native.js` + `.d.ts` | Objeto anidado para React Native: `tokens.color.accent.base`, `tokens.radius.lg === 28` |
| `@beefficient/tokens` | `dist/index.js` | Exports ES6 en camelCase: `colorAccentBase` |
| `@beefficient/tokens/css` | `dist/variables.css` | `var(--color-accent-base)` |
| `@beefficient/tokens/json` | `dist/tokens.json` | JSON plano en kebab-case |

Las sombras salen como string de `box-shadow`, que sirve en CSS y en la prop `boxShadow` de
React Native 0.76+.

## Desarrollo

```bash
npm run build -w @beefficient/tokens
npm test -w @beefficient/tokens     # build + verificación contra el prototipo
```

`dist/` no se commitea: Storybook lo genera antes de arrancar (`prestorybook`).
