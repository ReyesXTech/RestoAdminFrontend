import { Component, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { TimeService } from '../../services/time.service';
import { FormsModule } from '@angular/forms';
import { Order } from '../../models/models';
import { CancelledOrderDetailModalComponent } from '../../shared/components/order-modals/cancelled-order-detail-modal.component';
import { PendingReadyOrderDetailModalComponent } from '../../shared/components/order-modals/pending-ready-order-detail-modal.component';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CancelledOrderDetailModalComponent,
    PendingReadyOrderDetailModalComponent,
  ],
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.scss'],
})
export class HistorialComponent implements OnDestroy {
  private dataService = inject(DataService);
  private clipboardService = inject(ClipboardService);
  public toastService = inject(ToastService);
  private timeService = inject(TimeService);

  readonly currentTime = this.timeService.currentTime;

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

  searchTerm = signal('');
  searchStatus = signal<'all' | 'pendiente' | 'listo' | 'cancelado'>('all');
  searchStartDate = signal('');
  searchEndDate = signal('');

  filteredOrders = computed(() => {
    let orders = this.dataService.historyOrders();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Filter to include orders up to and including today
    orders = orders.filter((o) => new Date(o.orderTime) <= today);

    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      orders = orders.filter((o) => o.clientName.toLowerCase().includes(term));
    }

    if (this.searchStatus() !== 'all') {
      orders = orders.filter((o) => o.status === this.searchStatus());
    }

    if (this.searchStartDate()) {
      const startDate = new Date(this.searchStartDate());
      startDate.setHours(0, 0, 0, 0);
      orders = orders.filter((o) => new Date(o.orderTime) >= startDate);
    }

    if (this.searchEndDate()) {
      const endDate = new Date(this.searchEndDate());
      endDate.setHours(23, 59, 59, 999);
      orders = orders.filter((o) => new Date(o.orderTime) <= endDate);
    }

    return orders;
  });

  groupedOrders = computed(() => {
    const orders = this.filteredOrders();
    const groups: { date: string; orders: any[]; count: number }[] = [];

    orders.forEach((order) => {
      const date = new Date(order.orderTime).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      let group = groups.find((g) => g.date === date);
      if (!group) {
        group = { date, orders: [], count: 0 };
        groups.push(group);
      }
      group.orders.push(order);
      group.count++;
    });

    return groups;
  });

  clearFilters(): void {
    this.searchTerm.set('');
    this.searchStatus.set('all');
    this.searchStartDate.set('');
    this.searchEndDate.set('');
  }

  selectedOrder = signal<Order | null>(null);

  viewOrder(order: Order): void {
    this.selectedOrder.set(order);
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  isOrderCancelled(order: Order): boolean {
    return order.status === 'cancelado';
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }

  isToday(dateString: string): boolean {
    return this.timeService.isToday(dateString);
  }
}
