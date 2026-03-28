# Guía de Migración a Backend .NET

Este documento describe cómo migrar gradualmente el frontend Angular a un backend .NET real.

## Estructura Actual

El frontend está completamente desarrollado y funciona con datos mock. Toda la lógica de datos está centralizada en `src/app/services/data.service.ts`.

## Archivos Clave para la Migración

### 1. Models (`src/app/models/models.ts`)
Contiene todas las interfaces y enums tipados que coinciden con las entidades del backend:

- **Order**: Pedidos con sus items, estado, fechas
- **OrderItem**: Items dentro de un pedido
- **Product/MenuItem**: Productos del menú
- **Customer**: Clientes (para implementación futura)
- **User**: Usuarios del sistema
- **ExchangeRate**: Tasas de cambio
- **Enums**: OrderStatus, ProductCategory, UserRole

### 2. Environment (`src/environments/`)
```typescript
// environment.ts (desarrollo)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};

// environment.prod.ts (producción)
export const environment = {
  production: true,
  apiUrl: 'https://api.reysushi.com/api'
};
```

### 3. Data Service (`src/app/services/data.service.ts`)
Cada método está comentado indicando el endpoint correspondiente:

```typescript
// Ejemplo de método actual (MOCK):
updateOrderStatus(id: number, status: Order['status']): void {
  // MOCK: Reemplazar con llamada HTTP PATCH /api/orders/{id}/status
  this._orders.update(orders => /* ... */);
}

// Ejemplo de cómo quedará con backend:
updateOrderStatus(id: number, status: Order['status']): Observable<Order> {
  const request: UpdateOrderStatusRequest = { status };
  return this.http.patch<Order>(`${this.apiUrl}/orders/${id}/status`, request);
}
```

### 4. Interceptors (`src/app/interceptors/`)
- **jwt.interceptor.ts**: Añade token JWT a las peticiones (actualmente en modo mock)
- **error.interceptor.ts**: Maneja errores HTTP y muestra notificaciones

### 5. App Config (`src/app/app.config.ts`)
HttpClient ya está configurado con los interceptors:
```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([
    errorInterceptorFn,
    jwtInterceptorFn
  ])
)
```

## Pasos para Migrar Cada Método

### Paso 1: Inyectar HttpClient
```typescript
private http = inject(HttpClient);
```

### Paso 2: Identificar el Endpoint
Cada método en `data.service.ts` tiene un comentario indicando el endpoint:
```typescript
// ==========================================
// PEDIDOS (ORDERS)
// ==========================================
// Endpoints relacionados:
// - GET /api/orders (todos los pedidos)
// - GET /api/orders?status=pendiente (filtrar por estado)
// - POST /api/orders (crear pedido)
// - PATCH /api/orders/{id}/status (actualizar estado)
```

### Paso 3: Reemplazar Implementación Mock
```typescript
// ANTES (MOCK):
getOrders(): Order[] {
  return this._orders();
}

// DESPUÉS (BACKEND):
getOrders(): Observable<Order[]> {
  return this.http.get<Order[]>(`${this.apiUrl}/orders`);
}
```

### Paso 4: Actualizar Components que Consumen el Método
Los componentes que usan signals computadas probablemente necesitarán ajustes:

```typescript
// ANTES (con signal computada):
readonly pendingOrders = computed(() => {
  return this._orders()
    .filter(o => o.status === 'pendiente');
});

// DESPUÉS (llamada directa al endpoint filtrado):
readonly pendingOrders = signal<Order[]>([]);

loadPendingOrders(): void {
  this.http.get<Order[]>(`${this.apiUrl}/orders?status=pendiente`)
    .subscribe(orders => this.pendingOrders.set(orders));
}
```

## Endpoints por Implementar

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token

### Pedidos (Orders)
- `GET /api/orders` - Obtener todos los pedidos
- `GET /api/orders/{id}` - Obtener pedido específico
- `POST /api/orders` - Crear nuevo pedido
- `PATCH /api/orders/{id}/status` - Actualizar estado
- `DELETE /api/orders/{id}` - Cancelar pedido
- `GET /api/orders/today` - Pedidos de hoy
- `GET /api/orders/history` - Historial de pedidos

### Productos (Products)
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/{id}` - Obtener producto específico
- `POST /api/products` - Crear producto
- `PUT /api/products/{id}` - Actualizar producto
- `DELETE /api/products/{id}` - Eliminar producto
- `GET /api/products?category=Comida&available=true` - Filtrar productos

### Usuarios (Users)
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/{id}` - Obtener usuario específico
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

### Tasas de Cambio (Exchange Rates)
- `GET /api/exchange-rates` - Obtener tasas actuales
- `PUT /api/exchange-rates` - Actualizar tasas

### Clientes (Customers) - Futuro
- `GET /api/customers` - Obtener todos los clientes
- `GET /api/customers/{id}` - Obtener cliente específico
- `POST /api/customers` - Crear cliente
- `PUT /api/customers/{id}` - Actualizar cliente

## Orden Recomendado de Migración

1. **Autenticación** (`login`, `logout`) - Base para todo lo demás
2. **Tasas de Cambio** - Simple, solo lectura/escritura
3. **Productos** - CRUD básico, sin dependencias
4. **Usuarios** - Similar a productos
5. **Pedidos** - Más complejo, depende de productos y clientes

## Consideraciones Importantes

### Signals Computadas
Muchas signals computadas en el DataService actual filtran arrays en el frontend. Cuando se migre al backend, estas probablemente se convertirán en llamadas HTTP con parámetros de filtro.

### Manejo de Errores
El `ErrorInterceptor` ya está configurado para mostrar notificaciones toast cuando ocurran errores HTTP.

### Token JWT
El `JwtInterceptor` está listo pero en modo mock. Cuando el backend implemente autenticación, descomentar las líneas que añaden el header `Authorization`.

### Tipos de Datos
Las interfaces en `models.ts` están diseñadas para ser compatibles con las entidades .NET. Verificar que los tipos coincidan exactamente (ej. `DateTime` en .NET → `string` ISO en TypeScript).

## Testing Durante la Migración

Después de migrar cada método:
1. Verificar que la UI sigue funcionando
2. Comprobar que las notificaciones de error aparecen cuando corresponde
3. Asegurar que las signals se actualizan correctamente
4. Testear en diferentes navegadores

## Archivos Creados para la Migración

```
src/
├── app/
│   ├── models/
│   │   └── models.ts              # Interfaces y enums actualizados
│   ├── services/
│   │   ├── data.service.ts        # Refactorizado con comentarios
│   │   └── toast.service.ts       # Para notificaciones
│   ├── interceptors/
│   │   ├── jwt.interceptor.ts     # Token JWT (mock mode)
│   │   ├── error.interceptor.ts   # Manejo de errores
│   │   └── index.ts               # Exports
│   └── app.config.ts              # HttpClient configurado
├── environments/
│   ├── environment.ts             # URL de desarrollo
│   └── environment.prod.ts        # URL de producción
```

## Contacto

Para dudas sobre la implementación del backend .NET, consultar la documentación de cada endpoint en la API Swagger (cuando esté disponible).
