const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Contract: specs/001-umd-design-system/contracts/header-footer.md.
// HF_DIR lets the test be pointed at other files when checking the test itself.
const HF_DIR = process.env.HF_DIR || path.join(__dirname, '..', 'src', 'assets', 'header-footer');
const FILES = ['header_en.html', 'footer_en.html'];
const MAX_BYTES = 32 * 1024;

const LIB = 'https://www.lib.umd.edu';
const UTILITY_LINKS = [
  ['Locations & Hours', 'https://umd.libcal.com/hours'],
  ['System Status', `${LIB}/about/systems`],
  ['Get Help', 'https://umd.libanswers.com/'],
  ['Info For', `${LIB}/information`],
  ['Accounts', 'https://usmai-umcp.primo.exlibrisgroup.com/discovery/account?vid=01USMAI_UMCP:UMCP&section=overview&lang=en'],
  ['Search', `${LIB}/search/website`],
];
const NAV_LINKS = [
  ['Find, Borrow, Request', `${LIB}/find`],
  ['Visit and Study', `${LIB}/visit`],
  ['Research and Learning', `${LIB}/research`],
  ['Collections', `${LIB}/collections`],
  ['About', `${LIB}/about`],
];
const PRIMARY_DROPDOWNS = {
  'Find, Borrow, Request': [
    ['Find Materials', `${LIB}/find/materials`],
    ['Access Online Resources', `${LIB}/find/online`],
    ['Borrow and Return', `${LIB}/find/borrow`],
    ['Request Items for Pick Up or Delivery', `${LIB}/find/request`],
    ['Request Digital Copies or Duplication', `${LIB}/find/request-digital`],
    ['Request Onsite Access to Special Collections', `${LIB}/find/request-special-collections`],
    ['Suggest a Title for Purchase', `${LIB}/find/purchase`],
    ['Course Reserves', `${LIB}/find/reserves`],
    ['Interlibrary Loan', `${LIB}/find/ill`],
  ],
  'Visit and Study': [
    ['Our Libraries', `${LIB}/visit/libraries`],
    ['Find a Space', `${LIB}/visit/space`],
    ['Technology', `${LIB}/visit/tech`],
    ['Visit Special Collections', `${LIB}/visit/special`],
  ],
  'Research and Learning': [
    ['Meet Your Subject Specialist', `${LIB}/research/subject-specialist`],
    ['Research Services', `${LIB}/research/services`],
    ['Events & Workshops', `${LIB}/research/events`],
    ['Teaching and Instruction', `${LIB}/research/instruction`],
    ['Open Scholarship Services', `${LIB}/research/oss`],
    ['Data Services', `${LIB}/research/data`],
  ],
  Collections: [
    ['Collections Overview', `${LIB}/collections/overview`],
    ['Digital Collections and Repositories', `${LIB}/collections/digital`],
    ['Government Information', `${LIB}/collections/gov-info`],
    ['Special Collections', `${LIB}/collections/special`],
    ['University Archives', `${LIB}/collections/university-archives`],
  ],
  About: [
    ['Overview', `${LIB}/about/overview`],
    ['Contact Us', `${LIB}/about/contact`],
    ['Our Organization', `${LIB}/about/org`],
    ['Strategic Goals and Initiatives', `${LIB}/about/strategy`],
    ['Collaborations and Innovations', `${LIB}/about/collaborations`],
    ['Belonging & Community', `${LIB}/about/belonging`],
    ['Careers', `${LIB}/about/careers`],
    ['Awards', `${LIB}/about/awards`],
    ['Support the Libraries', `${LIB}/about/support`],
    ['Policies and Safety', `${LIB}/about/policies`],
    ['Events', 'https://umd.libcal.com/calendar/events'],
    ['Social Media', `${LIB}/social-media`],
    ['Systems Status', `${LIB}/about/systems`],
  ],
};
const UTILITY_DROPDOWNS = {
  'Locations & Hours': [
    ['All Libraries Hours', 'https://umd.libcal.com/hours'],
    ['Appointment Required', `${LIB}/visit/special/appointment`],
    ['Visit site for hours', 'https://shadygrove.umd.edu/library'],
  ],
  'System Status': [['All Status of Library Services', `${LIB}/about/systems`]],
  'Get Help': [
    ['Ask Us!', 'https://umd.libanswers.com/'],
    ['Chat With Us!', 'https://umd.libanswers.com/chat/widget/5cffd49b55d69387be9a6fa51e3c5fa59efa09ca025ffc7367db9b7d083f17ec?referer=https://www.lib.umd.edu/information'],
    ['Research Guides', 'https://lib.guides.umd.edu/'],
    ['Contact a Subject Specialist', 'https://lib.guides.umd.edu/SubjectSpecialists/BySubject'],
    ['Billing Inquiry', `${LIB}/find/borrow/billing/inquiry`],
    ['General Contacts', `${LIB}/about/contact`],
    ['Report a Problem', `${LIB}/about/contact/report`],
    ['Share Feedback', 'https://libumd.wufoo.com/forms/library-suggestions'],
  ],
  'Info For': [
    ['Undergraduate Students', `${LIB}/information/undergrads`],
    ['Graduate Students', `${LIB}/information/graduate-students`],
    ['Faculty and Instructors', `${LIB}/information/faculty`],
    ['People with Disabilities', `${LIB}/information/accessibility`],
    ['Visitors', `${LIB}/information/visitors`],
  ],
  Accounts: [
    ['My Account', 'https://usmai-umcp.primo.exlibrisgroup.com/discovery/account?vid=01USMAI_UMCP:UMCP&section=overview&lang=en'],
    ['Learn More', `${LIB}/find/borrow/books/account-help`],
    ['ILL Services Account', 'https://docdel.umd.edu/illiad/'],
    ['Special Collections Account', 'https://aeon.lib.umd.edu/'],
  ],
};
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
    className: attr(attrs, 'class'),
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

