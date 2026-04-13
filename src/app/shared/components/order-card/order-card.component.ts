import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../models/models';
import { ClipboardService } from '../../../services/clipboard.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
})
export class OrderCardComponent {
  order = input.required<Order>();
  previewEnabled = input<boolean>(false);
  showActions = input<boolean>(true);
  currentTime = input<Date>(new Date());
  orderType = input<'pendientes' | 'listos'>('pendientes');

  viewOrder = output<Order>();
  markReady = output<string>();
  cancelOrder = output<Order>();
  restoreToPending = output<string>();

  private clipboardService = new ClipboardService();

  // Tooltip state
  activeTooltip = signal<string | null>(null);
  tooltipPosition = signal({ x: 0, y: 0 });

  showActionTooltip(event: MouseEvent, action: string): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();

    // Posicionar el tooltip centrado sobre el botón (8px arriba)
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;

    this.tooltipPosition.set({ x, y });
    this.activeTooltip.set(action);
  }

  hideActionTooltip(): void {
    this.activeTooltip.set(null);
  }

  // Resto de métodos (isUrgent, getAddressDisplay, etc.) sin cambios...
  get isUrgent(): boolean {
    const desired = this.order().desiredDeliveryTimeUtc;
    if (!desired) return false;
    const deliveryTime = new Date(desired);
    const now = this.currentTime();
    const diffMinutes = (deliveryTime.getTime() - now.getTime()) / 60000;
    return diffMinutes <= 15 && diffMinutes >= 0;
  }

  getAddressDisplay(): string {
    const addr = this.order().deliveryAddress;
    if (typeof addr === 'string') return addr;
    if (addr && typeof addr === 'object') {
      const parts = [
        addr.mainStreet,
        addr.street1,
        addr.street2,
        addr.houseNumber,
        addr.apartmentNumber,
        addr.city,
        addr.municipality,
      ].filter((p) => p);
      return parts.join(', ');
    }
    return '';
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
