# @beefficient/tokens

Design tokens for Beefficient — centralized, modular, shared across web, mobile, and landing.

## What's Inside

- **colors.json** — Color palette (primaries, accents, neutrales, text, overlays)
- **typography.json** — Font family, sizes, weights, line-heights
- **spacing.json** — Spacing scale (xs to xxl)
- **shadows.json** — Shadow elevation levels
- **borders.json** — Border radius and width values
- **transitions.json** — Animation timing and easing

Generated outputs:
- `dist/index.js` — ES6 named exports for React (web/mobile)
- `dist/variables.css` — CSS custom properties for vanilla CSS/HTML
- `dist/tokens.json` — Flat JSON object for programmatic access

## How to Use

### Web (React)

```javascript
// Import tokens as JavaScript objects
import { 'color-primary': colorPrimary } from '@beefficient/tokens';

// Or import CSS variables
import '@beefficient/tokens/css';

// Use in styles
const buttonStyle = {
  backgroundColor: colorPrimary,
};
```

### Mobile (React Native)

```javascript
import tokens from '@beefficient/tokens/json';

const Colors = tokens['color-primary'];
```

### Landing (HTML/CSS)

```html
<link rel="stylesheet" href="./node_modules/@beefficient/tokens/dist/variables.css">

<style>
  .button {
    background-color: var(--color-primary);
    font-size: var(--font-size-base);
    padding: var(--spacing-md);
  }
</style>
```

## Development

### Building Tokens

```bash
npm run build    # Generate outputs once
npm run watch    # Watch tokens/ and rebuild on changes
npm test         # Run validation tests
```

### Adding New Tokens

1. Edit the relevant JSON file in `tokens/`
2. Follow DTF structure (include `value`, `type`, `description`)
3. Run `npm run build` to generate outputs
4. Commit with descriptive message

### Naming Convention

Tokens are generated in kebab-case: `token-name`.

Examples:
- `color-primary` (CSS: `var(--color-primary)`)
- `font-size-lg` (CSS: `var(--font-size-lg)`)
- `spacing-md` (CSS: `var(--spacing-md)`)

### Updating Tokens

1. Create a branch: `git checkout -b feat/tokens-update-description`
2. Edit tokens in `tokens/`
3. Build: `npm run build`
4. Test: `npm test`
5. PR for review (Gastón reviews design changes)
6. Merge to main

## File Structure

```
tokens/
├── colors.json              # Color palette
├── typography.json          # Font and text styles
├── spacing.json             # Margin, padding, gap scale
├── shadows.json             # Elevation shadows
├── borders.json             # Radii and widths
├── transitions.json         # Timing and easing
└── index.json               # Reference (not processed)

dist/                        # Generated outputs (do not edit)
├── index.js
├── variables.css
└── tokens.json

__tests__/
└── tokens.test.js           # Validation tests
```

## Design Decisions

- **DTF (Design Tokens Format):** W3C standard for token definitions — platform-agnostic and tool-compatible
- **Style Dictionary:** Generates outputs for multiple platforms from a single source
- **Workspace:** Monorepo integration via Turborepo workspaces — no external publishing needed

## Testing

Tokens are validated automatically:
- All JSON files are valid DTF
- Generated outputs contain expected values
- CSS variables match token definitions
- JS exports are syntactically valid

Run tests: `npm test`

## Questions?

- Check the spec: `docs/superpowers/specs/2026-10-04-design-system-tokens-design.md`
- Ask Agustín (maintains tokens) or Gastón (design authority)