test('header and footer together are at most 32 KB', () => {
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

test('global banner matches the centered UMD wordmark and responsive heights', () => {
  const styles = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'styles', '_customized-theme.scss'), 'utf8');
  const banner = styles.slice(styles.indexOf('  .umd-global-bar {'), styles.indexOf('  .umd-header__main {'));
  assert.match(banner, /justify-content:\s*center;/);
  assert.match(banner, /align-items:\s*center;/);
  assert.match(banner, /height:\s*56px;/);
  assert.match(banner, /@media\s*\(min-width:\s*1100px\)\s*\{\s*\.umd-global-bar\s*\{\s*height:\s*44px;/);
  assert.match(banner, /font-family:\s*Crimson,\s*serif;/);
  assert.match(banner, /font-size:\s*14px;/);
  assert.match(banner, /font-weight:\s*400;/);
  assert.match(banner, /line-height:\s*1\.3;/);
  assert.match(banner, /text-transform:\s*uppercase;/);
  assert.match(banner, /letter-spacing:\s*1px;/);
  assert.match(banner, /text-decoration:\s*none;/);
  assert.match(banner, /:focus-visible\s*\{\s*outline:\s*var\(--focus-ring-on-dark\)/);
});

test('header logo links to lib.umd.edu with the Libraries home name', () => {
  const logo = links(read('header_en.html')).filter((l) => l.href === `${LIB}/`);
  assert.deepEqual(logo.map((l) => l.name), ['University of Maryland Libraries home']);
});

test('header has two right-side navigation rows with the expected links', () => {
  const navs = [...read('header_en.html').matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)];
  assert.equal(navs.length, 4, 'expected desktop and mobile utility and primary navigation');
  assert.equal(attr(navs[0][1], 'aria-label'), 'University Libraries utility');
  assert.deepEqual(links(navs[0][2]).filter((l) => l.className === 'umd-utility-nav__link').map((l) => [l.name, l.href]), UTILITY_LINKS);
  assert.equal(attr(navs[1][1], 'aria-label'), 'University Libraries');
  assert.deepEqual(links(navs[1][2]).filter((l) => l.className === 'umd-nav__link').map((l) => [l.name, l.href]), NAV_LINKS);
});

test('desktop primary navigation uses the 16px base text size', () => {
  const styles = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'styles', '_customized-theme.scss'), 'utf8');
  const tokens = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'styles', '_tokens.scss'), 'utf8');
  assert.match(styles, /\.umd-nav__link\s*\{[^}]*font-size:\s*var\(--text-base\);/);
  assert.match(tokens, /--text-base:\s*1rem;/);
});

