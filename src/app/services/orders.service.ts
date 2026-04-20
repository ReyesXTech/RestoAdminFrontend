import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  OrderListItemDto,
  OrderDetailResponse,
  CancelOrderCommand,
  CreateOrderCommand,
} from '../models/order.models';
import { OrderStatus } from '../models';
import { PagedResult } from '../models/common.models';

interface PaginatedState {
  items: OrderListItemDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  hasMore: boolean;
}

const initialPaginatedState: PaginatedState = {
  items: [],
  totalCount: 0,
  currentPage: 0,
  pageSize: 50,
  loading: false,
  hasMore: true,
};

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Estados separados para cada tipo de lista
  private _pendingState = signal<PaginatedState>({ ...initialPaginatedState });
  private _readyState = signal<PaginatedState>({ ...initialPaginatedState });
  private _cancelledState = signal<PaginatedState>({ ...initialPaginatedState });
  private _historyState = signal<PaginatedState>({ ...initialPaginatedState });

  // Exposición de señales de solo lectura
  readonly pendingOrders = computed(() => this._pendingState().items);
  readonly pendingLoading = computed(() => this._pendingState().loading);
  readonly pendingHasMore = computed(() => this._pendingState().hasMore);

  readonly readyOrders = computed(() => this._readyState().items);
  readonly readyLoading = computed(() => this._readyState().loading);
  readonly readyHasMore = computed(() => this._readyState().hasMore);

  readonly cancelledOrders = computed(() => this._cancelledState().items);
  readonly cancelledLoading = computed(() => this._cancelledState().loading);
  readonly cancelledHasMore = computed(() => this._cancelledState().hasMore);

  readonly historyOrders = computed(() => this._historyState().items);
  readonly historyLoading = computed(() => this._historyState().loading);
  readonly historyHasMore = computed(() => this._historyState().hasMore);

  // Filtros actuales para poder cargar siguientes páginas
  private pendingFilters: any = {};
  private readyFilters: any = {};
  private cancelledFilters: any = {};
  private historyFilters: any = {};

  createOrder(command: CreateOrderCommand): Promise<string> {
    return firstValueFrom(this.http.post<string>(`${this.apiUrl}/orders`, command));
  }

  // ==================== MÉTODO GENÉRICO DE CARGA DE PÁGINA ====================
  private async loadPage(
    stateUpdater: (updater: (prev: PaginatedState) => PaginatedState) => void,
    filters: any,
    page: number,
    pageSize: number,
    additionalParams: any = {},
  ): Promise<void> {
    const allParams = { ...filters, ...additionalParams };
    const cleanParams = Object.fromEntries(
      Object.entries(allParams).filter(([_, value]) => value != null),
    );

    const params: any = {
      page,
      pageSize,
      ...cleanParams,
    };

    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<OrderListItemDto>>(`${this.apiUrl}/orders`, { params }),
      );

      // Normalizar status de string a número si es necesario
      const normalizedItems = result.items.map((item) => ({
        ...item,
        status:
          typeof item.status === 'string'
            ? OrderStatus[item.status as keyof typeof OrderStatus]
            : item.status,
      }));

      stateUpdater((prev) => {
        // ⚠️ ¡Aquí estaba el error! Usar normalizedItems en lugar de result.items
        const newItems = page === 1 ? normalizedItems : [...prev.items, ...normalizedItems];
        return {
          ...prev,
          items: newItems,
          totalCount: result.totalCount,
          currentPage: result.page,
          hasMore: result.page < result.totalPages,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error loading page', error);
      stateUpdater((prev) => ({ ...prev, loading: false }));
    }
  }

  private resetAndLoadFirstPage(
    stateSignal: any,
    stateUpdater: (updater: (prev: PaginatedState) => PaginatedState) => void,
    filters: any,
    additionalParams: any = {},
  ): void {
    stateUpdater(() => ({ ...initialPaginatedState, loading: true }));
    this.loadPage(stateUpdater, filters, 1, initialPaginatedState.pageSize, additionalParams);
  }

  private loadNextPageIfAvailable(
    state: PaginatedState,
    stateUpdater: (updater: (prev: PaginatedState) => PaginatedState) => void,
    filters: any,
    additionalParams: any = {},
  ): void {
    if (state.loading || !state.hasMore) return;
    stateUpdater((prev) => ({ ...prev, loading: true }));
    this.loadPage(stateUpdater, filters, state.currentPage + 1, state.pageSize, additionalParams);
  }

  // ==================== PENDIENTES ====================
  loadPendingOrders(): void {
    this.pendingFilters = { status: OrderStatus.Pending, onlyTodayPendingReady: true };
    this.resetAndLoadFirstPage(
      this._pendingState,
      (updater) => this._pendingState.update(updater),
      this.pendingFilters,
    );
  }

  loadNextPendingPage(): void {
    this.loadNextPageIfAvailable(
      this._pendingState(),
      (updater) => this._pendingState.update(updater),
      this.pendingFilters,
    );
  }

  // ==================== LISTOS ====================
  loadReadyOrders(): void {
    this.readyFilters = { status: OrderStatus.Ready, onlyTodayPendingReady: true };
    this.resetAndLoadFirstPage(
      this._readyState,
      (updater) => this._readyState.update(updater),
      this.readyFilters,
    );
  }

  loadNextReadyPage(): void {
    this.loadNextPageIfAvailable(
      this._readyState(),
      (updater) => this._readyState.update(updater),
      this.readyFilters,
    );
  }

  // ==================== CANCELADOS ====================
  loadCancelledOrders(): void {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.cancelledFilters = {
      status: OrderStatus.Cancelled,
      fromDate: thirtyDaysAgo.toISOString(),
    };
    this.resetAndLoadFirstPage(
      this._cancelledState,
      (updater) => this._cancelledState.update(updater),
      this.cancelledFilters,
    );
  }

  loadNextCancelledPage(): void {
    this.loadNextPageIfAvailable(
      this._cancelledState(),
      (updater) => this._cancelledState.update(updater),
      this.cancelledFilters,
    );
  }

  // ==================== HISTORIAL ====================
  loadHistoryOrders(filters: {
    fromDate?: string;
    toDate?: string;
    searchTerm?: string;
    status?: OrderStatus;
  }): void {
    this.historyFilters = { ...filters };
    this.resetAndLoadFirstPage(
      this._historyState,
      (updater) => this._historyState.update(updater),
      this.historyFilters,
    );
  }

  loadNextHistoryPage(): void {
    this.loadNextPageIfAvailable(
      this._historyState(),
      (updater) => this._historyState.update(updater),
      this.historyFilters,
    );
  }

  clearHistory(): void {
    this._historyState.set({ ...initialPaginatedState });
    this.historyFilters = {};
  }

  // ==================== DETALLE Y ACCIONES ====================
  async getOrderById(id: string): Promise<OrderDetailResponse> {
    const order = await firstValueFrom(
      this.http.get<OrderDetailResponse>(`${this.apiUrl}/orders/${id}`),
    );
    // Normalizar status de string a número si es necesario
    return {
      ...order,
      status:
        typeof order.status === 'string'
          ? OrderStatus[order.status as keyof typeof OrderStatus]
          : order.status,
    };
  }
  markAsReady(orderId: string): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`${this.apiUrl}/orders/${orderId}/ready`, {}));
  }

  revertToPending(orderId: string): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.apiUrl}/orders/${orderId}/revert-to-pending`, {}),
    );
  }

  cancelOrder(command: CancelOrderCommand): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.apiUrl}/orders/${command.orderId}/cancel`, command),
    );
  }
}
