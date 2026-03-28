// ==========================================
// MENU SERVICE
// ==========================================
// Servicio para gestión de menú/productos
// Endpoints relacionados:
// - GET /api/products (obtener todos)
// - GET /api/products/{id} (obtener uno)
// - POST /api/products (crear)
// - PUT /api/products/{id} (actualizar)
// - DELETE /api/products/{id} (eliminar)
// - GET /api/products?category=Comida&available=true (filtrar)

import { Injectable, signal } from '@angular/core';
import { MenuItem, ProductCategory } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  // Estado de productos del menú
  private _menuItems = signal<MenuItem[]>([
    {
      id: 1,
      name: 'Pizza Margarita',
      category: 'Comida',
      price: 12.0,
      available: true,
      description: 'Salsa de tomate, mozzarella y albahaca fresca.',
      ingredients: 'Tomate, mozzarella, albahaca',
    },
    {
      id: 2,
      name: 'Hamburguesa Clásica',
      category: 'Comida',
      price: 10.5,
      available: true,
      description: 'Carne de res, queso, lechuga, tomate y salsa especial.',
      ingredients: 'Carne de res, queso, lechuga, tomate',
    },
    {
      id: 3,
      name: 'Coca Cola',
      category: 'Bebida',
      price: 2.5,
      available: true,
      description: 'Refresco de cola de 500ml.',
      ingredients: 'Agua carbonatada, azúcar',
    },
    {
      id: 4,
      name: 'Tiramisú',
      category: 'Postre',
      price: 5.0,
      available: false,
      description: 'Postre italiano a base de café y mascarpone.',
      ingredients: 'Café, mascarpone, bizcochos',
    },
  ]);

  readonly menuItems = this._menuItems.asReadonly();

  /**
   * Agrega un nuevo producto al menú
   * MOCK: Reemplazar con llamada HTTP POST /api/products
   */
  addMenuItem(item: Omit<MenuItem, 'id'>): void {
    // FUTURO:
    // const request: CreateProductRequest = { ...item };
    // this.http.post<Product>(`${this.apiUrl}/products`, request).subscribe(newItem => {
    //   this._menuItems.update(items => [...items, newItem]);
    // });

    const newId = Math.max(...this._menuItems().map((m) => m.id), 0) + 1;
    this._menuItems.update((items) => [...items, { ...item, id: newId }]);
  }

  /**
   * Actualiza un producto existente
   * MOCK: Reemplazar con llamada HTTP PUT /api/products/{id}
   */
  updateMenuItem(item: MenuItem): void {
    // FUTURO:
    // this.http.put<Product>(`${this.apiUrl}/products/${item.id}`, item).subscribe(updated => {
    //   this._menuItems.update(items => items.map(m => m.id === item.id ? updated : m));
    // });

    this._menuItems.update((items) => items.map((m) => (m.id === item.id ? item : m)));
  }

  /**
   * Elimina un producto del menú
   * MOCK: Reemplazar con llamada HTTP DELETE /api/products/{id}
   */
  deleteMenuItem(id: number): void {
    // FUTURO:
    // this.http.delete(`${this.apiUrl}/products/${id}`).subscribe(() => {
    //   this._menuItems.update(items => items.filter(m => m.id !== id));
    // });

    this._menuItems.update((items) => items.filter((m) => m.id !== id));
  }

  /**
   * Obtiene un producto por ID
   */
  getMenuItemById(id: number): MenuItem | undefined {
    return this._menuItems().find((m) => m.id === id);
  }

  /**
   * Obtiene productos por categoría
   */
  getMenuItemsByCategory(category: ProductCategory): MenuItem[] {
    return this._menuItems().filter((m) => m.category === category);
  }

  /**
   * Obtiene productos disponibles
   */
  getAvailableMenuItems(): MenuItem[] {
    return this._menuItems().filter((m) => m.available);
  }
}
