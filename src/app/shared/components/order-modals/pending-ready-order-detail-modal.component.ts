import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../models/models';

@Component({
  selector: 'app-pending-ready-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pending-ready-order-detail-modal.component.html',
  styleUrls: ['./pending-ready-order-detail-modal.component.scss'],
})
export class PendingReadyOrderDetailModalComponent {
  // Inputs
  order = input.required<Order | null>();
  isUrgent = input<boolean>(false);

  // Outputs
  close = output<void>();

  getWhatsAppLink(order: Order): string {
    const phone = order.phone || '';
    const message = encodeURIComponent(
      `Hola ${order.clientName}, tu pedido de Rey Sushi está siendo procesado.`
    );
    return `https://wa.me/${phone}?text=${message}`;
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  onClose(): void {
    this.close.emit();
  }
}
