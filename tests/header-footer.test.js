const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Contract: specs/001-umd-design-system/contracts/header-footer.md.
// HF_DIR lets the test be pointed at other files when checking the test itself.
const HF_DIR = process.env.HF_DIR || path.join(__dirname, '..', 'src', 'assets', 'header-footer');
const FILES = ['header_en.html', 'footer_en.html'];
const MAX_BYTES = 20 * 1024;

const LIB = 'https://www.lib.umd.edu';
const NAV_LINKS = [
  ['Find, Borrow, Request', `${LIB}/find`],
  ['Research and Learning', `${LIB}/research`],
  ['Visit and Study', `${LIB}/visit`],
  ['Collections', `${LIB}/collections`],
  ['Info For', `${LIB}/information`],
  ['About', `${LIB}/about`],
];
const FOOTER_HEADINGS = ['Our Libraries', 'Library Information', 'Services & Support', 'Get Involved', 'Stay Connected'];
const SOCIAL_NAMES = ['Facebook', 'Instagram', 'YouTube'].map((s) => `University Libraries on ${s}`);
const BOTTOM_LINKS = ['Give Now', 'Privacy Policy', 'Web Accessibility'];

// shortcut: regex parsing of our own small hand-written files, not general HTML; swap for a parser if they grow.
const read = (name) => fs.readFileSync(path.join(HF_DIR, name), 'utf8');

function attr(attrs, name) {
  const m = attrs.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[1] ?? m[2]) : undefined;
}

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

// aria-label wins; otherwise text content plus img alt, skipping aria-hidden elements.
function accessibleName(innerHtml, attrs = '') {
  const label = attr(attrs, 'aria-label');
  if (label !== undefined) return label.replace(/\s+/g, ' ').trim();
  const text = innerHtml
    .replace(/<(\w+)\b[^>]*\saria-hidden\s*=\s*["']true["'][^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<img\b([^>]*)>/gi, (_, a) => (attr(a, 'aria-hidden') === 'true' ? ' ' : ` ${attr(a, 'alt') ?? ''} `))
    .replace(/<[^>]*>/g, ' ');
  return decode(text).replace(/\s+/g, ' ').trim();
}

function links(html) {
  return [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(([, attrs, inner]) => ({
    href: attr(attrs, 'href'),
    name: accessibleName(inner, attrs),
  }));
}

const count = (html, re) => (html.match(re) || []).length;

test('every href is absolute https:// or tel:', () => {
  for (const file of FILES) {
    const hrefs = [...read(file).matchAll(/\shref\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)].map((m) => m[1] ?? m[2]);
    const bad = hrefs.filter((h) => !/^(https:\/\/|tel:)/.test(h));
    assert.deepEqual(bad, [], `${file} has non-https, non-tel hrefs`);
  }
});

test('no script, inline event handler or button', () => {
  for (const file of FILES) {
    const html = read(file);
    assert.doesNotMatch(html, /<script\b/i, `${file} has <script>`);
    assert.doesNotMatch(html, /\son[a-z]+\s*=/i, `${file} has an inline event handler`);
    assert.doesNotMatch(html, /<button\b/i, `${file} has <button>`);
  }
});

test('no external stylesheet or font loading, no style attribute that hides content', () => {
  for (const file of FILES) {
    const html = read(file);
    assert.doesNotMatch(html, /<link\b/i, `${file} has <link>`);
    assert.doesNotMatch(html, /@import|@font-face/i, `${file} loads styles or fonts`);
    assert.doesNotMatch(html, /url\s*\(/i, `${file} has a url(...) reference`);
    for (const [, style] of html.matchAll(/\sstyle\s*=\s*["']([^"']*)["']/gi)) {
      assert.doesNotMatch(style, /display\s*:\s*none|visibility\s*:\s*hidden/i, `${file} hides content: ${style}`);
    }
  }
});

test('every img has alt, width and height', () => {
  for (const file of FILES) {
    for (const [tag, attrs] of read(file).matchAll(/<img\b([^>]*)>/gi)) {
      for (const a of ['alt', 'width', 'height']) {
        assert.notEqual(attr(attrs, a), undefined, `${file}: ${tag} has no ${a}`);
      }
    }
  }
});

test('no link opens a new tab', () => {
  for (const file of FILES) {
    assert.doesNotMatch(read(file), /\starget\s*=\s*["']_blank["']/i, `${file} has target="_blank"`);
  }
});

test('header and footer together are at most 20 KB', () => {
  const bytes = FILES.reduce((sum, f) => sum + fs.statSync(path.join(HF_DIR, f)).size, 0);
  assert.ok(bytes <= MAX_BYTES, `combined size ${bytes} bytes exceeds ${MAX_BYTES}`);
});

test('header has exactly one <header> landmark', () => {
  assert.equal(count(read('header_en.html'), /<header\b/gi), 1);
});

test('header global bar links "University of Maryland" to umd.edu', () => {
  const umd = links(read('header_en.html')).filter((l) => l.href === 'https://umd.edu/');
  assert.deepEqual(umd.map((l) => l.name), ['University of Maryland']);
});

test('header logo links to lib.umd.edu with the Libraries home name', () => {
  const logo = links(read('header_en.html')).filter((l) => l.href === `${LIB}/`);
  assert.deepEqual(logo.map((l) => l.name), ['University of Maryland Libraries home']);
});

test('header nav "University Libraries" has the six top-level links in order', () => {
  const navs = [...read('header_en.html').matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)].filter(
    ([, attrs]) => attr(attrs, 'aria-label') === 'University Libraries',
  );
  assert.equal(navs.length, 1, 'expected exactly one <nav aria-label="University Libraries">');
  assert.deepEqual(links(navs[0][2]).map((l) => [l.name, l.href]), NAV_LINKS);
});

test('footer has exactly one <footer> landmark', () => {
  assert.equal(count(read('footer_en.html'), /<footer\b/gi), 1);
});

test('footer link groups are <h2> headings each followed by a <ul>', () => {
  const html = read('footer_en.html');
  const headed = [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>\s*(<\w+)?/gi)].map(([, inner, next]) => ({
    name: accessibleName(inner),
    next: (next || '').toLowerCase(),
  }));
  for (const heading of FOOTER_HEADINGS) {
    const found = headed.filter((h) => h.name === heading);
    assert.equal(found.length, 1, `expected one <h2>${heading}</h2>`);
    assert.equal(found[0].next, '<ul', `<h2>${heading}</h2> is not followed by a <ul>`);
  }
});

test('footer phone link is tel:+13014050800', () => {
  const tel = links(read('footer_en.html')).filter((l) => /^tel:/.test(l.href ?? ''));
  assert.deepEqual(tel.map((l) => l.href), ['tel:+13014050800']);
});

test('footer social links have accessible names and aria-hidden icons', () => {
  const html = read('footer_en.html');
  const names = links(html).map((l) => l.name);
  for (const name of SOCIAL_NAMES) assert.ok(names.includes(name), `no link named "${name}"`);
  for (const [svg, attrs] of html.matchAll(/<svg\b([^>]*)>/gi)) {
    assert.equal(attr(attrs, 'aria-hidden'), 'true', `icon not aria-hidden: ${svg}`);
  }
});

test('footer bottom bar has Give Now, Privacy Policy, Web Accessibility and the copyright', () => {
  const html = read('footer_en.html');
  const names = links(html).map((l) => l.name);
  for (const name of BOTTOM_LINKS) assert.ok(names.includes(name), `no link named "${name}"`);
  assert.match(accessibleName(html), /© \d{4} University of Maryland/);
});
