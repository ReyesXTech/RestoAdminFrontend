🔴 PROBLEMAS DE SEVERIDAD ALTA

1. DataService Monolítico (855 líneas)
   Archivo: src/app/services/data.service.ts

Problema: El DataService es excesivamente grande y viola el Principio de Responsabilidad Única (SRP). Contiene:

Lógica de autenticación
Gestión de pedidos (orders)
Gestión de menú/productos
Gestión de usuarios
Gestión de tasas de cambio
5 signals computadas complejas
Múltiples métodos CRUD
Código problemático (líneas 1-855):

@Injectable({ providedIn: 'root' })
export class DataService {
// TODO en una sola clase: auth, orders, menu, users, exchange rates...
private \_orders = signal<Order[]>([]);
private \_menuItems = signal<MenuItem[]>([]);
private \_users = signal<User[]>([]);
private \_isLoggedIn = signal<boolean>(...);
private \_exchangeRate = signal<ExchangeRate>(...);
// ... 855 líneas de código
}
Impacto:

Dificultad extrema para testear
Alto acoplamiento
Difícil mantenimiento
Riesgo de bugs en cascada
Recomendación: Dividir en servicios especializados:

src/app/services/
├── auth.service.ts (login, logout, currentUser)
├── orders.service.ts (pedidos, historial, cancelados)
├── menu.service.ts (productos, categorías)
├── users.service.ts (gestión de usuarios)
└── exchange.service.ts (tasas de cambio)

2. Lógica Duplicada: isUrgent() en Múltiples Componentes
   Archivos afectados:

src/app/pages/pedidos/pedidos.component.ts (líneas 104-115)
src/app/pages/historial/historial.component.ts (líneas 118-128)
Código duplicado:

// EN PEDIDOS (línea 104)
isUrgent(order: Order): boolean {
if (order.desiredDeliveryTime === 'inmediatamente') return true;
const [hours, minutes] = order.desiredDeliveryTime.split(':').map(Number);
const now = this.currentTime();
const deliveryTime = new Date(now);
deliveryTime.setHours(hours, minutes);
const diffMs = deliveryTime.getTime() - now.getTime();
const diffMinutes = Math.floor(diffMs / 60000);
return diffMinutes <= 15 && diffMinutes >= 0;
}

// EN HISTORIAL (línea 118) - IDÉNTICO excepto por currentTime()
isUrgent(order: Order): boolean {
if (order.desiredDeliveryTime === 'inmediatamente') return true;
const [hours, minutes] = order.desiredDeliveryTime.split(':').map(Number);
const now = new Date(); // <-- DIFERENCIA: usa new Date() en lugar de signal
const deliveryTime = new Date(now);
deliveryTime.setHours(hours, minutes);
const diffMs = deliveryTime.getTime() - now.getTime();
const diffMinutes = Math.floor(diffMs / 60000);
return diffMinutes <= 15 && diffMinutes >= 0;
}
Recomendación: Crear un Pure Pipe o función utilitaria:

// src/app/pipes/is-urgent.pipe.ts
@Pipe({ name: 'isUrgent', standalone: true, pure: true })
export class IsUrgentPipe implements PipeTransform {
transform(desiredDeliveryTime: string, referenceDate?: Date): boolean {
if (desiredDeliveryTime === 'inmediatamente') return true;
const [hours, minutes] = desiredDeliveryTime.split(':').map(Number);
const now = referenceDate || new Date();
const deliveryTime = new Date(now);
deliveryTime.setHours(hours, minutes);
const diffMs = deliveryTime.getTime() - now.getTime();
const diffMinutes = Math.floor(diffMs / 60000);
return diffMinutes <= 15 && diffMinutes >= 0;
}
}

3. Lógica Duplicada: copyPhone() en 3 Componentes
   Archivos afectados:

src/app/pages/pedidos/pedidos.component.ts (líneas 117-141)
src/app/pages/historial/historial.component.ts (líneas 130-154)
src/app/pages/cancelados/cancelados.component.ts (líneas 47-71)
Código duplicado (100% idéntico):

