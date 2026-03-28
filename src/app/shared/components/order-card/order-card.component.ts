import { Component, input, output } from '@angular/core';
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
  // Inputs
  order = input.required<Order>();
  previewEnabled = input<boolean>(false);
  showActions = input<boolean>(true);
  currentTime = input<Date>(new Date());
  orderType = input<'pendientes' | 'listos'>('pendientes');

  // Outputs
  viewOrder = output<Order>();
  markReady = output<number>();
  cancelOrder = output<Order>();
  restoreToPending = output<number>();

  private clipboardService = new ClipboardService();

  get isUrgent(): boolean {
    return (
      this.order().desiredDeliveryTime === 'inmediatamente' ||
      this.calculateUrgency(this.order().desiredDeliveryTime, this.currentTime())
    );
  }

  private calculateUrgency(desiredDeliveryTime: string, now: Date): boolean {
    const [hours, minutes] = desiredDeliveryTime.split(':').map(Number);
    const deliveryTime = new Date(now);
    deliveryTime.setHours(hours, minutes);
    const diffMs = deliveryTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    return diffMinutes <= 15 && diffMinutes >= 0;
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
