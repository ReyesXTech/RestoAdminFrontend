// ==========================================
// EXCHANGE SERVICE
// ==========================================
// Servicio para gestión de tasas de cambio
// Endpoints relacionados:
// - GET /api/exchange-rates (obtener tasas)
// - PUT /api/exchange-rates (actualizar tasas)

import { Injectable, signal } from '@angular/core';
import { ExchangeRate } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  // Estado de tasas de cambio
  private _exchangeRate = signal<ExchangeRate>({
    usdToCup: 280,
    eurToCup: 300,
    lastUpdatedUtc: new Date().toISOString(),
  });

  readonly exchangeRate = this._exchangeRate.asReadonly();

  constructor() {
    // Cargar tasas desde localStorage (MOCK)
    // FUTURO: this.loadExchangeRate()
    this.loadExchangeRate();
  }

  /**
   * Actualiza las tasas de cambio
   * MOCK: Reemplazar con llamada HTTP PUT /api/exchange-rates
   */
  updateExchangeRate(usdToCup: number, eurToCup: number): void {
    // FUTURO:
    // return this.http.put(`${this.apiUrl}/exchange-rates`, { usd, eur });

    this._exchangeRate.set({
      usdToCup,
      eurToCup,
      lastUpdatedUtc: new Date().toISOString(),
    });
    this.persistExchangeRate();
  }

  /**
   * Carga las tasas de cambio desde localStorage
   * MOCK: Reemplazar con llamada HTTP GET /api/exchange-rates
   */
  loadExchangeRate(): void {
    // FUTURO:
    // this.http.get<ExchangeRate>(`${this.apiUrl}/exchange-rates`).subscribe(rate => {
    //   this._exchangeRate.set(rate);
    // });

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('exchangeRate');
      if (stored) {
        this._exchangeRate.set(JSON.parse(stored));
      }
    }
  }

  /**
   * Persiste las tasas de cambio en localStorage
   */
  private persistExchangeRate(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('exchangeRate', JSON.stringify(this._exchangeRate()));
    }
  }

  /**
   * Obtiene el valor de una moneda específica
   */
  getRate(currency: 'usd' | 'eur'): number {
    return currency === 'usd' ? this._exchangeRate().usdToCup : this._exchangeRate().eurToCup;
  }

  /**
   * Convierte un monto de la moneda local a una moneda extranjera
   */
  convertToLocal(currency: 'usd' | 'eur', amount: number): number {
    const rate = this.getRate(currency);
    return amount * rate;
  }

  /**
   * Convierte un monto de la moneda local desde una moneda extranjera
   */
  convertFromLocal(currency: 'usd' | 'eur', amount: number): number {
    const rate = this.getRate(currency);
    return amount / rate;
  }
}
