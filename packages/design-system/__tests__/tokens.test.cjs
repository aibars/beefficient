// Verifica que las salidas generadas respeten los tokens del prototipo
// Beefficient_29.7.26 (autoridad visual, ver PRODUCT.md del workspace).
const fs = require('fs');
const path = require('path');

const dist = (f) => path.join(__dirname, '../dist', f);
const read = (f) => fs.readFileSync(dist(f), 'utf-8');

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const PROTOTIPO = {
  'color-bg': '#f5ead8',
  'color-surface': '#ebddc5',
  'color-text-base': '#201e1d',
  'color-accent-base': '#c67139',
  'color-accent-700': '#8c491a',
  'color-olive-base': '#7a8a5e',
  'color-olive-700': '#56633f',
  'color-neutral-100': '#f9f4ed',
  'color-neutral-900': '#2e2b25',
  'radius-sm': '8px',
  'radius-md': '16px',
  'radius-lg': '28px',
  'font-family-heading': 'Caprasimo',
  'font-family-body': 'Figtree',
};

test('se generan todas las salidas', () => {
  for (const f of ['index.js', 'variables.css', 'tokens.json', 'native.js', 'native.d.ts']) {
    assert(fs.existsSync(dist(f)), `Falta dist/${f}`);
  }
});

test('tokens.json coincide con el prototipo', () => {
  const json = JSON.parse(read('tokens.json'));
  for (const [k, v] of Object.entries(PROTOTIPO)) {
    assert(json[k] === v, `${k}: esperaba ${v}, hay ${json[k]}`);
  }
});

test('no quedan los colores viejos (#667eea, #764ba2)', () => {
  for (const f of ['index.js', 'variables.css', 'tokens.json', 'native.js']) {
    const c = read(f);
    assert(!c.includes('#667eea') && !c.includes('#764ba2'), `dist/${f} tiene colores viejos`);
  }
});

test('variables.css expone las variables', () => {
  const css = read('variables.css');
  assert(css.includes('--color-accent-base: #c67139;'), 'falta --color-accent-base');
  assert(css.includes('--shadow-md: 0px 3px 10px rgba(46, 43, 37, 0.16);'), 'falta --shadow-md');
});

test('index.js tiene exports válidos en camelCase', () => {
  const js = read('index.js');
  const names = [...js.matchAll(/export const (\S+) =/g)].map((m) => m[1]);
  assert(names.length > 0, 'no hay exports');
  const invalid = names.filter((n) => !/^[A-Za-z_$][\w$]*$/.test(n));
  assert(invalid.length === 0, `identificadores inválidos: ${invalid.join(', ')}`);
  assert(js.includes('export const colorAccentBase = "#c67139";'), 'falta colorAccentBase');
});

test('native.js es un objeto anidado con números sin unidad', async () => {
  const js = read('native.js');
  const tokens = JSON.parse(js.slice(js.indexOf('{'), js.lastIndexOf('}') + 1));
  assert(tokens.color.accent.base === '#c67139', 'color.accent.base');
  assert(tokens.radius.lg === 28, 'radius.lg debería ser 28');
  assert(tokens.font.size.base === 15, 'font.size.base debería ser 15');
  assert(tokens.shadow.md === '0px 3px 10px rgba(46, 43, 37, 0.16)', 'shadow.md');
});

console.log('\n✓ Todos los tests de tokens pasaron.');
