import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListItemDto, OrderStatus } from '../../../models';
import { ClipboardService } from '../../../services/clipboard.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
})
export class OrderCardComponent {
  private clipboardService = inject(ClipboardService);

  order = input.required<OrderListItemDto>();
  previewEnabled = input<boolean>(false);
  showActions = input<boolean>(true);
  currentTime = input<Date>(new Date());
  orderType = input<'pendientes' | 'listos'>('pendientes');

  viewOrder = output<OrderListItemDto>();
  markReady = output<string>();
  cancelOrder = output<OrderListItemDto>();
  restoreToPending = output<string>();

  // Tooltip state
  activeTooltip = signal<string | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });

  // Exponer enum a la plantilla
  readonly OrderStatus = OrderStatus;

  showActionTooltip(event: MouseEvent, action: string): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    this.tooltipPosition.set({ x, y });
    this.activeTooltip.set(action);
  }

  hideActionTooltip(): void {
    this.activeTooltip.set(null);
  }

  get isUrgent(): boolean {
    const desired = this.order().desiredDeliveryTimeUtc;
    if (!desired) return false;
    const deliveryTime = new Date(desired);
    const now = this.currentTime();
    const diffMinutes = (deliveryTime.getTime() - now.getTime()) / 60000;
    return diffMinutes <= 15 && diffMinutes >= 0;
  }

  getAddressDisplay(): string {
    return this.order().deliveryAddress || '';
  }

  getDeliveryTimeDisplay(): string {
    const desired = this.order().desiredDeliveryTimeUtc;
    if (!desired) return 'No especificada';
    const date = new Date(desired);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  onViewOrder(): void {
    this.viewOrder.emit(this.order());
  }

  onMarkReady(): void {
    this.markReady.emit(this.order().id);
  }

  onCancelOrder(): void {
    this.cancelOrder.emit(this.order());
  }

  onRestoreToPending(): void {
    this.restoreToPending.emit(this.order().id);
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
