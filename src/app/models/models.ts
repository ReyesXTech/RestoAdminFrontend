// ==========================================
// MODELS / INTERFACES
// Alineadas con el backend .NET (RestoAdmin)
// ==========================================

// ==========================================
// ENUMS (coinciden con backend)
// ==========================================

export enum OrderStatus {
  Pending = 'pendiente',
  Ready = 'listo',
  Cancelled = 'cancelado',
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
  Admin = 'administrador',
  Operator = 'operario',
}

// ==========================================
// VALUE OBJECTS (simplificados para frontend)
// ==========================================

export interface Address {
  city: string;
  municipality: string;
  mainStreet: string;
  street1: string;
  street2?: string;
  houseNumber: string;
  apartmentNumber?: string;
  additionalInfo?: string;
}

export interface Money {
  amount: number;
  currency: 'CUP' | 'USD' | 'EUR';
}

// ==========================================
// ENTIDADES PRINCIPALES
// ==========================================

export interface OrderItem {
  productId: string; // GUID del backend (string) o ID numérico mock
  productName: string;
  quantity: number;
  unitPrice: number; // Precio unitario en la moneda del pedido

  // Alias para compatibilidad con código existente (usar productName y unitPrice)
  name?: string; // = productName
  price?: number; // = unitPrice
}

export interface Order {
  id: string;
  customerId?: string;
  clientName: string;
  phone?: string; // Número de teléfono normalizado
  deliveryAddress: Address | string; // Puede ser objeto o string plano (para mock)
  items: OrderItem[];
  total: number; // Suma de subtotales (quantity * unitPrice)
  orderTimeUtc: string; // ISO string (UTC)
  desiredDeliveryTimeUtc: string; // ISO string (UTC)
  readyTimeUtc?: string;
  canceledTimeUtc?: string;
  status: OrderStatus;
  // Metadata
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  defaultAddress: Address;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  imageUrl?: string;
  price: Money; // { amount, currency }
  category: ProductCategory;
  isActive: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface User {
  id: string;
  fullName: string;
  phone?: string; // Opcional según dominio
  role: UserRole;
  // Solo para creación/actualización (nunca se devuelve del backend)
  password?: string;
  // Metadata
  lastLoginUtc?: string;
  isActive: boolean;
  createdAtUtc?: string;
  updatedAtUtc?: string;
}

export interface ExchangeRate {
  usdToCup: number;
  eurToCup: number;
  lastUpdatedUtc: string;
}

// ==========================================
// DTOs PARA PETICIONES AL BACKEND
// ==========================================

export interface LoginRequest {
  fullName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAtUtc: string;
  user: User;
}

export interface CreateOrderRequest {
  customerId?: string;
  clientName: string;
  phone: string;
  deliveryAddress: Address;
  items: Array<{ productId: string; quantity: number }>;
  desiredDeliveryTimeUtc: string; // ISO string
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  readyTimeUtc?: string;
}

export interface CreateProductRequest {
  name: string;
  description: string;
  detailedDescription: string;
  imageUrl?: string;
  price: Money;
  category: ProductCategory;
  isActive: boolean;
}

export interface CreateUserRequest {
  fullName: string;
  phone?: string;
  role: UserRole;
  password: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  phone?: string;
  role?: UserRole;
  password?: string;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
