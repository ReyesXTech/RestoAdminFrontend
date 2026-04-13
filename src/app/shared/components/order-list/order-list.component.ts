import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../models/models';
import { OrderCardComponent } from '../order-card/order-card.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderCardComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent {
  // Inputs
  type = input.required<'pendientes' | 'listos'>();
  orders = input.required<Order[]>();
  previewEnabled = input<boolean>(false);
  currentTime = input<Date>(new Date());
  hidden = input<boolean>(false);

  // Outputs
  viewOrder = output<Order>();
  markReady = output<string>();
  cancelOrder = output<Order>();
  restoreToPending = output<string>();

  get listTitle(): string {
    return this.type() === 'pendientes' ? 'PENDIENTES' : 'LISTOS';
  }

  get listDescription(): string {
    return this.type() === 'pendientes'
      ? 'Ordenado por hora de entrega deseada'
      : 'Ordenado por hora de entrega';
  }

  get iconSvg(): string {
    return this.type() === 'pendientes'
      ? 'pulse-dot' // CSS class for pending
      : 'list-icon'; // SVG icon for ready
  }
}
