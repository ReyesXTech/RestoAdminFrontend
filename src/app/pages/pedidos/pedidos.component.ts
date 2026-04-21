import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { ThemeService } from '../../services/theme.service';
import { TimeService } from '../../services/time.service';
import { OrderDetailResponse, OrderListItemDto } from '../../models';
import { PendingReadyOrderDetailModalComponent } from '../../shared/components/order-modals/pending-ready-order-detail-modal.component';
import { IsUrgentPipe } from '../../pipes/is-urgent.pipe';
import { OrderListComponent } from '../../shared/components/order-list/order-list.component';
import { CreateOrderModalComponent } from '../../shared/components/create-order-modal/create-order-modal.component';
import { EditOrderModalComponent } from '../../shared/components/edit-order-modal/edit-order-modal.component';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    PendingReadyOrderDetailModalComponent,
    IsUrgentPipe,
    OrderListComponent,
    CreateOrderModalComponent,
    EditOrderModalComponent,
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss'],
})
export class PedidosComponent implements OnInit, OnDestroy {
  public dataService = inject(DataService);
  private clipboardService = inject(ClipboardService);
  public toastService = inject(ToastService);
  private themeService = inject(ThemeService);
  readonly currentTime = inject(TimeService).currentTime;

  readonly pendientes = this.dataService.pendingOrders;
  readonly listos = this.dataService.listos;
  readonly previewEnabled = this.themeService.previewEnabled;

  viewMode = signal<'both' | 'pendientes' | 'listos'>('both');
  selectedOrder = signal<OrderDetailResponse | null>(null);
  showCancelModal = signal(false);
  orderToCancel = signal<OrderListItemDto | null>(null);
  showCreateModal = signal(false);
  showEditModal = signal(false);
  editingOrderId = signal<string | null>(null);

  openCreateModal() {
    this.showCreateModal.set(true);
  }
  closeCreateModal() {
    this.showCreateModal.set(false);
  }
  onOrderCreated() {
    this.closeCreateModal();
    this.loadOrders();
  }

  // 🆕 Manejar evento de editar
  onEditOrder(order: OrderListItemDto): void {
    this.editingOrderId.set(order.id);
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.editingOrderId.set(null);
  }

  onOrderUpdated(): void {
    this.closeEditModal();
    // Refrescar ambas listas
    this.dataService.loadPendingOrders();
    this.dataService.loadReadyOrders();
    this.toastService.show('Pedido actualizado exitosamente', 'success');
  }

  ngOnInit(): void {
    this.toastService.clear();
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.toastService.clear();
  }

  private loadOrders(): void {
    this.dataService.loadPendingOrders();
    this.dataService.loadReadyOrders();
  }

  setViewMode(mode: 'both' | 'pendientes' | 'listos'): void {
    this.viewMode.set(mode);
  }

  // 🆕 Manejar scroll infinito
  onListScroll(event: Event, type: 'pendientes' | 'listos'): void {
    const element = event.target as HTMLElement;
    const threshold = 100; // px antes del final
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold;

    if (!nearBottom) return;

    if (
      type === 'pendientes' &&
      this.dataService.pendingHasMore() &&
      !this.dataService.pendingLoading()
    ) {
      this.dataService.loadNextPendingPage();
    } else if (
      type === 'listos' &&
      this.dataService.readyHasMore() &&
      !this.dataService.readyLoading()
    ) {
      this.dataService.loadNextReadyPage();
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

  async onMarkReady(orderId: string): Promise<void> {
    try {
      await this.dataService.markAsReady(orderId);
      this.toastService.show('Pedido marcado como listo', 'success');
    } catch {
      this.toastService.show('Error al marcar como listo', 'error');
    }
  }

  async onRestoreToPending(orderId: string): Promise<void> {
    try {
      await this.dataService.revertToPending(orderId);
      this.toastService.show('Pedido restaurado a pendiente', 'success');
    } catch {
      this.toastService.show('Error al restaurar pedido', 'error');
    }
  }

  onCancelOrder(order: OrderListItemDto): void {
    this.orderToCancel.set(order);
    this.showCancelModal.set(true);
  }

  async confirmCancel(): Promise<void> {
    const order = this.orderToCancel();
    if (order) {
      try {
        await this.dataService.cancelOrder(order.id);
        this.toastService.show('Pedido cancelado exitosamente', 'success');
        this.closeCancelModal();
      } catch {
        this.toastService.show('Error al cancelar pedido', 'error');
      }
    }
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
    this.orderToCancel.set(null);
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
