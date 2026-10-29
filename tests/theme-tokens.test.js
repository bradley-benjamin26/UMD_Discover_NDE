const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Contract: specs/001-umd-design-system/contracts/theme-tokens.md + data-model.md.
// Runs against the built bundle, so `npm run build` must run first (npm run test:assets does).
// THEME_CSS overrides the path (used to sanity-check the assertions against a hand-written stylesheet).
const CSS_PATH = process.env.THEME_CSS || path.join(__dirname, '..', 'dist', '01USMAI_UMCP-NDE', 'custom.css');
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
  '--font-body': { exact: ['Interstate', 'Helvetica', 'Arial', 'sans-serif'] },
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

test('@font-face rules load only approved local fonts with font-display: swap', () => {
  const css = stripComments(readCss());
  const faces = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => m[1]);
  const expected = [
    'BarlowCondensed-600.woff2',
    'BarlowCondensed-700italic.woff2',
    'CrimsonPro-400.woff2',
    'CrimsonPro-600.woff2',
    'CrimsonPro-700.woff2',
    'Interstate-400-500.otf',
    'Interstate-600-700.otf',
  ];
  for (const file of expected) assert.ok(fs.existsSync(path.join(FONTS_DIR, file)), `missing font asset: ${file}`);
  const fontBytes = expected.reduce((sum, file) => sum + fs.statSync(path.join(FONTS_DIR, file)).size, 0);
  assert.ok(fontBytes <= 160 * 1024, `font assets total ${fontBytes} bytes, exceeding 160 KB`);
  const referenced = [];
  for (const face of faces) {
    assert.match(face, /font-display\s*:\s*swap/, `@font-face without font-display: swap: ${face}`);
    const src = /(?:^|;)\s*src\s*:([^;]+)/.exec(face);
    assert.ok(src, `@font-face without src: ${face}`);
    const urls = [...src[1].matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
    assert.ok(urls.length, `@font-face src has no url(): ${src[1]}`);
    for (const url of urls) {
      const local = /^(?:\.{0,2}\/)*assets\/fonts\/([^/]+\.(?:woff2|otf))$/.exec(url);
      assert.ok(local, `@font-face src is not an approved local font asset: ${url}`);
      referenced.push(local[1]);
    }
  }
  assert.deepEqual([...new Set(referenced)].sort(), expected);
});

