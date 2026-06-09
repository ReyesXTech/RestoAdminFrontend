import { Component, inject, signal, effect, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { OrderListItemDto, OrderDetailResponse } from '../../models';
import { CancelledOrderDetailModalComponent } from '../../shared/components/order-modals/cancelled-order-detail-modal.component';
import { TooltipService } from '../../services/tooltip.service';

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
  private tooltipService = inject(TooltipService);
  public toastService = inject(ToastService);

  readonly cancelledOrders = this.dataService.cancelledOrders;
  readonly loading = this.dataService.cancelledLoading;
  readonly hasMore = this.dataService.cancelledHasMore;

  selectedOrder = signal<OrderDetailResponse | null>(null);
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

  // NUEVOS MÉTODOS
  async restoreOrder(orderId: string): Promise<void> {
    try {
      await this.dataService.revertToPending(orderId);
      this.toastService.show('Pedido restaurado a pendiente', 'success');
      // Recargar las listas afectadas (pendientes, listos, y los propios cancelados)
      this.dataService.loadPendingOrders();
      this.dataService.loadReadyOrders();
      this.dataService.loadCancelledOrders();
    } catch {
      this.toastService.show('Error al restaurar pedido', 'error');
    }
  }

  showTooltip(event: MouseEvent, text: string): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    this.tooltipService.show(text, x, y);
  }

  hideTooltip(): void {
    this.tooltipService.hide();
  }
}