test('small-screen navigation is grouped behind one native hamburger disclosure', () => {
  const html = read('header_en.html');
  const menu = /<details\b([^>]*class="umd-mobile-menu"[^>]*)>([\s\S]*?)<\/details>/i.exec(html);
  assert.ok(menu, 'expected one mobile hamburger disclosure');
  assert.equal(attr(menu[1], 'open'), undefined, 'mobile hamburger must start collapsed');
  assert.match(menu[2], /<summary\b[^>]*aria-label="[^"]*navigation menu/i);
  const mobileNavs = [...menu[2].matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)];
  assert.equal(mobileNavs.length, 2, 'hamburger should contain utility and primary navigation');
  assert.equal(attr(mobileNavs[0][1], 'aria-label'), 'University Libraries utility');
  assert.equal(attr(mobileNavs[1][1], 'aria-label'), 'University Libraries sections');
  const mobilePrimaryLinks = links(mobileNavs[1][2]).map((l) => [l.name, l.href]);
  for (const [label, href] of NAV_LINKS) assert.ok(mobilePrimaryLinks.some((l) => l[0] === label && l[1] === href), `mobile menu missing ${label}`);
  const mobileUtilityLinks = links(mobileNavs[0][2]).map((l) => [l.name, l.href]);
  for (const [label, href] of UTILITY_LINKS) assert.ok(mobileUtilityLinks.some((l) => l[0] === label && l[1] === href), `mobile menu missing ${label}`);
  for (const submenuLinks of Object.values(UTILITY_DROPDOWNS)) {
    for (const [label, href] of submenuLinks) {
      assert.ok(mobileUtilityLinks.some((l) => l[0] === label && l[1] === href), `mobile menu missing ${label}`);
    }
  }
  for (const submenuLinks of Object.values(PRIMARY_DROPDOWNS)) {
    for (const [label, href] of submenuLinks) {
      assert.ok(mobilePrimaryLinks.some((l) => l[0] === label && l[1] === href), `mobile menu missing ${label}`);
    }
  }
  const styles = fs.readFileSync(path.join(__dirname, '..', 'src', 'app', 'styles', '_customized-theme.scss'), 'utf8');
  assert.match(styles, /@media\s*\(max-width:\s*77\.5rem\)/, 'mobile navigation breakpoint must be 1240px');
  assert.match(styles, /\.umd-desktop-navigation\s*\{\s*display:\s*none;/, 'desktop rows must be hidden on mobile');
  assert.match(styles, /\.umd-mobile-menu\s*\{\s*display:\s*block;/, 'hamburger must be shown on mobile');
});

test('primary and utility navigation provide native, accessible dropdowns', () => {
  const navs = [...read('header_en.html').matchAll(/<nav\b([^>]*)>([\s\S]*?)<\/nav>/gi)];
  for (const [navIndex, expectedMenus] of [[0, UTILITY_DROPDOWNS], [1, PRIMARY_DROPDOWNS]]) {
    const dropdowns = [...navs[navIndex][2].matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)];
    assert.equal(dropdowns.length, Object.keys(expectedMenus).length, 'unexpected dropdown count');
    const actualMenus = dropdowns.map(([, inner]) => {
      const summary = /<summary\b([^>]*)>([\s\S]*?)<\/summary>/i.exec(inner);
      assert.ok(summary, 'dropdown has no native summary control');
      const label = attr(summary[1], 'aria-label');
      assert.ok(label, 'dropdown control has no accessible label');
      assert.match(label, /menu/i);
      return [label, links(inner).filter((link) => link.className === 'umd-menu__link').map((link) => [link.name, link.href])];
    });
    const expected = Object.entries(expectedMenus).map(([name, submenu]) => [`Open ${name} menu`, submenu]);
    assert.deepEqual(actualMenus, expected);
  }
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

test('img src values resolve under /nde/custom/<inst>-<view>/assets/', () => {
  const env = Object.fromEntries(
    fs.readFileSync(path.join(__dirname, '..', 'build-settings.env'), 'utf8')
      .split('\n').map((l) => l.match(/^\s*(\w+)\s*=\s*(.*?)\s*$/)).filter(Boolean).map((m) => [m[1], m[2]]));
  const prefix = `./custom/${env.INST_ID}-${env.VIEW_ID}/assets/`;
  for (const name of FILES) {
    for (const [, attrs] of read(name).matchAll(/<img\b([^>]*)>/gi)) {
      assert.ok(attr(attrs, 'src')?.startsWith(prefix), `${name}: img src "${attr(attrs, 'src')}" must start with ${prefix}`);
    }
  }
});
