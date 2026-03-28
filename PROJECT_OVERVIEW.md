##Rules
-Sigue buenas practicas de programacion
-Si vas a hacer copias de codigo o separaciones asegurate de luego de hacerlas, y comprobar que funcionan, ir eliminando el codigo duplicado del lughar original en caso de ser lo correcto. La esencia es no hacer logica duplicada.

-

# 🍱 Rey Sushi - Dashboard Administrativo

Este documento es la fuente de verdad técnica para los agentes de IA que trabajen en el proyecto. Contiene la arquitectura, flujos de datos y funcionalidades implementadas en el sistema de gestión de pedidos.

## 🛠️ Stack Tecnológico

- **Framework:** Angular v21.1.0 (Standalone Components).
- **Gestión de Estado:** **Angular Signals** (Estado reactivo granular).
- **Estilos:** **SCSS (SASS) Modular**. El proyecto ha sido migrado totalmente a SASS; .
- **SSR:** Angular SSR con Express v5.1.0.
- **Runtime:** Node.js con soporte para TypeScript (Versión ~5.9.2 según `package.json`).

## 🎨 Arquitectura de Estilos (SASS)

El proyecto utiliza un sistema de diseño propio basado en variables y mixins globales:

- **`src/app/styles/`**:
  - `_variables.scss`: Paleta de colores, sombras y espaciados.
  - `_mixins.scss`: Mixins para media queries, scrollbars personalizadas y transiciones.
  - `_theme-tokens.scss`: Definiciones dinámicas para temas Claro/Oscuro.
  - `_global.scss`: Resets y clases de utilidad base.
- **Component Styles**: Cada componente tiene su propio archivo `.scss` que importa los mixins y variables necesarios para mantener el encapsulamiento.

## 🧠 Lógica de Negocio y Estado (DataService)

El `DataService` es el cerebro de la aplicación. Actualmente gestiona datos mockeados con persistencia en `localStorage`, preparado para la migración a una API .NET.

### Funcionalidades Implementadas:

1.  **Gestión de Pedidos (Orders)**:
    - Filtrado automático mediante `computed signals`: `pendingOrders`, `listosOrders`, `canceledOrders`.
    - **Urgencia**: Lógica para marcar pedidos como urgentes si la entrega es en <15 min o "inmediata".
    - **Acciones**: Cambiar estado (Pendiente → Listo o Pendiente → Cancelado). Las cancelaciones son acciones manuales del personal.
2.  **Catálogo de Productos (Menu)**:
    - CRUD completo de productos con categorías (`Comida`, `Bebida`, `Postre`, `Otros`).
    - Control de disponibilidad (toggle `available`).
3.  **Sistema de Usuarios**:
    - Gestión de personal con roles (`admin`, `normal`).
4.  **Tasas de Cambio**:
    - Gestión de valores para USD y EUR, permitiendo ajustes manuales para el cálculo de precios.
5.  **Notificaciones**:
    - `ToastService` integrado para feedback visual de acciones del usuario.

## 📁 Estructura del Proyecto (`src/app`)

- **`pages/`**:
  - `pedidos/`: Panel operativo principal. Muestra pedidos en tiempo real con estados visuales.
  - `cancelados/`: Registro de pedidos cancelados manualmente por el personal.
  - `historial/`: Vista de auditoría de todos los pedidos procesados.
  - `menu/` (Ruta: `/productos`): Panel de administración del catálogo de productos.
  - `usuarios/`: Control de acceso y gestión de empleados.
  - `login/`: Interfaz de autenticación.
- **`interceptors/`**:
  - `jwt.interceptor.ts`: Adjunta automáticamente el token a las peticiones API.
  - `error.interceptor.ts`: Captura errores HTTP y los redirige al `ToastService`.
- **`models/`**:
  - `models.ts`: Interfaces estrictas que mapean exactamente las entidades del backend .NET esperado.

## 🚀 Flujos de Trabajo Comunes

- **Para modificar estilos**: Editar `_variables.scss` para cambios globales o el `.scss` del componente para cambios específicos.
- **Para añadir una funcionalidad de datos**: Implementar el método en `DataService` usando Signals para que la UI se actualice automáticamente.
- **Para proteger rutas**: Utilizar `authGuard` en `app.routes.ts`.

## 📝 Notas para Agentes

- **Importante**: El proyecto **NO** utiliza Tailwind CSS. No intentes usar clases de utilidad de Tailwind; usa el sistema SASS existente.
- **Signals**: Prefiere el uso de `signal`, `computed` y `effect` sobre `BehaviorSubject` de RxJS para el estado interno.
- **Compatibilidad**: Sigue las convenciones de nombres en `models.ts` ya que están alineadas con el futuro backend.
