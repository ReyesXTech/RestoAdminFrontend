import { Component, inject, signal, effect, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { OrderListItemDto, OrderDetailResponse } from '../../models';
import { CancelledOrderDetailModalComponent } from '../../shared/components/order-modals/cancelled-order-detail-modal.component';

@Component({
  selector: 'app-cancelados',
  standalone: true,
  imports: [CommonModule, CancelledOrderDetailModalComponent],
  templateUrl: './cancelados.component.html',
  styleUrls: ['./cancelados.component.scss'],
})
export class CanceladosComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private clipboardService = inject(ClipboardService);
  public toastService = inject(ToastService);

  // Señales del servicio
  readonly cancelledOrders = this.dataService.cancelledOrders;
  readonly loading = this.dataService.cancelledLoading;
  readonly hasMore = this.dataService.cancelledHasMore;

  // Modal
  selectedOrder = signal<OrderDetailResponse | null>(null);

  // Toasts
  toasts = signal<ReturnType<typeof this.toastService.getToasts>>([]);
  private effectRef?: ReturnType<typeof effect>;

  constructor() {
    this.effectRef = effect(() => {
      this.toasts.set(this.toastService.getToasts());
    });
  }

  ngOnInit(): void {
    this.dataService.loadCancelledOrders();
  }

  ngOnDestroy(): void {
    this.toastService.clear();
    this.effectRef?.destroy();
  }

  // 🆕 Scroll infinito
  onContentScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold;

    if (nearBottom && this.hasMore() && !this.loading()) {
      this.dataService.loadNextCancelledPage();
    }
  }

  async viewOrder(order: OrderListItemDto): Promise<void> {
    try {
      const fullOrder = await this.dataService.getOrderById(order.id);
      this.selectedOrder.set(fullOrder);
    } catch {
      this.toastService.show('Error al cargar los detalles del pedido', 'error');
    }
  }

  closeDetail(): void {
    this.selectedOrder.set(null);
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