copyPhone(phone: string): void {
if (phone) {
navigator.clipboard
.writeText(phone)
.then(() => {
this.toastService.show(`Teléfono ${phone} copiado`, 'success');
})
.catch(() => {
// Fallback para móviles
const textArea = document.createElement('textarea');
textArea.value = phone;
textArea.style.position = 'fixed';
textArea.style.left = '-999999px';
document.body.appendChild(textArea);
textArea.select();
try {
document.execCommand('copy');
this.toastService.show(`Teléfono ${phone} copiado`, 'success');
} catch (err) {
this.toastService.show('Error al copiar', 'error');
}
document.body.removeChild(textArea);
});
}
}
Recomendación: Mover a un servicio compartido:

// src/app/services/clipboard.service.ts
@Injectable({ providedIn: 'root' })
export class ClipboardService {
private toastService = inject(ToastService);

copyPhone(phone: string): Promise<void> {
if (!phone) return Promise.resolve();

    return navigator.clipboard.writeText(phone)
      .then(() => {
        this.toastService.show(`Teléfono ${phone} copiado`, 'success');
      })
      .catch(() => {
        // Fallback implementation...
      });

}
}

4. Componente Pedidos con Demasiada Lógica en Template
   Archivo: src/app/pages/pedidos/pedidos.component.html

Problema: El template tiene 578 líneas con lógica compleja embebida:

Dos listas completas (pendientes y listos) con estructura casi idéntica
Quick preview panel duplicado en ambas listas
View mode selector con lógica condicional compleja
Código problemático:

<!-- List: Pendientes (línea 55-168) -->
<div class="order-list pendientes-list mobile-only" [class.hidden]="viewMode() === 'listos'">
  <!-- 113 líneas de estructura -->
</div>

<!-- List: Listos (línea 170-282) -->
<div class="order-list listos-list mobile-only" [class.hidden]="viewMode() === 'pendientes'">
  <!-- 112 líneas de estructura IDÉNTICA -->
</div>
Recomendación: Extraer componente reutilizable:

// src/app/shared/components/order-list/order-list.component.ts
@Component({
selector: 'app-order-list',
template: `     <div class="order-list" [class.pendientes-list]="type === 'pendientes'"
                           [class.listos-list]="type === 'listos'">
      <div class="list-header">
        <!-- Header común -->
      </div>
      <div class="list-content">
        @for (order of orders(); track order.id) {
          <app-order-card [order]="order" (click)="viewOrder.emit(order)" />
        }
      </div>
    </div>
  `
})
export class OrderListComponent {
type = input.required<'pendientes' | 'listos'>();
orders = input.required<Order[]>();
viewOrder = output<Order>();
}

5.  Inconsistencia en Manejo de Fechas
    Archivos afectados:

src/app/pages/pedidos/pedidos.component.ts (línea 40): currentTime = signal(new Date())
src/app/pages/historial/historial.component.ts (línea 121): const now = new Date()
Problema: El componente Pedidos actualiza la hora cada segundo (líneas 38-43), pero Historial usa new Date() directo. Esto causa:

Inconsistencia en el cálculo de urgencia
Posible confusión en la UI
Recomendación: Crear un servicio de tiempo:

// src/app/services/time.service.ts
@Injectable({ providedIn: 'root' })
export class TimeService {
private \_currentTime = signal(new Date());
readonly currentTime = this.\_currentTime.asReadonly();

constructor() {
if (typeof window !== 'undefined') {
setInterval(() => this.\_currentTime.set(new Date()), 1000);
}
}

isToday(dateString: string): boolean {
return new Date(dateString).toDateString() === this.currentTime().toDateString();
}
}

🟡 PROBLEMAS DE SEVERIDAD MEDIA

6. Estilos Duplicados en Múltiples Componentes
   Archivos afectados: Todos los .scss de componentes

Patrones duplicados encontrados:

a) Toast Notifications (5 archivos)
// EN pedidos.component.scss (línea 678-720)
// EN historial.component.scss (línea 419-461)
// EN cancelados.component.scss (línea 178-220)
.toast-notification {
position: fixed;
bottom: 1.5rem;
right: 1.5rem;
display: flex;
align-items: center;
gap: 0.75rem;
padding: 0.875rem 1.25rem;
border-radius: 0.75rem;
box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
z-index: 1000;
animation: slide-in-right 0.3s ease-out;

&.toast-success {
background-color: color(emerald-600);
color: color(white);
}

&.toast-error {
background-color: color(red-600);
color: color(white);
}
// ... 40+ líneas duplicadas
}
Recomendación: Mover a \_global.scss o crear componente de toast dedicado.

