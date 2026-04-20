import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { OrdersService } from './orders.service';
import { MenuService } from './menu.service';
import { UsersService } from './users.service';
import { ExchangeService } from './exchange.service';
import { CustomersService } from './customers.service';
import { ImagesService } from './images.service';
import { ProductCategory, ProductResponse, Currency } from '../models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private menuService = inject(MenuService);
  private usersService = inject(UsersService);
  private exchangeService = inject(ExchangeService);
  private customersService = inject(CustomersService);
  private imagesService = inject(ImagesService);

  // ==================== AUTH ====================
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;

  login(fullName: string, password: string): Promise<boolean> {
    return this.authService.login({ fullName, password });
  }
  logout(): void {
    this.authService.logout();
  }

  // ==================== ORDERS ====================
  // Pendientes
  readonly pendingOrders = this.ordersService.pendingOrders;
  readonly pendingLoading = this.ordersService.pendingLoading;
  readonly pendingHasMore = this.ordersService.pendingHasMore;
  loadPendingOrders(): void {
    this.ordersService.loadPendingOrders();
  }
  loadNextPendingPage(): void {
    this.ordersService.loadNextPendingPage();
  }

  // Listos
  readonly listos = this.ordersService.readyOrders;
  readonly readyLoading = this.ordersService.readyLoading;
  readonly readyHasMore = this.ordersService.readyHasMore;
  loadReadyOrders(): void {
    this.ordersService.loadReadyOrders();
  }
  loadNextReadyPage(): void {
    this.ordersService.loadNextReadyPage();
  }

  // Cancelados
  readonly cancelledOrders = this.ordersService.cancelledOrders;
  readonly cancelledLoading = this.ordersService.cancelledLoading;
  readonly cancelledHasMore = this.ordersService.cancelledHasMore;
  loadCancelledOrders(): void {
    this.ordersService.loadCancelledOrders();
  }
  loadNextCancelledPage(): void {
    this.ordersService.loadNextCancelledPage();
  }

  // Historial
  readonly historyOrders = this.ordersService.historyOrders;
  readonly historyLoading = this.ordersService.historyLoading;
  readonly historyHasMore = this.ordersService.historyHasMore;
  loadHistoryOrders(filters: Parameters<OrdersService['loadHistoryOrders']>[0]): void {
    this.ordersService.loadHistoryOrders(filters);
  }
  loadNextHistoryPage(): void {
    this.ordersService.loadNextHistoryPage();
  }
  clearHistory(): void {
    this.ordersService.clearHistory();
  }

  // Acciones sobre pedidos
  async markAsReady(orderId: string): Promise<void> {
    await this.ordersService.markAsReady(orderId);
    this.loadPendingOrders();
    this.loadReadyOrders();
  }

  async revertToPending(orderId: string): Promise<void> {
    await this.ordersService.revertToPending(orderId);
    this.loadPendingOrders();
    this.loadReadyOrders();
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.ordersService.cancelOrder({ orderId });
    this.loadPendingOrders();
    this.loadReadyOrders();
    this.loadCancelledOrders();
  }

  updateLocalMenuItems(updater: (items: ProductResponse[]) => ProductResponse[]): void {
    this.menuService.updateProductsLocal(updater);
  }

  getOrderById(id: string) {
    return this.ordersService.getOrderById(id);
  }

  // ==================== PRODUCTS ====================
  readonly menuItems = this.menuService.products;
  readonly productsLoading = this.menuService.loading;
  readonly productsHasMore = this.menuService.hasMore;

  loadMenuItems(filters: Parameters<MenuService['loadProducts']>[0]): void {
    this.menuService.loadProducts(filters);
  }

  loadNextMenuPage(): void {
    this.menuService.loadNextPage();
  }

  refreshMenu(): void {
    // Recarga usando los filtros actuales almacenados en el servicio
    this.menuService.refreshCurrent();
  }

  addMenuItem(item: any): Promise<string> {
    return this.menuService.createProduct(item);
  }
  updateMenuItem(item: any): Promise<void> {
    return this.menuService.updateProduct(item);
  }
  deleteMenuItem(id: string): Promise<void> {
    return this.menuService.deleteProduct({ id });
  }

  // ==================== USERS ====================
  readonly users = this.usersService.users;
  loadUsers(): void {
    this.usersService.loadAllUsers();
  }
  addUser(user: any): Promise<string> {
    return this.usersService.createUser(user);
  }
  updateUser(user: any): Promise<void> {
    return this.usersService.updateUser(user);
  }
  deleteUser(id: string): Promise<void> {
    return this.usersService.deleteUser({ id });
  }

  // ==================== EXCHANGE ====================
  readonly exchangeRate = this.exchangeService.exchangeRate;
  updateExchangeRate(usd: number, eur: number): void {
    this.exchangeService.updateExchangeRate({ usdToCup: usd, eurToCup: eur });
  }
  loadExchangeRate(): void {
    this.exchangeService.loadExchangeRate();
  }

  // ==================== CUSTOMERS ====================
  readonly customers = this.customersService.customers;
  loadCustomers(): void {
    this.customersService.loadAllCustomers();
  }

  // ==================== IMAGES ====================
  uploadImage(file: File): Promise<string> {
    return this.imagesService.uploadImage(file);
  }
}
