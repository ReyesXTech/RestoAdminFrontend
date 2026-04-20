// enums.model.ts

export enum Currency {
  CUP = 1,
  USD = 2,
  EUR = 3,
}

export enum OrderStatus {
  Pending = 1,
  Ready = 2,
  Cancelled = 3,
}

export enum ProductCategory {
  Ensaladas = 1,
  Sopas = 2,
  Pizza = 3,
  Pasta = 4,
  Arroces = 5,
  Hamburguesas = 6,
  Sandwiches = 7,
  Carnes = 8,
  Pescados = 9,
  Mariscos = 10,
  Sushi = 11,
  Salteados = 12,
  Guarniciones = 13,
  Postres = 14,
  Ron = 15,
  Whisky = 16,
  Vinos = 17,
  Cafés = 18,
  Té = 19,
  Otros = 20,
}

export enum UserRole {
  Admin = 1,
  Operator = 2,
}

// Value Objects (DTOs compartidos)
export interface AddressDto {
  city: string;
  municipality: string;
  mainStreet: string;
  street1: string;
  street2?: string | null;
  houseNumber: string;
  apartmentNumber?: string | null;
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
