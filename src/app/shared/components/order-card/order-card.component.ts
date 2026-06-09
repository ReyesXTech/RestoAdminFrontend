import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderListItemDto, OrderStatus } from '../../../models';
import { ClipboardService } from '../../../services/clipboard.service';
import { TooltipService } from '../../../services/tooltip.service';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
})
export class OrderCardComponent {
  private clipboardService = inject(ClipboardService);
  private tooltipService = inject(TooltipService);

  order = input.required<OrderListItemDto>();
  previewEnabled = input<boolean>(false);
  showActions = input<boolean>(true);
  currentTime = input<Date>(new Date());
  orderType = input<'pendientes' | 'listos'>('pendientes');

  viewOrder = output<OrderListItemDto>();
  markReady = output<string>();
  cancelOrder = output<OrderListItemDto>();
  restoreToPending = output<string>();
  editOrder = output<OrderListItemDto>();

  // Exponer enum a la plantilla
  readonly OrderStatus = OrderStatus;

  showActionTooltip(event: MouseEvent, action: string): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;

    let text = '';
    if (action === 'ready') text = 'Listo';
    else if (action === 'restore') text = 'Restaurar';
    else if (action === 'cancel') text = 'Cancelar';
    else if (action === 'edit') text = 'Editar';

    this.tooltipService.show(text, x, y);
  }

  hideActionTooltip(): void {
    this.tooltipService.hide();
  }

  get isUrgent(): boolean {
    const desired = this.order().desiredDeliveryTimeAtLocal;
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
    const desired = this.order().desiredDeliveryTimeAtLocal;
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
    this.tooltipService.hide();
  }

  onCancelOrder(): void {
    this.cancelOrder.emit(this.order());
    this.tooltipService.hide();
  }

  onRestoreToPending(): void {
    this.restoreToPending.emit(this.order().id);
    this.tooltipService.hide();
  }

  onEditOrder(): void {
    this.editOrder.emit(this.order());
    this.tooltipService.hide();
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
