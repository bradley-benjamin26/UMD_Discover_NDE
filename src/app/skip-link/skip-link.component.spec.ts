import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SkipLinkComponent } from './skip-link.component';

// Contract: specs/007-skip-links/contracts/skip-link.md. Discover's <main> has no id, so the
// component gives the first <main> id "umd-main-content" at click time (unless it has one).
const MAIN_ID = 'umd-main-content';

describe('SkipLinkComponent', () => {
  let fixture: ComponentFixture<SkipLinkComponent> | undefined;
  let main: HTMLElement | null;

  function addMain(attrs: Record<string, string> = {}): HTMLElement {
    const el = document.createElement('main');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.innerHTML = '<p>main content</p>';
    document.body.appendChild(el);
    main = el;
    return el;
  }

  function create(): HTMLAnchorElement | null {
    fixture = TestBed.createComponent(SkipLinkComponent);
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('a.umd-skip-link');
  }

  function click(a: HTMLAnchorElement): MouseEvent {
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(ev);
    return ev;
  }

  beforeEach(() => {
    main = null;
    TestBed.configureTestingModule({ imports: [SkipLinkComponent] });
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = undefined;
    main?.remove();
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it('renders exactly one a.umd-skip-link "Skip to main content" with no aria-label', () => {
    addMain();
    create();
    const links = fixture!.nativeElement.querySelectorAll('a.umd-skip-link');
    expect(links.length).toBe(1);
    expect(links[0]?.textContent?.trim()).toBe('Skip to main content');
    expect(links[0]?.hasAttribute('aria-label')).toBeFalse();
  });

  it('has href "#umd-main-content"', () => {
    addMain();
    const a = create();
    expect(a?.getAttribute('href')).toBe('#' + MAIN_ID);
  });

  it('is visually hidden (1px, clipped) when not focused', () => {
    addMain();
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    const cs = getComputedStyle(a);
    expect(cs.width).toBe('1px');
    expect(cs.height).toBe('1px');
    expect(cs.overflow).toBe('hidden');
    expect(cs.clip !== 'auto' || cs.clipPath !== 'none').withContext('clip or clip-path set').toBeTrue();
  });

  it('is visible (wider than 1px) when focused', () => {
    addMain();
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    a.focus();
    expect(document.activeElement).toBe(a);
    expect(a.getBoundingClientRect().width).toBeGreaterThan(1);
    expect(a.getBoundingClientRect().height).toBeGreaterThan(1);
  });

  it('on click prevents default (URL unchanged) and focuses <main>', () => {
    const m = addMain();
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    const before = location.href;
    const ev = click(a);
    expect(ev.defaultPrevented).toBeTrue();
    expect(location.href).toBe(before);
    expect(document.activeElement).toBe(m);
  });

  it('gives a <main> without id the id "umd-main-content"', () => {
    const m = addMain();
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    click(a);
    expect(m.id).toBe(MAIN_ID);
  });

  it('keeps an existing <main> id and still focuses it', () => {
    const m = addMain({ id: 'existing' });
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    click(a);
    expect(m.id).toBe('existing');
    expect(document.activeElement).toBe(m);
  });

  it('adds tabindex="-1" to a <main> that is not focusable', () => {
    const m = addMain();
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    click(a);
    expect(m.getAttribute('tabindex')).toBe('-1');
  });

  it('leaves an existing tabindex="0" alone and still focuses <main>', () => {
    const m = addMain({ tabindex: '0' });
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    click(a);
    expect(m.getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(m);
  });

  it('with no <main>, click does nothing, throws nothing, and gives up after ~1 s', fakeAsync(() => {
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    const before = document.activeElement;
    let ev!: MouseEvent;
    expect(() => (ev = click(a))).not.toThrow();
    expect(ev.defaultPrevented).toBeTrue();
    tick(1100);
    expect(document.activeElement).toBe(before);
    // Retries have stopped: a <main> added now is not focused, and no frames remain queued
    // (fakeAsync errors at the end if a requestAnimationFrame retry is still pending).
    const m = addMain();
    tick(100);
    expect(document.activeElement).not.toBe(m);
    expect(document.activeElement).toBe(before);
  }));

  it('focuses a <main> that appears within the retry window', fakeAsync(() => {
    // A real click is a user interaction; the synthetic one is not, so say so for the autofocus poll.
    spyOnProperty(navigator, 'userActivation', 'get').and.returnValue({ hasBeenActive: true, isActive: true } as UserActivation);
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    click(a);
    tick(200);
    const m = addMain();
    tick(100);
    expect(document.activeElement).toBe(m);
    tick(1000);
  }));

  it('adds no document- or window-level listeners', () => {
    const docAdd = spyOn(document, 'addEventListener').and.callThrough();
    const winAdd = spyOn(window, 'addEventListener').and.callThrough();
    const m = addMain();
    const a = create();
    expect(a).withContext('a.umd-skip-link rendered').not.toBeNull();
    if (!a) return;
    click(a);
    expect(document.activeElement).toBe(m);
    fixture!.destroy();
    fixture = undefined;
    expect(docAdd).not.toHaveBeenCalled();
    expect(winAdd).not.toHaveBeenCalled();
  });

  describe('autofocus override (before first user interaction)', () => {
    let input: HTMLInputElement | null;
    let hasBeenActive: boolean;

    beforeEach(() => {
      input = null;
      hasBeenActive = false;
      spyOnProperty(navigator, 'userActivation', 'get').and.callFake(
        () => ({ hasBeenActive, isActive: false }) as UserActivation,
      );
    });

    afterEach(() => input?.remove());

    // Simulates NDE autofocusing its search box.
    function autofocusInput(): HTMLInputElement {
      input = document.createElement('input');
      document.body.appendChild(input);
      input.focus();
      return input;
    }

    function sentinel(): HTMLElement | null {
      return fixture!.nativeElement.querySelector('.umd-skip-start');
    }

    it('moves focus from an autofocused input to the start sentinel, right before the skip link', fakeAsync(() => {
      const a = create();
      tick(100);
      autofocusInput();
      tick(50);
      const s = sentinel();
      expect(s).withContext('.umd-skip-start rendered').not.toBeNull();
      expect(document.activeElement).toBe(s);
      // Next focusable element after the sentinel in document order is the skip link.
      const focusables = Array.from(
        document.querySelectorAll<HTMLElement>('a[href], input, button, [tabindex]:not([tabindex="-1"])'),
      );
      const after = focusables.find((el) => s!.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      expect(after).toBe(a!);
      tick(3000);
    }));

    it('re-parks focus on the sentinel when Discover blurs it within the window (record page)', fakeAsync(() => {
      create();
      autofocusInput();
      tick(50);
      expect(document.activeElement).toBe(sentinel());
      sentinel()!.blur();
      tick(50);
      expect(document.activeElement).toBe(sentinel());
      tick(3000);
    }));

    it('leaves focus on body when nothing was ever autofocused', fakeAsync(() => {
      create();
      tick(100);
      expect(document.activeElement).toBe(document.body);
      tick(3000);
    }));

    it('does not move focus after the user has interacted', fakeAsync(() => {
      create();
      hasBeenActive = true;
      const i = autofocusInput();
      tick(100);
      expect(document.activeElement).toBe(i);
      tick(3000);
    }));

    it('does not move focus after the ~3 s window', fakeAsync(() => {
      create();
      tick(3100);
      const i = autofocusInput();
      tick(100);
      expect(document.activeElement).toBe(i);
    }));

    it('cancels the poll on destroy (no pending frame)', fakeAsync(() => {
      create();
      tick(100);
      fixture!.destroy();
      fixture = undefined;
      const i = autofocusInput();
      tick(100);
      expect(document.activeElement).toBe(i);
    }));

    it('renders a text-less tabindex="-1" sentinel and still exactly one skip link', () => {
      create();
      const s = sentinel();
      expect(s).withContext('.umd-skip-start rendered').not.toBeNull();
      expect(s?.getAttribute('tabindex')).toBe('-1');
      expect(s?.textContent).toBe('');
      expect(fixture!.nativeElement.querySelectorAll('a.umd-skip-link').length).toBe(1);
    });
  });
});
