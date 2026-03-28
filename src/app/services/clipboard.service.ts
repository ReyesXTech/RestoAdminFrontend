// ==========================================
// CLIPBOARD SERVICE
// ==========================================
// Servicio para operaciones con el portapapeles
// Centraliza la lógica de copiado para evitar duplicación

import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private toastService = inject(ToastService);

  /**
   * Copia un texto al portapapeles
   */
  async copyText(text: string, successMessage?: string): Promise<boolean> {
    if (!text) return false;

    try {
      await navigator.clipboard.writeText(text);
      if (successMessage) {
        this.toastService.show(successMessage, 'success');
      }
      return true;
    } catch {
      // Fallback para navegadores que no soportan Clipboard API
      return this.fallbackCopy(text, successMessage);
    }
  }

  /**
   * Copia un número de teléfono al portapapeles
   * Método especializado con mensaje predefinido
   */
  async copyPhone(phone: string): Promise<boolean> {
    return this.copyText(
      phone,
      `Teléfono ${phone} copiado`
    );
  }

  /**
   * Método fallback para copiar cuando la Clipboard API no está disponible
   */
  private fallbackCopy(text: string, successMessage?: string): boolean {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful && successMessage) {
        this.toastService.show(successMessage, 'success');
      }
      
      return successful;
    } catch {
      this.toastService.show('Error al copiar', 'error');
      return false;
    }
  }
}