b) Modales (4 archivos)
// EN pedidos.component.scss, historial.component.scss, menu.component.scss, usuarios.component.scss
@keyframes fade-in {
from { opacity: 0; }
to { opacity: 1; }
}

@keyframes slide-up-fade {
from {
opacity: 0;
transform: translateY(20px) scale(0.95);
}
to {
opacity: 1;
transform: translateY(0) scale(1);
}
}

.modal-overlay {
position: fixed;
inset: 0;
background-color: rgba(0, 0, 0, 0.4);
z-index: 50;
// ... 20+ líneas duplicadas
}
Recomendación: Mover a \_mixins.scss:

// \_mixins.scss
@mixin modal-overlay {
position: fixed;
inset: 0;
background-color: var(--modal-overlay);
z-index: 50;
display: flex;
align-items: center;
justify-content: center;
padding: 1rem;
animation: fade-in 0.2s ease-out;
}

@mixin modal-animations {
@keyframes fade-in {
from { opacity: 0; }
to { opacity: 1; }
}
// ...
}

c) Action Tooltips (3 archivos)
// EN pedidos.component.scss (línea 507-531)
// EN menu.component.scss (línea 636-660)
// EN usuarios.component.scss (línea 148-172)
.action-tooltip {
position: fixed;
bottom: auto;
left: auto;
transform: translate(-20px, -30px);
background-color: color(gray-800);
color: color(white);
font-size: 0.75rem;
font-weight: 600;
padding: 0.5rem 0.75rem;
border-radius: 0.5rem;
white-space: nowrap;
opacity: 0;
visibility: hidden;
@include transition(all, 150ms);
// ... 25+ líneas duplicadas
}

7. Componentes de Modal Sin Reutilización
   Archivos:

src/app/shared/components/order-modals/pending-ready-order-detail-modal.component.ts
src/app/shared/components/order-modals/cancelled-order-detail-modal.component.ts
Problema: Ambos modales tienen estructura 90% idéntica pero están separados. Deberían ser un solo componente con input de tipo.

Código similar:

// pending-ready-order-detail-modal.component.ts
getWhatsAppLink(order: Order): string {
const message = encodeURIComponent(
`Hola ${order.clientName}, tu pedido de Rey Sushi está siendo procesado.`
);
return `https://wa.me/${phone}?text=${message}`;
}

// cancelled-order-detail-modal.component.ts
getWhatsAppLink(order: Order): string {
const message = encodeURIComponent(
`Hola ${order.clientName}, vimos que tu pedido fue cancelado. ¿Podemos ayudarte con algo más?`
);
return `https://wa.me/${phone}?text=${message}`;
}
Recomendación: Unificar en un solo componente:

// order-detail-modal.component.ts
@Component({
selector: 'app-order-detail-modal',
template: `     <div class="modal-content" [class.is-cancelled]="order()?.status === 'cancelado'">
      <!-- Template unificado -->
    </div>
  `
})
export class OrderDetailModalComponent {
order = input.required<Order | null>();
whatsappMessage = input<string>('');
}

8. Falta de Validación de Formularios
   Archivos afectados:

src/app/pages/menu/menu.component.ts (líneas 149-168)
src/app/pages/usuarios/usuarios.component.ts (líneas 55-71)
Código problemático:

// menu.component.ts - Sin validación real
saveItem(): void {
if (!this.formName.trim()) return; // <-- Única validación

const itemData = {
name: this.formName,
category: this.formCategory,
price: this.formPrice, // <-- ¿Qué pasa si es negativo?
available: this.formAvailable,
// ...
};
// ...
}

// usuarios.component.ts - Sin validación de email
saveUser(): void {
if (!this.formName.trim() || !this.formPhone.trim()) return; // <-- Única validación

const itemData = {
name: this.formName,
phone: this.formPhone,
email: this.formEmail, // <-- ¿Qué pasa si el email es inválido?
role: this.formRole,
};
// ...
}
Recomendación: Usar Reactive Forms:

// menu.component.ts
form = this.fb.nonNullable.group({
name: ['', [Validators.required, Validators.minLength(3)]],
category: ['Comida' as MenuItem['category'], [Validators.required]],
price: [0, [Validators.required, Validators.min(0.01)]],
available: [true],
description: [''],
ingredients: [''],
imageUrl: ['']
});