test('Interstate regular and semibold faces use the licensed local assets', () => {
  const faces = [...stripComments(readCss()).matchAll(/@font-face\s*\{([^}]*)\}/g)]
    .map((m) => m[1])
    .filter((face) => /font-family\s*:\s*["']?Interstate["']?/i.test(face));
  const interstate = faces.map((face) => ({
    weight: /font-weight\s*:\s*([^;]+)/.exec(face)?.[1].trim(),
    url: /url\(\s*["']?([^"')]+)["']?\s*\)/.exec(face)?.[1],
    format: /format\(\s*["']?([^"')]+)["']?\s*\)/.exec(face)?.[1],
  }));
  assert.deepEqual(interstate, [
    { weight: '400 500', url: 'assets/fonts/Interstate-400-500.otf', format: 'opentype' },
    { weight: '600 700', url: 'assets/fonts/Interstate-600-700.otf', format: 'opentype' },
  ]);
});

test('stylesheet contains no http:// or https:// reference', () => {
  const hits = readCss().match(/.{0,40}https?:\/\/.{0,40}/g) || [];
  assert.deepEqual(hits, []);
});

test('stylesheet is at most 60 KB', () => {
  const size = fs.statSync(CSS_PATH).size;
  assert.ok(size <= 60 * 1024, `custom.css is ${size} bytes`);
});

// ---- US2: component styles (data-model.md "Component styles"; selectors from research.md "Spike findings") ----

const PRIMARY_BUTTON = '.mat-mdc-unelevated-button.mat-primary';
const SECONDARY_BUTTON = '.mat-mdc-outlined-button';
const CHIP = '.selected-chip';
const CHIP_REMOVE = '.mat-mdc-chip-remove';
const TAGS = ['.record-type', '.record-indication'];
const CARD = '.search-result-item';
const CARD_TITLE = '.record-title';
const COMPONENTS = { 'primary button': PRIMARY_BUTTON, 'secondary button': SECONDARY_BUTTON, chip: CHIP, 'chip remove': CHIP_REMOVE, 'record-type tag': TAGS[0], 'indication tag': TAGS[1], card: CARD, 'card title link': CARD_TITLE };

// Style rules as { selectors: [...], media: '@media ... @media ...', decls: [{prop, value}] }; at-rule bodies are
// walked, not recorded. Assumes the built (flat, minified) CSS: no nested style rules, no braces in strings.
function styleRules(css) {
  const src = stripComments(css);
  const out = [];
  const stack = [];
  let buf = '';
  for (const ch of src) {
    if (ch === '{') {
      stack.push(buf.slice(buf.lastIndexOf(';') + 1).trim()); // drop any preceding `@charset ...;`
      buf = '';
    } else if (ch === '}') {
      const head = stack.pop() ?? '';
      if (head && !head.startsWith('@')) {
        // shortcut: splits on every comma, so `:is(a, b)` selectors split wrongly; fine for the selectors used here.
        out.push({ selectors: head.split(',').map((x) => x.trim()), media: stack.filter((h) => h.startsWith('@')).join(' '), decls: declarations(buf + ';') });
      }
      buf = '';
    } else {
      buf += ch;
    }
  }
  return out;
}

const rulesFor = (css, component, extra = '') => styleRules(css).filter((r) => r.selectors.some((x) => x.includes(component) && x.includes(extra)));

// px, or rem/em at 16px.
function toPx(value) {
  const m = /^([\d.]+)(px|rem|em)$/.exec(value.trim());
  return m ? parseFloat(m[1]) * (m[2] === 'px' ? 1 : 16) : NaN;
}

// Some rule for `component` (outside media queries) declares one of `props` with a value containing `want`.
function assertDeclares(css, label, component, props, want) {
  const found = rulesFor(css, component).filter((r) => !r.media).flatMap((r) => r.decls).filter((d) => props.includes(d.prop));
  assert.ok(found.some((d) => d.value.includes(want)), `${label} (${component}): expected one of ${props.join(' / ')} to use ${want}; found ${JSON.stringify(found)}`);
}

test('US2: chip remove control is at least 24x24 px', () => {
  const decls = rulesFor(readCss(), CHIP_REMOVE).flatMap((r) => r.decls);
  for (const prop of ['min-width', 'min-height']) {
    const sizes = decls.filter((d) => d.prop === prop).map((d) => toPx(d.value));
    assert.ok(sizes.some((px) => px >= 24), `${CHIP_REMOVE} needs ${prop} >= 24px; found ${JSON.stringify(sizes)}`);
  }
});

test('US2: buttons, chip, chip remove and card title link have a :focus-visible rule using --focus-ring', () => {
  const css = readCss();
  const missing = Object.entries({ 'primary button': PRIMARY_BUTTON, 'secondary button': SECONDARY_BUTTON, chip: CHIP, 'chip remove': CHIP_REMOVE, 'card title link': CARD_TITLE })
    .filter(([, sel]) => !rulesFor(css, sel, ':focus-visible').filter((r) => !r.media).flatMap((r) => r.decls)
      .some((d) => d.prop === 'outline' && d.value.includes('var(--focus-ring)')))
    .map(([label, sel]) => `${label} (${sel})`);
  assert.deepEqual(missing, [], 'no `<component>:focus-visible { outline: var(--focus-ring) }` rule');
});

test('US2: prefers-reduced-motion removes transitions on chips, buttons and cards', () => {
  // Ruling: a `.custom-nde-theme *` rule covers every component, so it is accepted alongside explicit selectors.
  const rules = styleRules(readCss()).filter((r) => r.media.includes('prefers-reduced-motion') && r.decls.some((d) => d.prop.startsWith('transition')));
  const covers = (sel) => rules.some((r) => r.selectors.some((x) => x.includes(sel) || /^\.custom-nde-theme \*$/.test(x)));
  const missing = [CHIP, '.mat-mdc-unelevated-button', SECONDARY_BUTTON, CARD].filter((sel) => !covers(sel));
  assert.deepEqual(missing, [], 'components without a reduced-motion transition rule');
});

test('US2: forced-colors block has explicit chip, button and card rules', () => {
  const css = readCss();
  const missing = [CHIP, CHIP_REMOVE, PRIMARY_BUTTON, SECONDARY_BUTTON, CARD]
    .filter((sel) => !rulesFor(css, sel).some((r) => r.media.includes('forced-colors')));
  assert.deepEqual(missing, [], 'components without a rule inside @media (forced-colors: active)');
});

test('US2: component rules exist and declare no colour literals', () => {
  const css = readCss();
  const problems = Object.entries(COMPONENTS).flatMap(([label, sel]) => {
    const rules = rulesFor(css, sel);
    if (!rules.length) return [`${label} (${sel}): no rules`];
    return rules.flatMap((r) => r.decls).filter((d) => COLOUR_LITERAL.test(d.value)).map((d) => `${label} (${sel}): ${d.prop}: ${d.value}`);
  });
  assert.deepEqual(problems, []);
});

// Accepted: the plain CSS property, or the Material 18 token Material itself reads for that slot.
test('US2: primary button fill is --maryland-red', () => {
  assertDeclares(readCss(), 'primary button', PRIMARY_BUTTON, ['background', 'background-color', '--mdc-filled-button-container-color'], 'var(--maryland-red)');
});

test('US2: secondary button text is --maryland-red', () => {
  assertDeclares(readCss(), 'secondary button', SECONDARY_BUTTON, ['color', '--mdc-outlined-button-label-text-color'], 'var(--maryland-red)');
});

test('US2: chip border is --medium-gray', () => {
  assertDeclares(readCss(), 'chip', CHIP, ['border', 'border-color', '--mdc-chip-outline-color'], 'var(--medium-gray)');
});

test('US2: result card border is --light-gray', () => {
  assertDeclares(readCss(), 'card', CARD, ['border', 'border-color'], 'var(--light-gray)');
});

test('US2: tags have a --lighter-gray background', () => {
  for (const sel of TAGS) assertDeclares(readCss(), 'tag', sel, ['background', 'background-color'], 'var(--lighter-gray)');
});

// ---- US2 T024 fixes: NDE focus/selected rules seen live (evidence.md "T024 — US2 manual checks") ----

// Specificity [ids, classes/attrs/pseudo-classes, types] of one complex selector.
// shortcut: :not()/:is() count as their argument only when it is a single simple selector; fine for the selectors used here.
function specificity(sel) {
  const s = sel.replace(/::[\w-]+/g, '').replace(/:(?:not|is)\(/g, '(');
  const ids = (s.match(/#[\w-]+/g) || []).length;
  const classes = (s.match(/\.[\w-]+|\[[^\]]*\]|:[\w-]+/g) || []).length;
  const types = (s.match(/(?:^|[\s>+~(])[a-z][\w-]*/gi) || []).length;
  return [ids, classes, types];
}
const beats = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

// Selectors (outside media queries) that match `component` + every `extra`, each with its rule's declarations.
function selectorsFor(css, component, extras = []) {
  return styleRules(css).filter((r) => !r.media).flatMap((r) => r.selectors.filter((x) => x.includes(component) && extras.every((e) => x.includes(e))).map((sel) => ({ sel, decls: r.decls })));
}

// The token a selector set declares for one of `props` (last wins), e.g. 'var(--dark-red)' -> '--dark-red'.
function declaredToken(found, props) {
  const d = found.flatMap((f) => f.decls).filter((x) => props.includes(x.prop)).pop();
  const m = d && /^var\((--[-\w]+)\)$/.exec(d.value);
  return m ? m[1] : undefined;
}

// Material paints a focus state layer over the button fill at 12% (--mat-sys-focus-state-layer-opacity): white on
// filled buttons (on-primary), NDE's M3 primary rgb(191, 0, 37) on outlined buttons. Measured live in T024.
const FOCUS_LAYER = { filled: '#FFFFFF', outlined: '#BF0025', opacity: 0.12 };
function blend(bg, layer, a) {
  const ch = (h, i) => parseInt(normHex(h).slice(i, i + 2), 16);
  return '#' + [1, 3, 5].map((i) => Math.round(ch(bg, i) * (1 - a) + ch(layer, i) * a).toString(16).padStart(2, '0')).join('');
}
const isAllowedPair = (fg, bg) => ALLOWED_PAIRS.some(([f, b, min]) => f === fg && b === bg && min === 4.5);

// NDE: .quick-filters-container[_ngcontent] .cdk-focused.cdk-keyboard-focused[_ngcontent] and
// .mdc-button.mat-mdc-unelevated-button.apply-filters-btn.cdk-keyboard-focused[_ngcontent] are both [0,5,0] and load after custom.css.
const NDE_KEYBOARD_FOCUS = [0, 5, 0];

for (const [label, component] of [['primary', PRIMARY_BUTTON], ['secondary', SECONDARY_BUTTON]]) {
  test(`US2 T024: ${label} button keyboard-focus ring uses --focus-ring and outranks NDE's .cdk-keyboard-focused rule`, () => {
    const found = selectorsFor(readCss(), component, ['.cdk-keyboard-focused'])
      .filter((f) => f.decls.some((d) => d.prop === 'outline' && d.value.includes('var(--focus-ring)')));
    assert.ok(found.some((f) => beats(specificity(f.sel), NDE_KEYBOARD_FOCUS) > 0),
      `need a ${component}.cdk-keyboard-focused rule with outline: var(--focus-ring) and specificity > ${NDE_KEYBOARD_FOCUS}; found ${JSON.stringify(found.map((f) => [f.sel, specificity(f.sel)]))}`);
  });
}

test('US2 T024: primary button focus fill keeps white text >= 4.5 under Material focus layer', () => {
  const css = readCss();
  const fill = declaredToken(selectorsFor(css, PRIMARY_BUTTON, ['.cdk-focused']), ['--mdc-filled-button-container-color', 'background-color']);
  assert.ok(fill, `no ${PRIMARY_BUTTON}.cdk-focused fill token`);
  const ratio = contrast(resolveColour(css, '--white'), blend(resolveColour(css, fill), FOCUS_LAYER.filled, FOCUS_LAYER.opacity));
  assert.ok(ratio >= 4.5, `white on ${fill} + focus layer = ${ratio.toFixed(2)}`);
});

test('US2 T024: secondary button focus text >= 4.5 under Material focus layer', () => {
  const css = readCss();
  const found = selectorsFor(css, SECONDARY_BUTTON, ['.cdk-focused']);
  const text = declaredToken(found, ['color', '--mdc-outlined-button-label-text-color']);
  const bg = declaredToken(found, ['background-color', 'background']);
  assert.ok(text && bg, `no ${SECONDARY_BUTTON}.cdk-focused text/background tokens: ${text} / ${bg}`);
  const ratio = contrast(resolveColour(css, text), blend(resolveColour(css, bg), FOCUS_LAYER.outlined, FOCUS_LAYER.opacity));
  assert.ok(ratio >= 4.5, `${text} on ${bg} + focus layer = ${ratio.toFixed(2)}`);
});

test('US2 T024: selected quick filter uses an allowed pair and outranks NDE .quick-filter-btn-active', () => {
  const css = readCss();
  // NDE: .quick-filter-btn-active.mdc-button[_ngcontent] [0,3,0] sets the pink background.
  const found = selectorsFor(css, '.quick-filter-btn-active').filter((f) => beats(specificity(f.sel), [0, 3, 0]) > 0);
  const text = declaredToken(found, ['color', '--mdc-outlined-button-label-text-color']);
  const bg = declaredToken(found, ['background-color', 'background']);
  assert.ok(text && bg && isAllowedPair(text, bg), `selected quick filter text/background ${text} / ${bg} is not an allowed pair`);
  const focused = contrast(resolveColour(css, text), blend(resolveColour(css, bg), FOCUS_LAYER.outlined, FOCUS_LAYER.opacity));
  assert.ok(focused >= 4.5, `selected + focus layer = ${focused.toFixed(2)}`);
});

test('US2 T024: chip has a single --medium-gray border that outranks NDE selectable-chip border', () => {
  const css = readCss();
  // NDE: .mat-mdc-standard-chip.mdc-evolution-chip--selectable:not(.mdc-evolution-chip--with-primary-icon) [0,4,0] border: 1px solid var(--sys-primary).
  const found = selectorsFor(css, CHIP).filter((f) => beats(specificity(f.sel), [0, 4, 0]) > 0);
  assert.equal(declaredToken(found, ['border-color']), '--medium-gray', `no ${CHIP} border-color: var(--medium-gray) above [0,4,0]`);
  const inner = selectorsFor(css, CHIP).flatMap((f) => f.decls).filter((d) => ['--mdc-chip-outline-width', '--mdc-chip-flat-selected-outline-width'].includes(d.prop));
  assert.ok(inner.length && inner.every((d) => d.value === '0'), `Material's inner chip outline must be 0 (single border); found ${JSON.stringify(inner)}`);
});

test('US2 T024: menu item links use an allowed pair on the menu surface', () => {
  const css = readCss();
  const link = selectorsFor(css, 'a.mat-mdc-menu-item').filter((f) => beats(specificity(f.sel), [0, 1, 1]) > 0); // .custom-nde-theme a
  const text = declaredToken(link, ['color']);
  const bg = declaredToken(selectorsFor(css, '.mat-mdc-menu-panel'), ['--mat-menu-container-color', 'background-color']);
  assert.ok(text && bg && isAllowedPair(text, bg), `menu link text/background ${text} / ${bg} is not an allowed pair`);
});

test('T025: home quick-link tiles (link colour on --sys-inverse-on-surface) use an allowed pair', () => {
  const css = readCss();
  // NDE: .main-landing-page .menu-container .menu li a { background-color: var(--sys-inverse-on-surface) }; the text is our
  // .custom-nde-theme a colour. The generated M3 value (#ffedeb) gives --maryland-red 4.2:1, so the role must be a token.
  const root = selectorsFor(css, '.custom-nde-theme').filter((f) => f.sel === '.custom-nde-theme');
  const bg = declaredToken(root, ['--sys-inverse-on-surface']);
  const text = declaredToken(selectorsFor(css, '.custom-nde-theme a').filter((f) => f.sel === '.custom-nde-theme a'), ['color']);
  assert.ok(text && bg && isAllowedPair(text, bg), `link text on --sys-inverse-on-surface: ${text} / ${bg} is not an allowed pair`);
});
