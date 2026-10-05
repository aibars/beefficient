const fs = require('fs');
const path = require('path');

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

function assertFileExists(filePath) {
  assert(fs.existsSync(filePath), `File not found: ${filePath}`);
}

function assertContains(filePath, text) {
  const content = fs.readFileSync(filePath, 'utf-8');
  assert(content.includes(text), `"${text}" not found in ${filePath}`);
}

// Test 1: Outputs are generated
test('dist/index.js exists', () => {
  assertFileExists(path.join(__dirname, '../dist/index.js'));
});

test('dist/variables.css exists', () => {
  assertFileExists(path.join(__dirname, '../dist/variables.css'));
});

test('dist/tokens.json exists', () => {
  assertFileExists(path.join(__dirname, '../dist/tokens.json'));
});

// Test 2: CSS variables are correctly generated
test('variables.css contains color-primary', () => {
  assertContains(path.join(__dirname, '../dist/variables.css'), '--color-primary');
});

test('variables.css contains #667eea value', () => {
  assertContains(path.join(__dirname, '../dist/variables.css'), '#667eea');
});

test('variables.css contains font-family', () => {
  assertContains(path.join(__dirname, '../dist/variables.css'), '--font-family-base');
});

test('variables.css contains spacing tokens', () => {
  assertContains(path.join(__dirname, '../dist/variables.css'), '--spacing-md');
});

// Test 3: JS exports are correct
test('index.js contains color-primary export', () => {
  assertContains(path.join(__dirname, '../dist/index.js'), 'export const color-primary');
});

test('index.js contains primary color value', () => {
  assertContains(path.join(__dirname, '../dist/index.js'), '"#667eea"');
});

test('index.js contains valid JavaScript', () => {
  const content = fs.readFileSync(path.join(__dirname, '../dist/index.js'), 'utf-8');
  try {
    assert(content.includes('export const '), 'No export statements found');
  } catch (err) {
    throw new Error(`Invalid JavaScript: ${err.message}`);
  }
});

// Test 4: JSON output is valid
test('tokens.json is valid JSON', () => {
  const content = fs.readFileSync(path.join(__dirname, '../dist/tokens.json'), 'utf-8');
  const json = JSON.parse(content);
  assert(typeof json === 'object', 'JSON is not an object');
});

test('tokens.json contains border-radius-sm', () => {
  const content = fs.readFileSync(path.join(__dirname, '../dist/tokens.json'), 'utf-8');
  const json = JSON.parse(content);
  assert(json['border-radius-sm'] === '6px', 'border-radius-sm value mismatch');
});

test('tokens.json contains color-primary', () => {
  const content = fs.readFileSync(path.join(__dirname, '../dist/tokens.json'), 'utf-8');
  const json = JSON.parse(content);
  assert(json['color-primary'] === '#667eea', 'color-primary value mismatch');
});

console.log('\n✓ All token tests passed.');
