// Genera las salidas de @beefficient/tokens a partir de tokens/*.json.
// - dist/variables.css  variables CSS (kebab): var(--color-accent-base)
// - dist/index.js       exports ES6 planos (camelCase): colorAccentBase
// - dist/tokens.json    JSON plano (kebab)
// - dist/native.js      objeto anidado para React Native: tokens.color.accent.base
const StyleDictionary = require('style-dictionary');

const hexToRgba = (hex, opacity) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${opacity})`;
};

// Las sombras se guardan estructuradas y salen como string de box-shadow,
// válido tanto en CSS como en la prop `boxShadow` de React Native (0.76+).
StyleDictionary.registerTransform({
  name: 'shadow/box-shadow',
  type: 'value',
  matcher: (t) => t.type === 'shadow',
  transformer: ({ value: v }) => `${v.x}px ${v.y}px ${v.blur}px ${hexToRgba(v.color, v.opacity)}`,
});

// React Native trabaja con números sin unidad.
StyleDictionary.registerTransform({
  name: 'native/number',
  type: 'value',
  matcher: (t) => ['dimension', 'number', 'duration'].includes(t.type),
  transformer: (t) => parseFloat(t.value),
});

StyleDictionary.registerFormat({
  name: 'javascript/native-nested',
  formatter: ({ dictionary }) => {
    const tree = {};
    for (const t of dictionary.allTokens) {
      let node = tree;
      t.path.slice(0, -1).forEach((k) => (node = node[k] ??= {}));
      node[t.path[t.path.length - 1]] = t.value;
    }
    const json = JSON.stringify(tree, null, 2);
    return `// Generado por build.cjs. No editar a mano.\nexport const tokens = ${json};\nexport default tokens;\n`;
  },
});

StyleDictionary.registerFormat({
  name: 'typescript/native-nested-declarations',
  formatter: ({ dictionary }) => {
    const tree = {};
    for (const t of dictionary.allTokens) {
      let node = tree;
      t.path.slice(0, -1).forEach((k) => (node = node[k] ??= {}));
      node[t.path[t.path.length - 1]] = t.value;
    }
    return `// Generado por build.cjs. No editar a mano.\nexport declare const tokens: ${JSON.stringify(tree, null, 2)};\nexport default tokens;\n`;
  },
});

const source = ['tokens/**/*.json'];

StyleDictionary.extend({
  source,
  platforms: {
    css: {
      transforms: ['attribute/cti', 'name/cti/kebab', 'shadow/box-shadow'],
      buildPath: 'dist/',
      files: [{ destination: 'variables.css', format: 'css/variables' }],
    },
    js: {
      transforms: ['attribute/cti', 'name/cti/camel', 'shadow/box-shadow'],
      buildPath: 'dist/',
      files: [{ destination: 'index.js', format: 'javascript/es6' }],
    },
    json: {
      transforms: ['attribute/cti', 'name/cti/kebab', 'shadow/box-shadow'],
      buildPath: 'dist/',
      files: [{ destination: 'tokens.json', format: 'json/flat' }],
    },
    native: {
      transforms: ['attribute/cti', 'name/cti/camel', 'shadow/box-shadow', 'native/number'],
      buildPath: 'dist/',
      files: [
        { destination: 'native.js', format: 'javascript/native-nested' },
        { destination: 'native.d.ts', format: 'typescript/native-nested-declarations' },
      ],
    },
  },
}).buildAllPlatforms();
