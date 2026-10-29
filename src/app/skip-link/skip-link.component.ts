import { Component } from '@angular/core';

@Component({
  selector: 'custom-skip-link',
  standalone: true,
  template: `<a class="umd-skip-link" [href]="'#' + mainId" (click)="skip($event)">Skip to main content</a>`,
  styles: `
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
export class SkipLinkComponent {
  readonly mainId = 'umd-main-content';

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
