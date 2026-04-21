import { Component, inject, signal, computed, effect, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ClipboardService } from '../../services/clipboard.service';
import { ToastService } from '../../services/toast.service';
import { TimeService } from '../../services/time.service';
import { OrderListItemDto, OrderDetailResponse, OrderStatus } from '../../models';
import { CancelledOrderDetailModalComponent } from '../../shared/components/order-modals/cancelled-order-detail-modal.component';
import { PendingReadyOrderDetailModalComponent } from '../../shared/components/order-modals/pending-ready-order-detail-modal.component';

interface OrderGroup {
  date: string;
  orders: OrderListItemDto[];
  count: number;
}

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
export class HistorialComponent implements OnInit, OnDestroy {
  private dataService = inject(DataService);
  private clipboardService = inject(ClipboardService);
  public toastService = inject(ToastService);
  private timeService = inject(TimeService);

  // Señales del servicio
  readonly historyOrders = this.dataService.historyOrders;
  readonly loading = this.dataService.historyLoading;
  readonly hasMore = this.dataService.historyHasMore;
  readonly currentTime = this.timeService.currentTime;

  // Enums para la plantilla
  readonly OrderStatus = OrderStatus;

  // Filtros
  searchTerm = signal('');
  searchStatus = signal<'all' | 'pendiente' | 'listo' | 'cancelado'>('all');
  searchStartDate = signal('');
  searchEndDate = signal('');

  // Señales para el tooltip de dirección
  addressTooltipVisible = signal(false);
  addressTooltipPosition = signal({ x: 0, y: 0 });
  currentTooltipAddress = signal('');

  // Debounce para búsqueda
  private searchSubject = new Subject<void>();
  private searchSubscription = this.searchSubject
    .pipe(debounceTime(400), distinctUntilChanged())
    .subscribe(() => this.applyFilters());

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
    // Fecha inicial: últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.searchStartDate.set(thirtyDaysAgo.toISOString().split('T')[0]);
    this.applyFilters();
  }

  ngOnDestroy(): void {
    this.toastService.clear();
    this.effectRef?.destroy();
    this.searchSubscription.unsubscribe();
  }

  toggleAddressTooltip(event: MouseEvent, address: string) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    this.addressTooltipPosition.set({ x, y });
    this.currentTooltipAddress.set(address);
    this.addressTooltipVisible.set(true);
  }

  closeAddressTooltip() {
    this.addressTooltipVisible.set(false);
  }

  /**
   * Agrupa los pedidos por fecha (solo presentación visual)
   */
  groupedOrders = computed(() => {
    const orders = this.historyOrders();
    const groupsMap = new Map<string, OrderListItemDto[]>();

    orders.forEach((order) => {
      const date = new Date(order.orderTimeUtc).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const existing = groupsMap.get(date) || [];
      existing.push(order);
      groupsMap.set(date, existing);
    });

    const groups: OrderGroup[] = [];
    for (const [date, ordersList] of groupsMap) {
      groups.push({ date, orders: ordersList, count: ordersList.length });
    }
    return groups;
  });

  /**
   * Aplica los filtros actuales y carga la primera página desde el backend
   */
  private applyFilters(): void {
    const statusMap: Record<string, OrderStatus | undefined> = {
      pendiente: OrderStatus.Pending,
      listo: OrderStatus.Ready,
      cancelado: OrderStatus.Cancelled,
      all: undefined,
    };

    const fromDate = this.searchStartDate()
      ? new Date(this.searchStartDate()).toISOString()
      : undefined;
    const toDate = this.searchEndDate() ? new Date(this.searchEndDate()).toISOString() : undefined;

    this.dataService.loadHistoryOrders({
      fromDate,
      toDate,
      searchTerm: this.searchTerm() || undefined,
      status: statusMap[this.searchStatus()],
    });
  }

  // Manejadores de eventos de filtros
  onSearchTermChange(): void {
    this.searchSubject.next();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onDateChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm.set('');
    this.searchStatus.set('all');
    this.searchStartDate.set('');
    this.searchEndDate.set('');
    this.applyFilters();
  }

  // Scroll infinito
  onContentScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 100;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < threshold;

    if (nearBottom && this.hasMore() && !this.loading()) {
      this.dataService.loadNextHistoryPage();
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

  isOrderCancelled(order: OrderDetailResponse): boolean {
    return order.status === OrderStatus.Cancelled;
  }

  copyPhone(phone: string): void {
    this.clipboardService.copyPhone(phone);
  }
}
