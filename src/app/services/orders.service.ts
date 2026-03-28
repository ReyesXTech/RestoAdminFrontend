// ==========================================
// ORDERS SERVICE
// ==========================================
// Servicio para gestión de pedidos
// Endpoints relacionados:
// - GET /api/orders (todos los pedidos)
// - GET /api/orders?status=pendiente (filtrar por estado)
// - GET /api/orders/{id} (pedido específico)
// - POST /api/orders (crear pedido)
// - PATCH /api/orders/{id}/status (actualizar estado)
// - DELETE /api/orders/{id} (cancelar pedido)

import { Injectable, signal, computed } from '@angular/core';
import { Order, OrderStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  // Estado de pedidos
  private _orders = signal<Order[]>([]);
  readonly orders = this._orders.asReadonly();

  constructor() {
    // Initialize orders with sample data (MOCK)
    // FUTURO: this.loadOrders()
    this._orders.set(this.createSampleOrders());
  }

  // ==========================================
  // SIGNALS COMPUTADAS - FILTROS DE PEDIDOS
  // ==========================================

  readonly todayOrders = computed(() => {
    // FUTURO: GET /api/orders?date=today&status!=cancelado
    const today = new Date().toDateString();
    return this._orders().filter(
      (o) => new Date(o.orderTime).toDateString() === today && o.status !== 'cancelado',
    );
  });

  readonly pendingOrders = computed(() => {
    // FUTURO: GET /api/orders?status=pendiente&date=today
    const today = new Date().toDateString();
    return this._orders()
      .filter((o) => new Date(o.orderTime).toDateString() === today && o.status === 'pendiente')
      .sort((a, b) => {
        const deliveryCompare = this.compareDeliveryTime(
          a.desiredDeliveryTime,
          b.desiredDeliveryTime,
        );
        if (deliveryCompare !== 0) return deliveryCompare;
        return new Date(a.orderTime).getTime() - new Date(b.orderTime).getTime();
      });
  });

  readonly listosOrders = computed(() => {
    // FUTURO: GET /api/orders?status=listo&date=today
    const today = new Date().toDateString();
    return this._orders()
      .filter((o) => new Date(o.orderTime).toDateString() === today && o.status === 'listo')
      .sort((a, b) => {
        const deliveryCompare = this.compareDeliveryTime(
          a.desiredDeliveryTime,
          b.desiredDeliveryTime,
        );
        if (deliveryCompare !== 0) return deliveryCompare;
        const aReadyTime = a.readyTime ? new Date(a.readyTime).getTime() : Infinity;
        const bReadyTime = b.readyTime ? new Date(b.readyTime).getTime() : Infinity;
        return aReadyTime - bReadyTime;
      });
  });

  readonly cancelledOrders = computed(() => {
    // FUTURO: GET /api/orders?status=cancelado
    return this._orders()
      .filter((o) => o.status === 'cancelado')
      .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
  });

  readonly historyOrders = computed(() => {
    // FUTURO: GET /api/orders?date!=today
    const today = new Date().toDateString();
    return this._orders()
      .filter((o) => new Date(o.orderTime).toDateString() !== today)
      .sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
  });

  // Signals computadas para estadísticas
  readonly totalOrders = computed(() => this._orders().length);
  readonly pendingOrdersCount = computed(() => this.pendingOrders().length);
  readonly listosOrdersCount = computed(() => this.listosOrders().length);
  readonly totalRevenue = computed(() =>
    this._orders()
      .filter((o) => o.status === 'listo')
      .reduce((sum, o) => sum + o.total, 0),
  );

  // ==========================================
  // MÉTODOS DE GESTIÓN DE PEDIDOS
  // ==========================================

  /**
   * Actualiza el estado de un pedido
   * MOCK: Reemplazar con llamada HTTP PATCH /api/orders/{id}/status
   */
  updateOrderStatus(id: number, status: Order['status'], readyTime?: string): void {
    // FUTURO:
    // const request: UpdateOrderStatusRequest = { status, readyTime };
    // this.http.patch<Order>(`${this.apiUrl}/orders/${id}/status`, request).subscribe(updated => {
    //   this._orders.update(orders => orders.map(o => o.id === id ? updated : o));
    // });

    this._orders.update((orders) =>
      orders.map((o) => {
        if (o.id === id) {
          const updatedOrder = { ...o, status };
          if (status === 'listo' && readyTime) {
            updatedOrder.readyTime = readyTime;
          }
          return updatedOrder;
        }
        return o;
      }),
    );
  }

  /**
   * Cancela un pedido
   * MOCK: Reemplazar con llamada HTTP DELETE /api/orders/{id}
   * o PATCH /api/orders/{id}/status con status='cancelado'
   */
  cancelOrder(id: number): void {
    this.updateOrderStatus(id, 'cancelado');
  }

  /**
   * Crea un nuevo pedido
   * MOCK: Reemplazar con llamada HTTP POST /api/orders
   */
  createOrder(order: Omit<Order, 'id' | 'status' | 'isCanceled'>): void {
    const newId = Math.max(...this._orders().map((o) => o.id), 0) + 1;
    const newOrder: Order = {
      ...order,
      id: newId,
      status: 'pendiente',
      isCanceled: false,
    };
    this._orders.update((orders) => [...orders, newOrder]);
  }

  /**
   * Obtiene un pedido por ID
   */
  getOrderById(id: number): Order | undefined {
    return this._orders().find((o) => o.id === id);
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  /**
   * Compara tiempos de entrega para ordenamiento
   */
  private compareDeliveryTime(a: string, b: string): number {
    if (a === 'inmediatamente') return -1;
    if (b === 'inmediatamente') return 1;
    return a.localeCompare(b);
  }

  /**
   * Crea datos de muestra (MOCK)
   * Eliminar cuando se migre al backend
   */
  private createSampleOrders(): Order[] {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 86400000);
    const twoDaysAgo = new Date(now.getTime() - 172800000);
    const threeDaysAgo = new Date(now.getTime() - 259200000);

    return [
      // Today's orders - Pendientes
      {
        id: 1,
        clientName: 'Juan Perez',
        address: 'Av. Siempre Viva 123',
        total: 24.5,
        status: 'pendiente',
        items: [
          { name: 'Pizza Margarita', price: 12.0, unitPrice: 12.0, quantity: 1 },
          { name: 'Hamburguesa Clásica', price: 10.5, unitPrice: 10.5, quantity: 1 },
          { name: 'Coca Cola', price: 2.0, unitPrice: 2.0, quantity: 1 },
        ],
        desiredDeliveryTime: 'inmediatamente',
        orderTime: now.toISOString(),
        phone: '5551234',
        isCanceled: false,
      },
      {
        id: 2,
        clientName: 'Maria Gomez',
        address: 'Calle Falsa 123',
        total: 10.5,
        status: 'pendiente',
        items: [{ name: 'Hamburguesa Clásica', price: 10.5, unitPrice: 10.5, quantity: 1 }],
        desiredDeliveryTime: '14:30',
        orderTime: now.toISOString(),
        phone: '5555678',
        isCanceled: false,
      },
      {
        id: 3,
        clientName: 'Carlos Ruiz',
        address: 'Centro 456',
        total: 18.0,
        status: 'pendiente',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 1 },
          { name: 'Cerveza', price: 3.0, unitPrice: 3.0, quantity: 1 },
        ],
        desiredDeliveryTime: '15:00',
        orderTime: now.toISOString(),
        phone: '5559012',
        isCanceled: false,
      },
      {
        id: 4,
        clientName: 'Ana Martinez',
        address: 'Norte 789',
        total: 32.0,
        status: 'pendiente',
        items: [
          { name: 'Pizza Pepperoni', price: 14.0, unitPrice: 14.0, quantity: 2 },
          { name: 'Coca Cola', price: 2.0, unitPrice: 2.0, quantity: 2 },
        ],
        desiredDeliveryTime: '16:00',
        orderTime: now.toISOString(),
        phone: '5553456',
        isCanceled: false,
      },
      {
        id: 5,
        clientName: 'Luis Torres',
        address: 'Sur 321',
        total: 25.5,
        status: 'pendiente',
        items: [
          { name: 'Hamburguesa Doble', price: 15.0, unitPrice: 15.0, quantity: 1 },
          { name: 'Papas Fritas', price: 5.5, unitPrice: 5.5, quantity: 1 },
          { name: 'Cerveza', price: 5.0, unitPrice: 5.0, quantity: 1 },
        ],
        desiredDeliveryTime: '17:30',
        orderTime: now.toISOString(),
        phone: '5557890',
        isCanceled: false,
      },
      {
        id: 6,
        clientName: 'Sofia Blanco',
        address: 'Este 654',
        total: 42.0,
        status: 'pendiente',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 2 },
          { name: 'Sopa Miso', price: 6.0, unitPrice: 6.0, quantity: 1 },
          { name: 'Sake', price: 6.0, unitPrice: 6.0, quantity: 1 },
        ],
        desiredDeliveryTime: '18:00',
        orderTime: now.toISOString(),
        phone: '5551122',
        isCanceled: false,
      },

      // Today's orders - Listos
      {
        id: 7,
        clientName: 'Pedro Sanchez',
        address: 'Oeste 987',
        total: 15.0,
        status: 'listo',
        items: [
          { name: 'Tiramisú', price: 5.0, unitPrice: 5.0, quantity: 1 },
          { name: 'Café', price: 2.5, unitPrice: 2.5, quantity: 2 },
          { name: 'Agua', price: 5.0, unitPrice: 5.0, quantity: 1 },
        ],
        desiredDeliveryTime: 'inmediatamente',
        orderTime: now.toISOString(),
        phone: '5553344',
        readyTime: new Date(now.getTime() - 300000).toISOString(),
        isCanceled: false,
      },
      {
        id: 8,
        clientName: 'Laura Diaz',
        address: 'Prado 50',
        total: 28.0,
        status: 'listo',
        items: [
          { name: 'Pizza Margarita', price: 12.0, unitPrice: 12.0, quantity: 1 },
          { name: 'Ensalada César', price: 8.0, unitPrice: 8.0, quantity: 1 },
          { name: 'Cerveza', price: 4.0, unitPrice: 4.0, quantity: 2 },
        ],
        desiredDeliveryTime: '13:00',
        orderTime: now.toISOString(),
        phone: '5555566',
        readyTime: new Date(now.getTime() - 600000).toISOString(),
        isCanceled: false,
      },
      {
        id: 9,
        clientName: 'Miguel Angel',
        address: 'Reforma 222',
        total: 19.5,
        status: 'listo',
        items: [
          { name: 'Hamburguesa Clásica', price: 10.5, unitPrice: 10.5, quantity: 1 },
          { name: 'Papas Fritas', price: 5.0, unitPrice: 5.0, quantity: 1 },
          { name: 'Coca Cola', price: 2.0, unitPrice: 2.0, quantity: 2 },
        ],
        desiredDeliveryTime: '12:30',
        orderTime: now.toISOString(),
        phone: '5557788',
        readyTime: new Date(now.getTime() - 900000).toISOString(),
        isCanceled: false,
      },
      {
        id: 10,
        clientName: 'Carmen Lopez',
        address: 'Juarez 333',
        total: 35.0,
        status: 'listo',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 2 },
          { name: 'Cerveza', price: 2.5, unitPrice: 2.5, quantity: 2 },
        ],
        desiredDeliveryTime: '14:00',
        orderTime: now.toISOString(),
        phone: '5559900',
        readyTime: new Date(now.getTime() - 400000).toISOString(),
        isCanceled: false,
      },
      {
        id: 11,
        clientName: 'Roberto Flores',
        address: 'Madero 444',
        total: 22.0,
        status: 'listo',
        items: [
          { name: 'Pizza Pepperoni', price: 14.0, unitPrice: 14.0, quantity: 1 },
          { name: 'Ensalada', price: 6.0, unitPrice: 6.0, quantity: 1 },
          { name: 'Agua', price: 2.0, unitPrice: 2.0, quantity: 1 },
        ],
        desiredDeliveryTime: '11:30',
        orderTime: now.toISOString(),
        phone: '5551100',
        readyTime: new Date(now.getTime() - 1200000).toISOString(),
        isCanceled: false,
      },
      {
        id: 12,
        clientName: 'Patricia Morales',
        address: 'Allende 555',
        total: 45.0,
        status: 'listo',
        items: [{ name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 3 }],
        desiredDeliveryTime: '15:30',
        orderTime: now.toISOString(),
        phone: '5552200',
        readyTime: new Date(now.getTime() - 500000).toISOString(),
        isCanceled: false,
      },
      {
        id: 13,
        clientName: 'Fernando Castro',
        address: 'Morelos 666',
        total: 16.5,
        status: 'listo',
        items: [
          { name: 'Hamburguesa Doble', price: 15.0, unitPrice: 15.0, quantity: 1 },
          { name: 'Coca Cola', price: 1.5, unitPrice: 1.5, quantity: 1 },
        ],
        desiredDeliveryTime: '16:30',
        orderTime: now.toISOString(),
        phone: '5553300',
        readyTime: new Date(now.getTime() - 350000).toISOString(),
        isCanceled: false,
      },
      {
        id: 14,
        clientName: 'Gabriela Ortiz',
        address: 'Zaragoza 777',
        total: 38.0,
        status: 'listo',
        items: [
          { name: 'Pizza Margarita', price: 12.0, unitPrice: 12.0, quantity: 2 },
          { name: 'Cerveza', price: 7.0, unitPrice: 7.0, quantity: 2 },
        ],
        desiredDeliveryTime: '17:00',
        orderTime: now.toISOString(),
        phone: '5554400',
        readyTime: new Date(now.getTime() - 450000).toISOString(),
        isCanceled: false,
      },

      // Yesterday's orders - Cancelados
      {
        id: 15,
        clientName: 'Ana Ruiz',
        address: 'Prado 50',
        total: 15.0,
        status: 'cancelado',
        items: [
          { name: 'Pizza Margarita', price: 12.0, unitPrice: 12.0, quantity: 1 },
          { name: 'Coca Cola', price: 3.0, unitPrice: 3.0, quantity: 1 },
        ],
        desiredDeliveryTime: '12:00',
        orderTime: yesterday.toISOString(),
        phone: '5553456',
        isCanceled: true,
      },
      {
        id: 16,
        clientName: 'Jorge Ramirez',
        address: 'Luna 888',
        total: 27.0,
        status: 'cancelado',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 1 },
          { name: 'Sopa Miso', price: 6.0, unitPrice: 6.0, quantity: 1 },
          { name: 'Cerveza', price: 6.0, unitPrice: 6.0, quantity: 1 },
        ],
        desiredDeliveryTime: '19:00',
        orderTime: yesterday.toISOString(),
        phone: '5556600',
        isCanceled: true,
      },
      {
        id: 17,
        clientName: 'Monica Herrera',
        address: 'Sol 999',
        total: 33.5,
        status: 'cancelado',
        items: [
          { name: 'Pizza Pepperoni', price: 14.0, unitPrice: 14.0, quantity: 1 },
          { name: 'Hamburguesa Clásica', price: 10.5, unitPrice: 10.5, quantity: 1 },
          { name: 'Papas Fritas', price: 5.0, unitPrice: 5.0, quantity: 1 },
          { name: 'Coca Cola', price: 2.0, unitPrice: 2.0, quantity: 2 },
        ],
        desiredDeliveryTime: '20:00',
        orderTime: yesterday.toISOString(),
        phone: '5557700',
        isCanceled: true,
      },

      // Yesterday's orders - Completados
      {
        id: 18,
        clientName: 'Luis Sosa',
        address: 'Parque 10',
        total: 8.5,
        status: 'listo',
        items: [{ name: 'Hamburguesa Clásica', price: 8.5, unitPrice: 8.5, quantity: 1 }],
        desiredDeliveryTime: '19:00',
        orderTime: yesterday.toISOString(),
        phone: '5557890',
        isCanceled: false,
      },
      {
        id: 19,
        clientName: 'Elena Vargas',
        address: 'Plaza 111',
        total: 52.0,
        status: 'listo',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 2 },
          { name: 'Sake', price: 11.0, unitPrice: 11.0, quantity: 1 },
          { name: 'Tiramisú', price: 5.5, unitPrice: 5.5, quantity: 2 },
        ],
        desiredDeliveryTime: '21:00',
        orderTime: yesterday.toISOString(),
        phone: '5558800',
        isCanceled: false,
      },
      {
        id: 20,
        clientName: 'Ricardo Mendez',
        address: 'Calle 222',
        total: 29.0,
        status: 'listo',
        items: [
          { name: 'Pizza Margarita', price: 12.0, unitPrice: 12.0, quantity: 1 },
          { name: 'Pizza Pepperoni', price: 14.0, unitPrice: 14.0, quantity: 1 },
          { name: 'Cerveza', price: 3.0, unitPrice: 3.0, quantity: 1 },
        ],
        desiredDeliveryTime: '20:30',
        orderTime: yesterday.toISOString(),
        phone: '5559911',
        isCanceled: false,
      },

      // 2 days ago orders
      {
        id: 21,
        clientName: 'Beatriz Silva',
        address: 'Avenida 333',
        total: 41.0,
        status: 'listo',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 2 },
          { name: 'Sopa Miso', price: 6.0, unitPrice: 6.0, quantity: 1 },
          { name: 'Cerveza', price: 5.0, unitPrice: 5.0, quantity: 2 },
        ],
        desiredDeliveryTime: '18:30',
        orderTime: twoDaysAgo.toISOString(),
        phone: '5550011',
        isCanceled: false,
      },
      {
        id: 22,
        clientName: 'Alberto Navarro',
        address: 'Boulevard 444',
        total: 18.5,
        status: 'cancelado',
        items: [
          { name: 'Hamburguesa Doble', price: 15.0, unitPrice: 15.0, quantity: 1 },
          { name: 'Papas Fritas', price: 3.5, unitPrice: 3.5, quantity: 1 },
        ],
        desiredDeliveryTime: '14:00',
        orderTime: twoDaysAgo.toISOString(),
        phone: '5550022',
        isCanceled: true,
      },
      {
        id: 23,
        clientName: 'Cristina Peña',
        address: 'Camino 555',
        total: 36.0,
        status: 'listo',
        items: [
          { name: 'Pizza Margarita', price: 12.0, unitPrice: 12.0, quantity: 2 },
          { name: 'Ensalada César', price: 8.0, unitPrice: 8.0, quantity: 1 },
          { name: 'Agua', price: 2.0, unitPrice: 2.0, quantity: 2 },
        ],
        desiredDeliveryTime: '19:30',
        orderTime: twoDaysAgo.toISOString(),
        phone: '5550033',
        isCanceled: false,
      },

      // 3 days ago orders
      {
        id: 24,
        clientName: 'Daniel Reyes',
        address: 'Carrera 666',
        total: 24.0,
        status: 'listo',
        items: [
          { name: 'Hamburguesa Clásica', price: 10.5, unitPrice: 10.5, quantity: 1 },
          { name: 'Hamburguesa Doble', price: 15.0, unitPrice: 15.0, quantity: 1 },
          { name: 'Coca Cola', price: 2.5, unitPrice: 2.5, quantity: 2 },
        ],
        desiredDeliveryTime: '13:00',
        orderTime: threeDaysAgo.toISOString(),
        phone: '5550044',
        isCanceled: false,
      },
      {
        id: 25,
        clientName: 'Fabiana Cruz',
        address: 'Diagonal 777',
        total: 55.0,
        status: 'listo',
        items: [
          { name: 'Sushi Roll', price: 15.0, unitPrice: 15.0, quantity: 3 },
          { name: 'Sake', price: 10.0, unitPrice: 10.0, quantity: 1 },
        ],
        desiredDeliveryTime: '20:00',
        orderTime: threeDaysAgo.toISOString(),
        phone: '5550055',
        isCanceled: false,
      },
    ];
  }
}
