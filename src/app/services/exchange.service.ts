import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ExchangeRateResponse, UpsertTodayExchangeRateCommand } from '../models';

@Injectable({ providedIn: 'root' })
export class ExchangeService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _exchangeRate = signal<ExchangeRateResponse | null>(null);
  readonly exchangeRate = this._exchangeRate.asReadonly();

  constructor() {
    this.loadExchangeRate();
  }

  loadExchangeRate(): void {
    firstValueFrom(this.http.get<ExchangeRateResponse>(`${this.apiUrl}/exchangerates/current`))
      .then((rate) => this._exchangeRate.set(rate))
      .catch((err) => console.error('Error loading exchange rate', err));
  }

  updateExchangeRate(command: UpsertTodayExchangeRateCommand): void {
    firstValueFrom(this.http.put(`${this.apiUrl}/exchangerates/current`, command))
      .then(() => this.loadExchangeRate())
      .catch((err) => console.error('Error updating exchange rate', err));
  }

  getRate(currency: 'usd' | 'eur'): number {
    const rate = this._exchangeRate();
    if (!rate) return 0;
    return currency === 'usd' ? rate.usdToCup : rate.eurToCup;
  }

  convertToLocal(currency: 'usd' | 'eur', amount: number): number {
    return amount * this.getRate(currency);
  }

  convertFromLocal(currency: 'usd' | 'eur', amount: number): number {
    const rate = this.getRate(currency);
    return rate ? amount / rate : 0;
  }
}
