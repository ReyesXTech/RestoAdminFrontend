import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListItemDto } from '../../../models';
import { OrderCardComponent } from '../order-card/order-card.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, OrderCardComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent {
  type = input.required<'pendientes' | 'listos'>();
  orders = input.required<OrderListItemDto[]>();
  loading = input<boolean>(false);
  previewEnabled = input<boolean>(false);
  currentTime = input<Date>(new Date());
  hidden = input<boolean>(false);

  viewOrder = output<OrderListItemDto>();
  markReady = output<string>();
  cancelOrder = output<OrderListItemDto>();
  restoreToPending = output<string>();

  // 🆕 Output para scroll
  scrollEvent = output<Event>();

  get listTitle(): string {
    return this.type() === 'pendientes' ? 'PENDIENTES' : 'LISTOS';
  }

  get listDescription(): string {
    return this.type() === 'pendientes'
      ? 'Ordenado por hora de entrega deseada'
      : 'Ordenado por hora de entrega';
  }

  onScroll(event: Event): void {
    this.scrollEvent.emit(event);
  }
}