saveItem(): void {
if (this.form.invalid) {
this.form.markAllAsTouched();
return;
}
// ...
}

9.  Hardcoding de Valores en Estilos
    Archivos afectados: Múltiples .scss

Valores hardcodeados encontrados:

// EN login.component.scss - Valores específicos
.login-container {
min-height: 100vh;
background-color: #f1f5f9; // <-- Debería usar variable
padding: 24px; // <-- Debería usar spacing(6)
}

// EN menu.component.scss
.exchange-display {
background: color(white); // <-- Debería usar var(--surface-bg)
border: 1px solid color(gray-200); // <-- Debería usar var(--border-color)
}

// EN layout.component.scss
.sidebar {
width: 13rem; // <-- Ya existe clase .w-52 en styles.scss
}
Recomendación: Usar consistentemente variables CSS y funciones SCSS:

.login-container {
min-height: 100vh;
background-color: var(--app-bg);
padding: spacing(6);
}

10. Falta de Lazy Loading para Rutas
    Archivo: src/app/app.routes.ts

Problema: Aunque las rutas usan loadComponent, no hay lazy loading de módulos para funcionalidades grandes.

export const routes: Routes = [
{
path: 'pedidos',
loadComponent: () => import('./pages/pedidos/pedidos.component').then(m => m.PedidosComponent),
},
// ... todas las rutas cargan componentes individuales
];
Recomendación: Para una aplicación que crecerá, considerar:

{
path: 'pedidos',
loadChildren: () => import('./pages/pedidos/pedidos.routes').then(m => m.PEDIDOS_ROUTES)
}

🟢 PROBLEMAS DE SEVERIDAD BAJA

11. Signals No Explotadas Completamente
    Archivo: src/app/pages/historial/historial.component.ts

Problema: Uso de effect innecesario para sincronizar toasts:

// Líneas 19-26
toasts = signal<ReturnType<typeof this.toastService.getToasts>>([]);
private effectRef?: ReturnType<typeof effect>;

constructor() {
this.effectRef = effect(() => {
this.toasts.set(this.toastService.getToasts());
});
}
Recomendación: Usar directamente la signal del servicio:

toasts = this.toastService.toasts; // Ya es una signal readonly

12. Falta de Tipos Específicos en Algunos Lugares
    Archivo: src/app/pages/pedidos/pedidos.component.ts

// Línea 28
private timeInterval?: any; // <-- Debería ser number | undefined

// Línea 33
viewMode = signal<'both' | 'pendientes' | 'listos'>('both'); // <-- Bien tipado
Recomendación: Evitar any:

private timeInterval?: ReturnType<typeof setInterval>;

13. Comentarios Excesivos en Código Mock
    Archivo: src/app/services/data.service.ts

Problema: El archivo tiene más de 100 líneas de comentarios sobre migración futura:

// ==========================================
// DATA SERVICE
// ==========================================
// ACTUALMENTE: Usa datos mock...
// FUTURO: Cada método está comentado...
// GUÍA DE MIGRACIÓN:
// 1. Inyectar HttpClient...
// ... (20+ líneas de comentarios)
Recomendación: Mover documentación a un archivo MIGRATION_GUIDE.md separado.

14. Falta de Manejo de Errores en Suscripciones
    Archivo: src/app/services/data.service.ts

// Línea 85 (ejemplo)
loadExchangeRate(): void {
// MOCK: Reemplazar con llamada HTTP GET /api/exchange-rates
// this.http.get<ExchangeRate>(...).subscribe(rate => {
// this.\_exchangeRate.set(rate);
// }); // <-- Sin manejo de errores
}
Recomendación: Siempre incluir error handling:

this.http.get<ExchangeRate>(...).subscribe({
next: rate => this.\_exchangeRate.set(rate),
error: error => console.error('Failed to load exchange rate', error)
});

15. Variables No Utilizadas
    Archivo: src/app/pages/menu/menu.component.ts

// Línea 58
private readonly TOOLTIP_OFFSET = 20;
private readonly TOOLTIP_WIDTH = 320;
private readonly TOOLTIP_HEIGHT = 380;

// Estas constantes solo se usan en 2 métodos pero podrían ser configurables
