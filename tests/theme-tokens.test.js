const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Contract: specs/001-umd-design-system/contracts/theme-tokens.md + data-model.md.
// Runs against the built bundle, so `npm run build` must run first (npm run test:assets does).
const CSS_PATH = path.join(__dirname, '..', 'dist', '01USMAI_UMCP-NDE', 'custom.css');
const FONTS_DIR = path.join(__dirname, '..', 'src', 'assets', 'fonts');

const COLOURS = {
  '--maryland-red': '#E21833',
  '--dark-red': '#A90007',
  '--maryland-yellow': '#FFD200',
  '--white': '#FFFFFF',
  '--black': '#000000',
  '--lightest-gray': '#FAFAFA',
  '--lighter-gray': '#F1F1F1',
  '--light-gray': '#E6E6E6',
  '--medium-gray': '#757575',
  '--dark-gray': '#454545',
  '--darker-gray': '#242424',
  '--green': '#037623',
};

const LENGTHS = {
  '--space-xs': '0.5rem',
  '--space-sm': '1rem',
  '--space-md': '1.5rem',
  '--space-lg': '2rem',
  '--space-xl': '3rem',
  '--space-2xl': '4rem',
  '--space-3xl': '7.5rem',
  '--text-sm': '0.875rem',
  '--text-base': '1rem',
  '--text-lg': '1.15rem',
  '--text-xl': '1.5rem',
  '--text-2xl': '2rem',
  '--text-3xl': '2.625rem',
  '--radius-sm': '0.125rem',
  '--radius-md': '1rem',
  '--radius-pill': '999rem',
  '--focus-offset': '2px',
};

const FOCUS = {
  '--focus-ring': '3px solid var(--darker-gray)',
  '--focus-ring-on-dark': '3px solid var(--maryland-yellow)',
};

// Families from data-model; heading/display are checked by their first (brand) family so a
// generic fallback may follow, body is the full stack the data model lists.
const FONTS = {
  '--font-heading': { first: 'Crimson Pro' },
  '--font-display': { first: 'Barlow Condensed' },
  '--font-body': { exact: ['Barlow', 'Helvetica', 'Arial', 'sans-serif'] },
};

const ALL_TOKENS = [...Object.keys(COLOURS), ...Object.keys(LENGTHS), ...Object.keys(FOCUS), ...Object.keys(FONTS)];

// Hard-coded from data-model.md "Allowed pairs"; a token name means its colour (focus rings resolve to their var()).
const ALLOWED_PAIRS = [
  ['--darker-gray', '--white', 4.5],
  ['--maryland-red', '--white', 4.5],
  ['--white', '--maryland-red', 4.5],
  ['--dark-red', '--white', 4.5],
  ['--medium-gray', '--white', 4.5],
  ['--white', '--black', 4.5],
  ['--green', '--white', 4.5],
  ['--focus-ring', '--white', 3],
  ['--focus-ring-on-dark', '--black', 3],
  ['--focus-ring-on-dark', '--maryland-red', 3],
];

const MATERIAL_PREFIXES = ['--mat-', '--mdc-', '--sys-'];
const COLOUR_LITERAL = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?)\(/i;

function readCss() {
  assert.ok(fs.existsSync(CSS_PATH), `built stylesheet missing at ${CSS_PATH}; run npm run build`);
  return fs.readFileSync(CSS_PATH, 'utf8');
}

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

// Every `prop: value` that ends a declaration (followed by ; or }), so `a:hover{` selectors are skipped.
function declarations(css) {
  return [...stripComments(css).matchAll(/([-\w]+)\s*:\s*([^;{}]+?)\s*(?=[;}])/g)].map((m) => ({ prop: m[1], value: m[2] }));
}

function tokenDeclarations(css, name) {
  return declarations(css).filter((d) => d.prop === name);
}

