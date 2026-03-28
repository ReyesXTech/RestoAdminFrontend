import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { Order } from '../../models/models';
import { CancelledOrderDetailModalComponent } from '../../shared/components/order-modals/cancelled-order-detail-modal.component';

@Component({
  selector: 'app-cancelados',
  standalone: true,
  imports: [CommonModule, CancelledOrderDetailModalComponent],
  templateUrl: './cancelados.component.html',
  styleUrls: ['./cancelados.component.scss'],
})
export class CanceladosComponent implements OnDestroy {
  private dataService = inject(DataService);
  private clipboardService = inject(ClipboardService);
  public toastService = inject(ToastService);

  // Local signal to track toasts for the template
  toasts = signal<ReturnType<typeof this.toastService.getToasts>>([]);
  private effectRef?: ReturnType<typeof effect>;

  constructor() {
    // Sync local toasts signal with service
    this.effectRef = effect(() => {
      this.toasts.set(this.toastService.getToasts());
    });
  }

  ngOnDestroy(): void {
    // Clear toasts when component is destroyed
    this.toastService.clear();
  }

  cancelledOrders = this.dataService.cancelledOrders;

  selectedOrder = signal<Order | null>(null);

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
