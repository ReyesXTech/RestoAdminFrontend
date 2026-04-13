import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { OrdersService } from './orders.service';
import { MenuService } from './menu.service';
import { UsersService } from './users.service';
import { ExchangeService } from './exchange.service';
import { OrderStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private menuService = inject(MenuService);
  private usersService = inject(UsersService);
  private exchangeService = inject(ExchangeService);

  // Auth
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;
  login(fullName: string, password: string): boolean {
    return this.authService.login(fullName, password);
  }
  logout(): void {
    this.authService.logout();
  }

  // Orders
  readonly orders = this.ordersService.orders;
  readonly todayOrders = this.ordersService.todayOrders;
  readonly pendingOrders = this.ordersService.pendingOrders;
  readonly listosOrders = this.ordersService.listosOrders;
  readonly cancelledOrders = this.ordersService.cancelledOrders;
  readonly historyOrders = this.ordersService.historyOrders;
  readonly totalOrders = this.ordersService.totalOrders;
  readonly pendingOrdersCount = this.ordersService.pendingOrdersCount;
  readonly listosOrdersCount = this.ordersService.listosOrdersCount;
  readonly totalRevenue = this.ordersService.totalRevenue;
  updateOrderStatus(id: string, status: OrderStatus, readyTimeUtc?: string): void {
    this.ordersService.updateOrderStatus(id, status, readyTimeUtc);
  }
  cancelOrder(id: string): void {
    this.ordersService.cancelOrder(id);
  }

  // Menu
  readonly menuItems = this.menuService.menuItems;
  addMenuItem(item: any): void {
    this.menuService.addMenuItem(item);
  }
  updateMenuItem(item: any): void {
    this.menuService.updateMenuItem(item);
  }
  deleteMenuItem(id: string): void {
    this.menuService.deleteMenuItem(id);
  }

  // Users
  readonly users = this.usersService.users;
  addUser(user: any): void {
    this.usersService.addUser(user);
  }
  updateUser(user: any): void {
    this.usersService.updateUser(user);
  }
  deleteUser(id: string): void {
    this.usersService.deleteUser(id);
  }

  // Exchange
  readonly exchangeRate = this.exchangeService.exchangeRate;
  updateExchangeRate(usd: number, eur: number): void {
    this.exchangeService.updateExchangeRate(usd, eur);
  }
  loadExchangeRate(): void {
    this.exchangeService.loadExchangeRate();
  }
}
