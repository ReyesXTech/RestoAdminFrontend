import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';
import { TimeService } from '../../services/time.service';
import { Order, OrderStatus } from '../../models/models';
import { PendingReadyOrderDetailModalComponent } from '../../shared/components/order-modals/pending-ready-order-detail-modal.component';
import { IsUrgentPipe } from '../../pipes/is-urgent.pipe';
import { OrderListComponent } from '../../shared/components/order-list/order-list.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    PendingReadyOrderDetailModalComponent,
    IsUrgentPipe,
    OrderListComponent,
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private clipboardService = inject(ClipboardService);
  public toastService = inject(ToastService);
  private themeService = inject(ThemeService);
  readonly currentTime = inject(TimeService).currentTime;

  // Usar directamente las signals computadas del DataService
  readonly pendientes = this.dataService.pendingOrders;
  readonly listos = this.dataService.listosOrders;
  readonly previewEnabled = this.themeService.previewEnabled;

  // View mode: 'both' | 'pendientes' | 'listos'
  viewMode = signal<'both' | 'pendientes' | 'listos'>('both');

  selectedOrder = signal<Order | null>(null);

  // Set view mode
  setViewMode(mode: 'both' | 'pendientes' | 'listos'): void {
    this.viewMode.set(mode);
  }

  ngOnInit(): void {
    // Clear toasts on init
    this.toastService.clear();
  }

  ngOnDestroy(): void {
    // Clear toasts when component is destroyed
    this.toastService.clear();
  }

  showCancelModal = signal(false);
  orderToCancel = signal<Order | null>(null);

  updateStatus(id: string, status: OrderStatus, confirm = false): void {
    // Handle restore from ready to pending (no confirmation needed)
    if (status === OrderStatus.Pending) {
      this.dataService.updateOrderStatus(id, OrderStatus.Pending);
      const current = this.selectedOrder();
      if (current && current.id === id) {
        this.selectedOrder.set({
          ...current,
          status: OrderStatus.Pending,
          readyTimeUtc: undefined,
        });
      }
      this.toastService.show('Pedido restaurado a pendientes', 'success');
      return;
    }

    // Handle cancellation (requires confirmation)
    if (confirm) {
      const order = this.dataService.orders().find((o) => o.id === id);
      if (order) {
        this.orderToCancel.set(order);
        this.showCancelModal.set(true);
      }
      return;
    }

    // Capture ready time when marking as ready
    const readyTimeUtc = status === OrderStatus.Ready ? new Date().toISOString() : undefined;
    this.dataService.updateOrderStatus(id, status, readyTimeUtc);

    const current = this.selectedOrder();
    if (current && current.id === id) {
      this.selectedOrder.set({ ...current, status, readyTimeUtc });
    }
  }

  confirmCancel(): void {
    const order = this.orderToCancel();
    if (order) {
      this.dataService.updateOrderStatus(order.id, OrderStatus.Cancelled);
      this.toastService.show('Pedido cancelado exitosamente', 'success');
      this.showCancelModal.set(false);
      this.orderToCancel.set(null);
    }
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.orderToCancel.set(null);
  }

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  // Methods for OrderListComponent
  onMarkReady(id: string): void {
    this.updateStatus(id, OrderStatus.Ready);
  }

  onCancelOrder(order: Order): void {
    this.orderToCancel.set(order);
    this.showCancelModal.set(true);
  }

  onRestoreToPending(id: string): void {
    this.updateStatus(id, OrderStatus.Pending);
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
