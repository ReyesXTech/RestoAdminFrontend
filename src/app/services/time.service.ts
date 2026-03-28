// ==========================================
// TIME SERVICE
// ==========================================
// Servicio para gestión centralizada del tiempo
// Proporciona la hora actual actualizada cada segundo
// y métodos utilitarios para comparaciones de fechas

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimeService {
  // Signal con la hora actual, actualizada cada segundo
  private _currentTime = signal<Date>(new Date());
  readonly currentTime = this._currentTime.asReadonly();

  constructor() {
    // Actualizar la hora cada segundo (solo en el navegador)
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this._currentTime.set(new Date());
      }, 1000);
    }
  }

  /**
   * Determina si una fecha dada es hoy
   */
  isToday(dateString: string): boolean {
    const orderDate = new Date(dateString);
    return orderDate.toDateString() === this.currentTime().toDateString();
  }

  /**
   * Determina si una fecha es anterior a hoy
   */
  isBeforeToday(dateString: string): boolean {
    const orderDate = new Date(dateString);
    const today = this.currentTime();
    return orderDate.toDateString() !== today.toDateString() &&
           orderDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  /**
   * Determina si una fecha es posterior a hoy
   */
  isAfterToday(dateString: string): boolean {
    const orderDate = new Date(dateString);
    const today = this.currentTime();
    return orderDate.toDateString() !== today.toDateString() &&
           orderDate > new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  /**
   * Formatea una fecha como hora (HH:mm)
   */
  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Formatea una fecha como fecha corta (dd/mm/yyyy)
   */
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formatea una fecha como fecha completa
   */
  formatFullDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Calcula la diferencia en minutos entre dos fechas
   */
  getMinutesDiff(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / 60000);
  }

  /**
   * Determina si una fecha es urgente (menos de 15 minutos)
   */
  isUrgent(desiredDeliveryTime: string, referenceDate?: Date): boolean {
    if (desiredDeliveryTime === 'inmediatamente') {
      return true;
    }

    const [hours, minutes] = desiredDeliveryTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      return false;
    }

    const now = referenceDate || this.currentTime();
    const deliveryTime = new Date(now);
    deliveryTime.setHours(hours, minutes);

    const diffMs = deliveryTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    return diffMinutes <= 15 && diffMinutes >= 0;
  }
}
