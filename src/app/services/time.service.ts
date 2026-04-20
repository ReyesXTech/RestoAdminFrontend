// time.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimeService {
  private _currentTime = signal<Date>(new Date());
  readonly currentTime = this._currentTime.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => this._currentTime.set(new Date()), 1000);
    }
  }

  /**
   * Formatea una hora en formato 12h con AM/PM (ej. "02:30 p. m.")
   */
  formatTime(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleTimeString('es-CU', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Formatea una fecha como día/mes/año (ej. "19/04/2026")
   */
  formatDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString('es-CU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Formatea una fecha con día de la semana y mes en texto (ej. "domingo, 19 de abril de 2026")
   */
  formatFullDate(value: string | Date | null | undefined): string {
    if (!value) return '';
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString('es-CU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // --- Métodos de comparación (sin cambios) ---
  isToday(dateString: string): boolean {
    const orderDate = new Date(dateString);
    return orderDate.toDateString() === this.currentTime().toDateString();
  }

  isBeforeToday(dateString: string): boolean {
    const orderDate = new Date(dateString);
    const today = this.currentTime();
    return (
      orderDate.toDateString() !== today.toDateString() &&
      orderDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  }

  isAfterToday(dateString: string): boolean {
    const orderDate = new Date(dateString);
    const today = this.currentTime();
    return (
      orderDate.toDateString() !== today.toDateString() &&
      orderDate > new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  }

  getMinutesDiff(date1: string | Date, date2: string | Date): number {
    const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
    const diffMs = d2.getTime() - d1.getTime();
    return Math.floor(diffMs / 60000);
  }

  isUrgent(desiredDeliveryTime: string | null | undefined, referenceDate?: Date): boolean {
    if (!desiredDeliveryTime) return false;
    if (desiredDeliveryTime === 'inmediatamente') return true;

    const [hours, minutes] = desiredDeliveryTime.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return false;

    const now = referenceDate || this.currentTime();
    const deliveryTime = new Date(now);
    deliveryTime.setHours(hours, minutes, 0, 0);

    const diffMinutes = this.getMinutesDiff(now, deliveryTime);
    return diffMinutes <= 15 && diffMinutes >= 0;
  }
}
