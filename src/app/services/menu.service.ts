import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateProductCommand,
  ProductResponse,
  GetProductsScrollQuery,
  UpdateProductCommand,
  DeleteProductCommand,
  ToggleProductStatusCommand,
  PagedResult,
  ProductCategory,
} from '../models';

interface PaginatedProductState {
  items: ProductResponse[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  hasMore: boolean;
}

const initialPaginatedState: PaginatedProductState = {
  items: [],
  totalCount: 0,
  currentPage: 0,
  pageSize: 50,
  loading: false,
  hasMore: true,
};

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _productsState = signal<PaginatedProductState>({ ...initialPaginatedState });
  readonly products = computed(() => this._productsState().items);
  readonly loading = computed(() => this._productsState().loading);
  readonly hasMore = computed(() => this._productsState().hasMore);
  readonly totalProducts = computed(() => this._productsState().totalCount);

  // Filtros actuales (para cargar siguientes páginas con los mismos filtros)
  private currentFilters: {
    searchTerm?: string;
    category?: ProductCategory;
    isActive?: boolean;
  } = {};

  private async loadPage(
    stateUpdater: (updater: (prev: PaginatedProductState) => PaginatedProductState) => void,
    filters: any,
    page: number,
    pageSize: number,
  ): Promise<void> {
    const params: any = { page, pageSize };
    if (filters.searchTerm) params.searchTerm = filters.searchTerm;
    if (filters.category) params.category = filters.category;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;

    try {
      const result = await firstValueFrom(
        this.http.get<PagedResult<ProductResponse>>(`${this.apiUrl}/products`, { params }),
      );
      stateUpdater((prev) => {
        const newItems = page === 1 ? result.items : [...prev.items, ...result.items];
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
      console.error('Error loading products page', error);
      stateUpdater((prev) => ({ ...prev, loading: false }));
    }
  }

  loadProducts(filters: {
    searchTerm?: string;
    category?: ProductCategory | 'all';
    isActive?: boolean;
  }): void {
    const apiFilters: any = {};
    if (filters.searchTerm) apiFilters.searchTerm = filters.searchTerm;
    if (filters.category && filters.category !== 'all') {
      apiFilters.category = filters.category;
    }
    if (filters.isActive !== undefined) apiFilters.isActive = filters.isActive;

    this.currentFilters = apiFilters;
    this._productsState.update(() => ({ ...initialPaginatedState, loading: true }));
    this.loadPage(
      (updater) => this._productsState.update(updater),
      this.currentFilters,
      1,
      initialPaginatedState.pageSize,
    );
  }

  loadNextPage(): void {
    const state = this._productsState();
    if (state.loading || !state.hasMore) return;
    this._productsState.update((prev) => ({ ...prev, loading: true }));
    this.loadPage(
      (updater) => this._productsState.update(updater),
      this.currentFilters,
      state.currentPage + 1,
      state.pageSize,
    );
  }

  clearProducts(): void {
    this._productsState.set({ ...initialPaginatedState });
    this.currentFilters = {};
  }

  getProductById(id: string): Promise<ProductResponse> {
    return firstValueFrom(this.http.get<ProductResponse>(`${this.apiUrl}/products/${id}`));
  }

  createProduct(command: CreateProductCommand): Promise<string> {
    return firstValueFrom(this.http.post<string>(`${this.apiUrl}/products`, command));
  }

  updateProduct(command: UpdateProductCommand): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.apiUrl}/products/${command.id}`, command));
  }

  deleteProduct(command: DeleteProductCommand): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/products/${command.id}`));
  }

  toggleProductStatus(command: ToggleProductStatusCommand): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.apiUrl}/products/${command.id}/status`, command),
    );
  }

  refreshCurrent(): void {
    // Vuelve a cargar la primera página con los filtros actuales
    this._productsState.update(() => ({ ...initialPaginatedState, loading: true }));
    this.loadPage(
      (updater) => this._productsState.update(updater),
      this.currentFilters,
      1,
      initialPaginatedState.pageSize,
    );
  }

  updateProductsLocal(updater: (items: ProductResponse[]) => ProductResponse[]): void {
    this._productsState.update((state) => ({
      ...state,
      items: updater(state.items),
    }));
  }
}
