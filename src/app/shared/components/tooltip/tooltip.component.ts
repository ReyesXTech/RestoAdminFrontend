import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-global-tooltip',
  standalone: true,
  template: `
    <div class="global-tooltip" [class.visible]="visible" [style.left.px]="x" [style.top.px]="y">
      {{ text }}
    </div>
  `,
  styles: [
    `
      .global-tooltip {
        position: fixed;
        transform: translate(-50%, -100%);
        margin-top: -8px;
        background: #1f2937;
        color: white;
        font-size: 0.7rem;
        font-weight: 500;
        padding: 0.3rem 0.6rem;
        border-radius: 0.5rem;
        border: 1px #05265d solid;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition:
          opacity 0.15s,
          visibility 0.15s;
        pointer-events: none;
        z-index: 99999;
      }
      .global-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        border: 4px solid transparent;
        border-top-color: #1f2937;
      }
      .global-tooltip.visible {
        opacity: 1;
        visibility: visible;
      }
      :host-context([data-theme='dark']) .global-tooltip {
        background: #374151;
        border: 1px #031737 solid;
      }
      :host-context([data-theme='dark']) .global-tooltip::after {
        border-top-color: #0a2249;
      }
    `,
  ],
})
export class TooltipComponent {
  @Input() text: string = '';
  @Input() x: number = 0;
  @Input() y: number = 0;
  @Input() visible: boolean = false;
}
