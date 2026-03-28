import { Injectable, signal, Signal } from '@angular/core';

export interface ToastNotification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastNotification[]>([]);
  readonly toasts: Signal<ToastNotification[]> = this._toasts.asReadonly();

  private toastId = 0;

  show(message: string, type: 'success' | 'error' | 'info' = 'success'): void {
    const id = ++this.toastId;
    this._toasts.update(toasts => [...toasts, { id, message, type }]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      this.dismiss(id);
    }, 3000);
  }

  dismiss(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }

  getToasts(): ToastNotification[] {
    return this._toasts();
  }
}
