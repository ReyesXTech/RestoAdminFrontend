import { Component, inject, input, output, signal } from '@angular/core';
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

  // Tooltip de dirección
  addressTooltipVisible = signal(false);
  addressTooltipPosition = signal({ x: 0, y: 0 });
  currentAddress = signal('');

  getWhatsAppLink(order: OrderDetailResponse): string {
    const phone = order.phone || '';
    const message = encodeURIComponent(
      `Hola ${order.clientName}, tu pedido de Rey Sushi está siendo procesado.`,
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  formatTime(dateString: string | null | undefined): string {
    if (!dateString) return '—';
    return this.timeService.formatTime(dateString);
  }

  onClose(): void {
    this.closeAddressTooltip();
    this.close.emit();
  }

  // Abrir tooltip de dirección
  toggleAddressTooltip(event: MouseEvent): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    this.addressTooltipPosition.set({ x, y });
    this.currentAddress.set(this.order()?.formattedDeliveryAddress || '');
    this.addressTooltipVisible.set(true);
  }

  closeAddressTooltip(): void {
    this.addressTooltipVisible.set(false);
  }
}
