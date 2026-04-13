import { Injectable, signal } from '@angular/core';
import { Product, ProductCategory, Money } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private _menuItems = signal<Product[]>([
    {
      id: '1',
      name: 'Ensalada César',
      description: 'Lechuga romana, crutones, queso parmesano',
      detailedDescription: 'Ingredientes: lechuga, crutones, queso parmesano, salsa César',
      price: { amount: 8.5, currency: 'CUP' },
      category: ProductCategory.Ensaladas,
      isActive: true,
      imageUrl: 'assets/images/ensalada-cesar.jpg',
    },
    {
      id: '2',
      name: 'Pizza Margarita',
      description: 'Salsa de tomate, mozzarella, albahaca',
      detailedDescription: 'Masa artesanal, tomate, queso mozzarella, albahaca fresca',
      price: { amount: 12.0, currency: 'CUP' },
      category: ProductCategory.Pizza,
      isActive: true,
    },
    {
      id: '3',
      name: 'Spaghetti Carbonara',
      description: 'Pasta con salsa de huevo, queso, panceta',
      detailedDescription: 'Spaghetti, huevo, queso pecorino, panceta, pimienta',
      price: { amount: 14.0, currency: 'CUP' },
      category: ProductCategory.Pasta,
      isActive: true,
    },
    {
      id: '4',
      name: 'Spaghetti Carbonara',
      description: 'Pasta con salsa de huevo, queso, panceta',
      detailedDescription: 'Spaghetti, huevo, queso pecorino, panceta, pimienta',
      price: { amount: 14.0, currency: 'CUP' },
      category: ProductCategory.Pasta,
      isActive: true,
    },
    {
      id: '5',
      name: 'Spaghetti Carbonara',
      description: 'Pasta con salsa de huevo, queso, panceta',
      detailedDescription: 'Spaghetti, huevo, queso pecorino, panceta, pimienta',
      price: { amount: 14.0, currency: 'CUP' },
      category: ProductCategory.Pasta,
      isActive: true,
    },
    {
      id: '6',
      name: 'Spaghetti Carbonara',
      description: 'Pasta con salsa de huevo, queso, panceta',
      detailedDescription: 'Spaghetti, huevo, queso pecorino, panceta, pimienta',
      price: { amount: 14.0, currency: 'CUP' },
      category: ProductCategory.Pasta,
      isActive: true,
    },
    {
      id: '7',
      name: 'Spaghetti Carbonara',
      description: 'Pasta con salsa de huevo, queso, panceta',
      detailedDescription: 'Spaghetti, huevo, queso pecorino, panceta, pimienta',
      price: { amount: 14.0, currency: 'CUP' },
      category: ProductCategory.Pasta,
      isActive: true,
    },
  ]);

  readonly menuItems = this._menuItems.asReadonly();

  addMenuItem(item: Omit<Product, 'id'>): void {
    const newId = (Math.max(...this._menuItems().map((p) => Number(p.id)), 0) + 1).toString();
    this._menuItems.update((items) => [...items, { ...item, id: newId }]);
  }

  updateMenuItem(item: Product): void {
    this._menuItems.update((items) => items.map((p) => (p.id === item.id ? item : p)));
  }

  deleteMenuItem(id: string): void {
    this._menuItems.update((items) => items.filter((p) => p.id !== id));
  }
}
