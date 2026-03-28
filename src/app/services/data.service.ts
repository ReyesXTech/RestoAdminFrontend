// ==========================================
// DATA SERVICE
// ==========================================
// Servicio centralizado que actúa como fachada
// para los servicios especializados.
//
// NOTA: Este servicio ahora delega a los servicios especializados:
// - AuthService: Autenticación
// - OrdersService: Pedidos
// - MenuService: Productos/Menú
// - UsersService: Usuarios
// - ExchangeService: Tasas de cambio
//
// Los componentes deberían inyectar los servicios especializados directamente.
// Este servicio se mantiene para compatibilidad con el código existente.

import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { OrdersService } from './orders.service';
import { MenuService } from './menu.service';
import { UsersService } from './users.service';
import { ExchangeService } from './exchange.service';
import { Order, OrderStatus, MenuItem, User, ExchangeRate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class DataService {
  // ==========================================
  // SERVICIOS ESPECIALIZADOS
  // ==========================================
  private authService = inject(AuthService);
  private ordersService = inject(OrdersService);
  private menuService = inject(MenuService);
  private usersService = inject(UsersService);
  private exchangeService = inject(ExchangeService);

  // ==========================================
  // AUTENTICACIÓN (delegado a AuthService)
  // ==========================================
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly currentUser = this.authService.currentUser;

  login(email: string, pass: string): boolean {
    return this.authService.login(email, pass);
  }

  logout(): void {
    this.authService.logout();
  }

  // ==========================================
  // TASAS DE CAMBIO (delegado a ExchangeService)
  // ==========================================
  readonly exchangeRate = this.exchangeService.exchangeRate;

  updateExchangeRate(usd: number, eur: number): void {
    this.exchangeService.updateExchangeRate(usd, eur);
  }

  loadExchangeRate(): void {
    this.exchangeService.loadExchangeRate();
  }

  // ==========================================
  // PEDIDOS (delegado a OrdersService)
  // ==========================================
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

  updateOrderStatus(id: number, status: Order['status'], readyTime?: string): void {
    this.ordersService.updateOrderStatus(id, status, readyTime);
  }

  cancelOrder(id: number): void {
    this.ordersService.cancelOrder(id);
  }

  // ==========================================
  // MENÚ / PRODUCTOS (delegado a MenuService)
  // ==========================================
  readonly menuItems = this.menuService.menuItems;

  addMenuItem(item: Omit<MenuItem, 'id'>): void {
    this.menuService.addMenuItem(item);
  }

  updateMenuItem(item: MenuItem): void {
    this.menuService.updateMenuItem(item);
  }

  deleteMenuItem(id: number): void {
    this.menuService.deleteMenuItem(id);
  }

  // ==========================================
  // USUARIOS (delegado a UsersService)
  // ==========================================
  readonly users = this.usersService.users;

  addUser(user: Omit<User, 'id'>): void {
    this.usersService.addUser(user);
  }

  updateUser(user: User): void {
    this.usersService.updateUser(user);
  }

  deleteUser(id: number): void {
    this.usersService.deleteUser(id);
  }
}
