import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailResponse, OrderStatus } from '../../../models';
import { TimeService } from '../../../services/time.service';

@Component({
  selector: 'app-cancelled-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancelled-order-detail-modal.component.html',
  styleUrls: ['./cancelled-order-detail-modal.component.scss'],
})
export class CancelledOrderDetailModalComponent {
  private timeService = inject(TimeService);

  order = input.required<OrderDetailResponse | null>();
  showStrikethrough = input<boolean>(false);
  close = output<void>();

  readonly OrderStatus = OrderStatus;

  getWhatsAppLink(order: OrderDetailResponse): string {
    const phone = order.phone || '';
    const message = encodeURIComponent(
      `Hola ${order.clientName}, vimos que tu pedido fue cancelado. ¿Podemos ayudarte con algo más?`,
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  formatTime(dateString: string): string {
    return this.timeService.formatTime(dateString);
  }

  onClose(): void {
    this.close.emit();
  }
}
