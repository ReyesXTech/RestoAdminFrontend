import { Component, inject, input, output, signal } from '@angular/core';
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

  // Tooltip de dirección
  addressTooltipVisible = signal(false);
  addressTooltipPosition = signal({ x: 0, y: 0 });
  currentAddress = signal('');

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

  // Abrir tooltip de dirección
  toggleAddressTooltip(event: MouseEvent): void {
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    this.addressTooltipPosition.set({ x, y });
    this.currentAddress.set(this.order()?.deliveryAddress || '');
    this.addressTooltipVisible.set(true);
  }

  closeAddressTooltip(): void {
    this.addressTooltipVisible.set(false);
  }
}
