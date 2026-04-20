// Respuesta del query GET /api/exchangerate/today
export interface ExchangeRateResponse {
  usdToCup: number; // antes UsdtoCup → camelCase
  eurToCup: number; // antes EurToCup
  lastUpdatedUtc: string; // antes LastUpdatedUtc
}

// Comando para actualizar las tasas (Upsert)
export interface UpsertTodayExchangeRateCommand {
  usdToCup: number;
  eurToCup: number;
}
