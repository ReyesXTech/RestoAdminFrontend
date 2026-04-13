import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Order } from '../../../models/models';

@Component({
  selector: 'app-cancelled-order-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cancelled-order-detail-modal.component.html',
  styleUrls: ['./cancelled-order-detail-modal.component.scss'],
})
export class CancelledOrderDetailModalComponent {
  // Inputs
  order = input.required<Order | null>();
  showStrikethrough = input<boolean>(false);

  // Outputs
  close = output<void>();

  getWhatsAppLink(order: Order): string {
    const phone = order.phone || '';
    const message = encodeURIComponent(
      `Hola ${order.clientName}, vimos que tu pedido fue cancelado. ¿Podemos ayudarte con algo más?`,
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
