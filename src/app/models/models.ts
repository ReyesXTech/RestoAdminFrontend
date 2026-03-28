// ==========================================
// MODELS / INTERFACES
// ==========================================
// Estas interfaces están diseñadas para coincidir con las entidades del backend .NET
// Cuando se migre a la API real, los tipos deberían ser compatibles sin cambios

// ==========================================
// ENUMS
// ==========================================

/**
 * Estados posibles de un pedido
 * Los valores coinciden con los que usará el backend
 */
export enum OrderStatus {
  Pendiente = 'pendiente',
  Listo = 'listo',
  Cancelado = 'cancelado'
}

/**
 * Categorías de productos del menú
 */
export enum ProductCategory {
  Comida = 'Comida',
  Bebida = 'Bebida',
  Postre = 'Postre',
  Otros = 'Otros'
}

/**
 * Roles de usuario en el sistema
 */
export enum UserRole {
  Admin = 'admin',
  Normal = 'normal'
}

// ==========================================
// INTERFACES PRINCIPALES
// ==========================================

/**
 * Representa un item dentro de un pedido
 * Se usa tanto para crear como para mostrar pedidos
 * 
 * NOTA: Para compatibilidad con el código existente, se mantienen
 * las propiedades 'name' y 'price'. Cuando se migre al backend,
 * se usará productId para obtener los datos del producto.
 */
export interface OrderItem {
  productId?: number;  // ID del producto (para backend)
  productName?: string; // Nombre del producto (para mostrar)
  name: string;         // Alias para compatibilidad (código existente)
  quantity: number;
  unitPrice?: number;   // Precio unitario (para backend, opcional para mock)
  price: number;        // Alias para compatibilidad (código existente)
  // NOTA: El subtotal se calcula como quantity * price (o quantity * unitPrice)
}

/**
 * Representa un pedido completo
 * Coincide con la entidad Order del backend
 */
export interface Order {
  id: number;
  customerId?: number;  // ID del cliente (para cuando se implemente gestión de clientes)
  clientName: string;   // Nombre del cliente (se mantiene por compatibilidad)
  address: string;
  phone?: string;
  email?: string;       // Email del cliente (opcional)
  
  items: OrderItem[];
  total: number;
  
  // Fechas y tiempos
  orderTime: string;           // Cuando se creó el pedido (ISO string)
  desiredDeliveryTime: string; // "inmediatamente" o hora específica (HH:mm)
  deliveryDateTime?: string;   // DateTime completo para entrega (opcional)
  receivedTime?: string;       // Cuando se recibió el pedido (backend)
  readyTime?: string;          // Cuando se marcó como listo (ISO string)
  
  // Estado
  status: OrderStatus | 'pendiente' | 'listo' | 'cancelado';
  isCanceled: boolean;         // Flag alternativo para estado cancelado
  
  // Metadata (solo lectura, se genera en backend)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Representa un producto del menú
 * Coincide con la entidad Product del backend
 */
export interface Product {
  id: number;
  name: string;
  description: string;
  ingredients: string;
  elaboracion?: string;      // Instrucciones de preparación (opcional)
  price: number;
  available: boolean;
  category: ProductCategory | 'Comida' | 'Bebida' | 'Postre' | 'Otros';
  imageUrl?: string;
  
  // Metadata (solo lectura, se genera en backend)
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Alias para compatibilidad con el código existente
 * MenuItem es lo mismo que Product
 */
export type MenuItem = Product;

/**
 * Representa un cliente
 * Para cuando se implemente la gestión de clientes en el backend
 */
export interface Customer {
  id: number;
  nombre: string;
  telefono: string;
  direccion: string;
  email?: string;
  createdAt?: string;
  
  // Pedidos asociados (solo para vistas detalladas, no se usa en listas)
  pedidos?: Order[];
}

/**
 * Representa un usuario del sistema
 * Coincide con la entidad User del backend
 */
export interface User {
  id: number;
  fullName: string;
  name?: string;  // Alias para compatibilidad con código existente
  email: string;
  phone: string;
  role: UserRole | 'admin' | 'normal';
  
  // Solo para creación/actualización (nunca se recibe del backend)
  password?: string;
  
  // Metadata (solo lectura, se genera en backend)
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

/**
 * Tasas de cambio de moneda
 */
export interface ExchangeRate {
  usd: number;
  eur: number;
  lastUpdated: string;
}

// ==========================================
// INTERFACES PARA PETICIONES AL BACKEND
// ==========================================

/**
 * DTO para crear un nuevo pedido
 * Se envía al endpoint POST /api/orders
 */
export interface CreateOrderRequest {
  customerId?: number;
  clientName: string;
  address: string;
  phone?: string;
  email?: string;
  items: {
    productId: number;
    quantity: number;
  }[];
  desiredDeliveryTime: string;
}

/**
 * DTO para actualizar el estado de un pedido
 * Se envía al endpoint PATCH /api/orders/{id}/status
 */
export interface UpdateOrderStatusRequest {
  status: OrderStatus | 'pendiente' | 'listo' | 'cancelado';
  readyTime?: string;
}

/**
 * DTO para crear/actualizar un producto
 * Se envía a POST /api/products o PUT /api/products/{id}
 */
export interface CreateProductRequest {
  name: string;
  description: string;
  ingredients: string;
  elaboracion?: string;
  price: number;
  available: boolean;
  category: ProductCategory | 'Comida' | 'Bebida' | 'Postre' | 'Otros';
  imageUrl?: string;
}

/**
 * DTO para login de usuarios
 * Se envía a POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta de login
 * Se recibe de POST /api/auth/login
 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: User;
  expiresAt: string;
}

/**
 * Respuesta paginada genérica
 * Para endpoints que devuelven listas paginadas
 */
export interface PagedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

/**
 * Respuesta de error del backend
 */
export interface ErrorResponse {
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}
