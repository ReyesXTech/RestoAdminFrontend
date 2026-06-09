// enums.model.ts

export enum Currency {
  CUP = 1,
  USD = 2,
  EUR = 3,
}

export enum OrderStatus {
  Pendiente = 1,
  Listo = 2,
  Cancelado = 3,
}

export enum ProductCategory {
  // Entradas y ligeros
  Entrantes = 0,
  Ensaladas = 1,
  Sopas = 2,

  // Principales
  Pizzas = 3,
  Pastas = 4,
  Arroces = 5,
  Hamburguesas = 6,
  Sandwiches = 7,
  Carnes = 8,
  Pescados = 9,
  Mariscos = 10,
  Sushi = 11,
  Salteados = 12,
  Guarniciones = 13,

  // Postres
  Postres = 14,

  // Bebidas sin alcohol
  Refrescos = 15,
  Jugos = 16,
  Aguas = 17,
  Cafes = 18,
  Te = 19,

  // Bebidas alcohólicas
  Cervezas = 20,
  Vinos = 21,
  Licores = 22,
  Cocteles = 23,

  // Especiales
  Desayunos = 24,
  Infantil = 25,
  Vegetariano = 26,
  Vegano = 27,
  SinGluten = 28,
  Especialidades = 29,

  // Otros
  Otros = 30,
}

export enum UserRole {
  Admin = 1,
  Operador = 2,
}

// Value Objects (DTOs compartidos)
export interface AddressDto {
  city: string;
  municipality: string;
  street: string;
  additionalInfo?: string | null;
}

export interface MoneyDto {
  amount: number;
  currency: Currency;
}

// Paginación genérica
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
