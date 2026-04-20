import { Currency, OrderStatus, AddressDto, PagedResult } from './common.models';

// ------------------- Crear pedido -------------------
export interface CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export interface CreateOrderCommand {
  clientName: string;
  phone: string;
  city: string;
  municipality: string;
  mainStreet: string;
  street1: string;
  street2?: string | null;
  houseNumber: string;
  apartmentNumber?: string | null;
  additionalInfo?: string | null;
  desiredDeliveryTimeUtc: string;
  items: CreateOrderItemDto[];
}

// ------------------- Obtener pedido por ID -------------------
export interface OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAmount: number;
  unitPriceCurrency: Currency;
  subtotalAmount: number;
  subtotalCurrency: Currency;
}

export interface OrderDetailResponse {
  id: string;
  customerId: string;
  clientName: string;
  phone: string;
  deliveryAddress: string; // string formateado
  items: OrderItemDto[];
  totalAmount: number;
  totalCurrency: Currency;
  status: OrderStatus; // enum numérico
  orderTimeUtc: string;
  desiredDeliveryTimeUtc: string;
  readyTimeUtc?: string | null;
  canceledTimeUtc?: string | null;
}

// ------------------- Lista paginada de pedidos -------------------
export interface GetOrdersQuery {
  page: number;
  pageSize: number;
  fromDate?: string;
  toDate?: string;
  searchTerm?: string;
  status?: OrderStatus;
  onlyTodayPendingReady?: boolean | null;
}

// Ahora OrderListItemDto incluye deliveryAddress e items
export interface OrderListItemDto {
  id: string;
  clientName: string;
  phone: string;
  deliveryAddress: string; // string formateado
  items: OrderItemDto[]; // misma estructura que en detalle
  totalAmount: number;
  totalCurrency: Currency;
  status: OrderStatus;
  orderTimeUtc: string;
  desiredDeliveryTimeUtc: string;
  readyTimeUtc?: string | null;
  canceledTimeUtc?: string | null;
}

// ------------------- Actualizar pedido -------------------
export interface UpdateOrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceAmount: number;
  unitPriceCurrency: Currency;
}

export interface UpdateOrderCommand {
  orderId: string;
  clientName: string;
  phone: string;
  deliveryAddress: AddressDto;
  desiredDeliveryTimeUtc: string;
  items: UpdateOrderItemDto[];
}

// ------------------- Comandos de estado -------------------
export interface CancelOrderCommand {
  orderId: string;
  reason?: string | null;
}

export interface RevertOrderToPendingCommand {
  orderId: string;
}

export enum OrderStatusAction {
  MarkAsReady = 0,
}

export interface UpdateOrderStatusCommand {
  orderId: string;
  action: OrderStatusAction;
}