// Brace-matched `:root { ... }` blocks; returns the one(s) that declare --maryland-red.
function tokenBlocks(css) {
  const src = stripComments(css);
  const blocks = [];
  for (const m of src.matchAll(/:root\s*\{/g)) {
    let depth = 1;
    let i = m.index + m[0].length;
    while (depth && i < src.length) {
      if (src[i] === '{') depth++;
      if (src[i] === '}') depth--;
      i++;
    }
    const text = src.slice(m.index, i);
    if (/--maryland-red\s*:/.test(text)) blocks.push(text);
  }
  return blocks;
}

function normHex(value) {
  let hex = value.trim().toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(hex)) hex = '#' + [...hex.slice(1)].map((c) => c + c).join('');
  return hex;
}

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(normHex(hex).slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function tokenValue(css, name) {
  const decls = tokenDeclarations(css, name);
  assert.equal(decls.length, 1, `${name} must be declared exactly once (found ${decls.length})`);
  return decls[0].value;
}

function resolveColour(css, name) {
  const value = tokenValue(css, name);
  const ref = /var\((--[-\w]+)\)/.exec(value);
  return ref ? resolveColour(css, ref[1]) : value;
}

const families = (value) => value.split(',').map((f) => f.trim().replace(/^["']|["']$/g, ''));

test('theme tokens live in a single :root block', () => {
  assert.equal(tokenBlocks(readCss()).length, 1, 'expected exactly one :root block declaring --maryland-red');
});

test('every theme token is declared exactly once in the stylesheet', () => {
  const css = readCss();
  const counts = ALL_TOKENS.map((name) => [name, tokenDeclarations(css, name).length]);
  assert.deepEqual(counts.filter(([, n]) => n !== 1), [], 'tokens not declared exactly once ([name, count])');
});

test('colour tokens have the lib.umd.edu values', () => {
  const css = readCss();
  for (const [name, expected] of Object.entries(COLOURS)) {
    assert.equal(normHex(tokenValue(css, name)), normHex(expected), name);
  }
});

test('spacing, type-scale, radius and focus-offset tokens have their values', () => {
  const css = readCss();
  for (const [name, expected] of Object.entries(LENGTHS)) {
    const value = tokenValue(css, name);
    const unit = (v) => v.replace(/^[\d.]+/, '');
    assert.equal(parseFloat(value), parseFloat(expected), `${name}: ${value}`);
    assert.equal(unit(value), unit(expected), `${name} unit: ${value}`);
  }
});

test('focus ring tokens reference the token colours', () => {
  const css = readCss();
  for (const [name, expected] of Object.entries(FOCUS)) {
    assert.equal(tokenValue(css, name).replace(/\s+/g, ' '), expected, name);
  }
});

test('font family tokens name the brand families', () => {
  const css = readCss();
  for (const [name, spec] of Object.entries(FONTS)) {
    const list = families(tokenValue(css, name));
    if (spec.first) assert.equal(list[0], spec.first, name);
    if (spec.exact) assert.deepEqual(list, spec.exact, name);
  }
});

test('no colour literal outside the token block and Material-generated properties', () => {
  const css = readCss();
  const blocks = tokenBlocks(css);
  assert.equal(blocks.length, 1, 'token block not found, cannot check the rest of the file');
  const rest = stripComments(css).replace(blocks[0], '');
  const offenders = declarations(rest)
    .filter((d) => !MATERIAL_PREFIXES.some((p) => d.prop.startsWith(p)))
    .filter((d) => COLOUR_LITERAL.test(d.value))
    .map((d) => `${d.prop}: ${d.value}`);
  assert.deepEqual(offenders, [], 'colour literals outside the token block');
});

test('every allowed text/background pair meets its contrast minimum', () => {
  const css = readCss();
  const failures = ALLOWED_PAIRS.map(([fg, bg, min]) => {
    const ratio = contrast(resolveColour(css, fg), resolveColour(css, bg));
    return { pair: `${fg} on ${bg}`, ratio: Number(ratio.toFixed(2)), min };
  }).filter((r) => r.ratio < r.min);
  assert.deepEqual(failures, []);
});

test('@font-face rules load all local WOFF2 fonts with font-display: swap', () => {
  const css = stripComments(readCss());
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
  const expected = fs.readdirSync(FONTS_DIR).filter((f) => f.endsWith('.woff2')).sort();
  assert.equal(expected.length, 8, 'expected the 8 WOFF2 files from T003 in src/assets/fonts');
  const referenced = [];
  for (const face of faces) {
    assert.match(face, /font-display\s*:\s*swap/, `@font-face without font-display: swap: ${face}`);
    const src = /(?:^|;)\s*src\s*:([^;]+)/.exec(face);
    assert.ok(src, `@font-face without src: ${face}`);
    const urls = [...src[1].matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
    assert.ok(urls.length, `@font-face src has no url(): ${src[1]}`);
    for (const url of urls) {
      const local = /^(?:\.{0,2}\/)*assets\/fonts\/([^/]+\.woff2)$/.exec(url);
      assert.ok(local, `@font-face src is not a local assets/fonts/*.woff2: ${url}`);
      referenced.push(local[1]);
    }
  }
  assert.deepEqual([...new Set(referenced)].sort(), expected);
});

test('stylesheet contains no http:// or https:// reference', () => {
  const hits = readCss().match(/.{0,40}https?:\/\/.{0,40}/g) || [];
  assert.deepEqual(hits, []);
});

test('stylesheet is at most 60 KB', () => {
  const size = fs.statSync(CSS_PATH).size;
  assert.ok(size <= 60 * 1024, `custom.css is ${size} bytes`);
});
