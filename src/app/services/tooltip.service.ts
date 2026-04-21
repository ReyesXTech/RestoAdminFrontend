import {
  Injectable,
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
} from '@angular/core';
import { TooltipComponent } from '../shared/components/tooltip/tooltip.component'; // Lo crearemos después

@Injectable({ providedIn: 'root' })
export class TooltipService {
  private tooltipRef: ComponentRef<TooltipComponent> | null = null;

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
  ) {}

  show(text: string, x: number, y: number): void {
    if (!this.tooltipRef) {
      // Crear el componente dinámicamente
      this.tooltipRef = createComponent(TooltipComponent, {
        environmentInjector: this.injector,
        hostElement: document.body.appendChild(document.createElement('div')),
      });
      this.appRef.attachView(this.tooltipRef.hostView);
    }

    this.tooltipRef.setInput('text', text);
    this.tooltipRef.setInput('x', x);
    this.tooltipRef.setInput('y', y);
    this.tooltipRef.setInput('visible', true);
  }

  hide(): void {
    if (this.tooltipRef) {
      this.tooltipRef.setInput('visible', false);
    }
  }
}
