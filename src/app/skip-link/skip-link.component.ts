import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'custom-skip-link',
  standalone: true,
  template: `<span #start class="umd-skip-start" tabindex="-1"></span><a #link class="umd-skip-link" [href]="'#' + mainId" (click)="skip($event)">Skip to main content</a>`,
  styles: `
    .umd-skip-start { position: absolute; outline: none; }
    .umd-skip-link:not(:focus) {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
    .umd-skip-link:focus {
      position: fixed;
      top: var(--space-xs);
      left: var(--space-xs);
      z-index: 2147483647;
      background: var(--white);
      color: var(--darker-gray);
      font: var(--text-base)/1.25 var(--font-body);
      padding: var(--space-xs) var(--space-sm);
      outline: var(--focus-ring);
      outline-offset: var(--focus-offset);
    }
    @media (forced-colors: active) {
      .umd-skip-link:focus { outline-color: Highlight; }
    }
  `,
})
export class SkipLinkComponent implements OnInit, OnDestroy {
  readonly mainId = 'umd-main-content';
  @ViewChild('start', { static: true }) private start!: ElementRef<HTMLElement>;
  @ViewChild('link', { static: true }) private link!: ElementRef<HTMLElement>;
  private frame = 0;

  // Discover autofocuses its search box (sometimes late or more than once), so the first Tab would
  // skip us. Until the user interacts, park focus on the sentinel just before the link (~3 s window).
  ngOnInit(): void {
    if (!navigator.userActivation) return;
    const start = Date.now();
    let parked = false;
    const poll = (): void => {
      if (navigator.userActivation.hasBeenActive) return;
      const active = document.activeElement;
      const onBody = !active || active === document.body;
      // Once we have parked, a fall back to body (the record page blurs it) is re-parked too.
      if ((parked || !onBody) && active !== this.start.nativeElement && active !== this.link.nativeElement) {
        this.start.nativeElement.focus({ preventScroll: true });
        parked = true;
      }
      if (Date.now() - start < 3000) this.frame = requestAnimationFrame(poll);
    };
    this.frame = requestAnimationFrame(poll);
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frame);
  }

  // Discover renders <main> late and without an id, so look it up at click time and retry for ~1 s.
  skip(e: MouseEvent): void {
    e.preventDefault();
    const start = Date.now();
    const attempt = (): void => {
      const main = document.querySelector('main');
      if (!main) {
        if (Date.now() - start < 1000) requestAnimationFrame(attempt);
        return;
      }
      if (!main.id) main.id = this.mainId;
      if (!main.hasAttribute('tabindex')) main.setAttribute('tabindex', '-1');
      main.focus();
    };
    attempt();
  }
}
