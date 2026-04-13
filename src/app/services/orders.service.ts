import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus, CreateOrderRequest } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private _orders = signal<Order[]>([]);

  readonly orders = this._orders.asReadonly();

  constructor() {
    this._orders.set(this.createSampleOrders());
  }

  // Computed signals (filtros) – se mantienen similares pero usando nuevos campos
  readonly todayOrders = computed(() => {
    const today = new Date().toDateString();
    return this._orders().filter(
      (o) =>
        new Date(o.orderTimeUtc).toDateString() === today && o.status !== OrderStatus.Cancelled,
    );
  });

  readonly pendingOrders = computed(() => {
    const today = new Date().toDateString();
    return this._orders()
      .filter(
        (o) =>
          new Date(o.orderTimeUtc).toDateString() === today && o.status === OrderStatus.Pending,
      )
      .sort((a, b) => {
        // Ordenar por desiredDeliveryTimeUtc
        return (
          new Date(a.desiredDeliveryTimeUtc).getTime() -
          new Date(b.desiredDeliveryTimeUtc).getTime()
        );
      });
  });

  readonly listosOrders = computed(() => {
    const today = new Date().toDateString();
    return this._orders()
      .filter(
        (o) => new Date(o.orderTimeUtc).toDateString() === today && o.status === OrderStatus.Ready,
      )
      .sort((a, b) => {
        const deliveryCompare =
          new Date(a.desiredDeliveryTimeUtc).getTime() -
          new Date(b.desiredDeliveryTimeUtc).getTime();
        if (deliveryCompare !== 0) return deliveryCompare;
        const aReady = a.readyTimeUtc ? new Date(a.readyTimeUtc).getTime() : Infinity;
        const bReady = b.readyTimeUtc ? new Date(b.readyTimeUtc).getTime() : Infinity;
        return aReady - bReady;
      });
  });

  readonly cancelledOrders = computed(() =>
    this._orders().filter((o) => o.status === OrderStatus.Cancelled),
  );

  readonly historyOrders = computed(() => {
    const today = new Date().toDateString();
    return this._orders().filter((o) => new Date(o.orderTimeUtc).toDateString() !== today);
  });

  readonly totalOrders = computed(() => this._orders().length);
  readonly pendingOrdersCount = computed(() => this.pendingOrders().length);
  readonly listosOrdersCount = computed(() => this.listosOrders().length);
  readonly totalRevenue = computed(() =>
    this._orders()
      .filter((o) => o.status === OrderStatus.Ready)
      .reduce((sum, o) => sum + o.total, 0),
  );

  updateOrderStatus(id: string, status: OrderStatus, readyTimeUtc?: string): void {
    this._orders.update((orders) =>
      orders.map((o) =>
        o.id === id
          ? {
              ...o,
              status,
              readyTimeUtc:
                status === OrderStatus.Ready
                  ? readyTimeUtc || new Date().toISOString()
                  : o.readyTimeUtc,
              canceledTimeUtc:
                status === OrderStatus.Cancelled ? new Date().toISOString() : o.canceledTimeUtc,
            }
          : o,
      ),
    );
  }

  cancelOrder(id: string): void {
    this.updateOrderStatus(id, OrderStatus.Cancelled);
  }

  createOrder(orderData: CreateOrderRequest): void {
    const newId = (Math.max(...this._orders().map((o) => Number(o.id)), 0) + 1).toString();
    const total = orderData.items.reduce((sum, item) => sum + item.quantity * 10, 0); // Mock: precio ficticio
    const newOrder: Order = {
      id: newId,
      customerId: orderData.customerId,
      clientName: orderData.clientName,
      phone: orderData.phone,
      deliveryAddress: orderData.deliveryAddress,
      items: orderData.items.map((item) => ({
        productId: item.productId,
        productName: `Producto ${item.productId}`,
        quantity: item.quantity,
        unitPrice: 10,
      })),
      total,
      orderTimeUtc: new Date().toISOString(),
      desiredDeliveryTimeUtc: orderData.desiredDeliveryTimeUtc,
      status: OrderStatus.Pending,
    };
    this._orders.update((orders) => [...orders, newOrder]);
  }

  getOrderById(id: string): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  // Método auxiliar para crear datos de muestra (mock) – se ajusta a nuevo modelo
  private createSampleOrders(): Order[] {
    const now = new Date();
    const todayStr = now.toISOString();
    const hourLater = new Date(now.getTime() + 3600000).toISOString();
    // Funciones helper para generar horas relativas
    const hoursFromNow = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
    // ... (crear pedidos mock usando los nuevos campos)
    // Por brevedad, devolvemos un array vacío; en la implementación real puedes generar mocks válidos.
    return [
      {
        id: '1',
        clientName: 'Juan Perez',
        phone: '5551234',
        deliveryAddress: 'Av. Siempre Viva 123',
        items: [{ productId: '101', productName: 'Pizza Margarita', quantity: 1, unitPrice: 12 }],
        total: 12,
        orderTimeUtc: todayStr,
        desiredDeliveryTimeUtc: hourLater,
        status: OrderStatus.Pending,
      },
      // PENDIENTES (3)
      {
        id: 'ord-001',
        clientName: 'Juan Pérez',
        phone: '555-1234',
        deliveryAddress: 'Calle Falsa 123, Centro',
        items: [
          { productId: '1', productName: 'Ensalada César', quantity: 2, unitPrice: 8.5 },
          { productId: '2', productName: 'Pizza Margarita', quantity: 1, unitPrice: 12.0 },
        ],
        total: 29.0,
        orderTimeUtc: hoursAgo(0.5), // hace media hora
        desiredDeliveryTimeUtc: hoursFromNow(1.5),
        status: OrderStatus.Pending,
      },
      {
        id: 'ord-002',
        clientName: 'María González',
        phone: '555-5678',
        deliveryAddress: 'Av. Libertador 456, Planta Baja',
        items: [
          { productId: '3', productName: 'Spaghetti Carbonara', quantity: 1, unitPrice: 14.0 },
        ],
        total: 14.0,
        orderTimeUtc: hoursAgo(0.2),
        desiredDeliveryTimeUtc: hoursFromNow(2),
        status: OrderStatus.Pending,
      },
      {
        id: 'ord-003',
        clientName: 'Carlos Ruiz',
        phone: '555-9012',
        deliveryAddress: 'Edificio Torres, Apto 5B',
        items: [
          { productId: '1', productName: 'Ensalada César', quantity: 1, unitPrice: 8.5 },
          { productId: '3', productName: 'Spaghetti Carbonara', quantity: 2, unitPrice: 14.0 },
        ],
        total: 36.5,
        orderTimeUtc: hoursAgo(1),
        desiredDeliveryTimeUtc: hoursFromNow(0.5), // entrega pronta
        status: OrderStatus.Pending,
      },

      // LISTOS (2)
      {
        id: 'ord-004',
        clientName: 'Ana Martínez',
        phone: '555-3456',
        deliveryAddress: 'Calle del Sol 789',
        items: [{ productId: '2', productName: 'Pizza Margarita', quantity: 2, unitPrice: 12.0 }],
        total: 24.0,
        orderTimeUtc: hoursAgo(2),
        desiredDeliveryTimeUtc: hoursFromNow(-0.5), // ya pasó la hora deseada
        status: OrderStatus.Ready,
        readyTimeUtc: hoursAgo(0.5),
      },
      {
        id: 'ord-005',
        clientName: 'Pedro Sánchez',
        phone: '555-7890',
        deliveryAddress: 'Urbanización Los Pinos, Casa 12',
        items: [
          { productId: '1', productName: 'Ensalada César', quantity: 3, unitPrice: 8.5 },
          { productId: '2', productName: 'Pizza Margarita', quantity: 1, unitPrice: 12.0 },
        ],
        total: 37.5,
        orderTimeUtc: hoursAgo(3),
        desiredDeliveryTimeUtc: hoursFromNow(-1),
        status: OrderStatus.Ready,
        readyTimeUtc: hoursAgo(1.5),
      },

      // CANCELADOS (2)
      {
        id: 'ord-006',
        clientName: 'Lucía Fernández',
        phone: '555-1122',
        deliveryAddress: 'Barrio La Floresta, Calle 10',
        items: [
          { productId: '3', productName: 'Spaghetti Carbonara', quantity: 2, unitPrice: 14.0 },
        ],
        total: 28.0,
        orderTimeUtc: hoursAgo(5),
        desiredDeliveryTimeUtc: hoursFromNow(-2),
        status: OrderStatus.Cancelled,
        canceledTimeUtc: hoursAgo(3),
      },
      {
        id: 'ord-007',
        clientName: 'Roberto Díaz',
        phone: '555-3344',
        deliveryAddress: 'Centro Comercial Las Américas, Local 5',
        items: [
          { productId: '2', productName: 'Pizza Margarita', quantity: 1, unitPrice: 12.0 },
          { productId: '1', productName: 'Ensalada César', quantity: 1, unitPrice: 8.5 },
        ],
        total: 20.5,
        orderTimeUtc: hoursAgo(8),
        desiredDeliveryTimeUtc: hoursFromNow(-4),
        status: OrderStatus.Cancelled,
        canceledTimeUtc: hoursAgo(6),
      },

      // HISTÓRICO (de días anteriores, no aparecerá en "Hoy")
      {
        id: 'ord-008',
        clientName: 'Sofía Ramírez',
        phone: '555-5566',
        deliveryAddress: 'Av. Siempre Viva 742',
        items: [
          { productId: '3', productName: 'Spaghetti Carbonara', quantity: 1, unitPrice: 14.0 },
        ],
        total: 14.0,
        orderTimeUtc: new Date(now.getTime() - 86400000).toISOString(), // ayer
        desiredDeliveryTimeUtc: new Date(now.getTime() - 82800000).toISOString(),
        status: OrderStatus.Ready,
        readyTimeUtc: new Date(now.getTime() - 84000000).toISOString(),
      },
    ];
  }
}
