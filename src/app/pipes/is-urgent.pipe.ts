// ==========================================
// IS URGENT PIPE
// ==========================================
// Pipe puro para determinar si un pedido es urgente
// Basado en el tiempo de entrega deseado
//
// Uso en templates:
//   {{ order.desiredDeliveryTime | isUrgent }}
//   {{ order.desiredDeliveryTime | isUrgent:currentTime }}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isUrgent',
  standalone: true,
  pure: true,
})
export class IsUrgentPipe implements PipeTransform {
  /**
   * Determina si un pedido es urgente basándose en su tiempo de entrega deseado
   * @param desiredDeliveryTime - Tiempo de entrega deseado (ej: '14:30' o 'inmediatamente')
   * @param referenceDate - Fecha de referencia opcional (por defecto: ahora)
   * @returns true si el pedido es urgente (entrega en <= 15 minutos)
   */
  transform(desiredDeliveryTime: string, referenceDate?: Date): boolean {
    if (!desiredDeliveryTime) return false;

    // Si es entrega inmediata, siempre es urgente
    if (desiredDeliveryTime === 'inmediatamente') {
      return true;
    }

    // Parsear horas y minutos del tiempo deseado
    const [hours, minutes] = desiredDeliveryTime.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    // Usar la fecha de referencia o la fecha actual
    const now = referenceDate || new Date();
    const deliveryTime = new Date(now);
    deliveryTime.setHours(hours, minutes);

    // Calcular diferencia en minutos
    const diffMs = deliveryTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    // Es urgente si falta 15 minutos o menos para la entrega
    return diffMinutes <= 15 && diffMinutes >= 0;
  }
}
