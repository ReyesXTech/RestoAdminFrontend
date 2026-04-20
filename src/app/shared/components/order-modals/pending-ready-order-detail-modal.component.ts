import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDetailResponse, OrderStatus } from '../../../models';
import { TimeService } from '../../../services/time.service';

@Component({
  selector: 'app-pending-ready-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-ready-order-detail-modal.component.html',
  styleUrls: ['./pending-ready-order-detail-modal.component.scss'],
})
export class PendingReadyOrderDetailModalComponent {
  private timeService = inject(TimeService);

  order = input.required<OrderDetailResponse | null>();
  isUrgent = input<boolean>(false);
  close = output<void>();

  readonly OrderStatus = OrderStatus;

  getWhatsAppLink(order: OrderDetailResponse): string {
    const phone = order.phone || '';
    const message = encodeURIComponent(
      `Hola ${order.clientName}, tu pedido de Rey Sushi está siendo procesado.`,
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  formatTime(dateString: string | null | undefined): string {
    if (!dateString) return '—'; // o '' si prefieres vacío
    return this.timeService.formatTime(dateString);
  }

  onClose(): void {
    this.close.emit();
  }
}
