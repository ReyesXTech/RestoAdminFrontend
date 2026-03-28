// ==========================================
// ENVIRONMENT CONFIGURATION - PRODUCTION
// ==========================================

export const environment = {
  production: true,
  // URL base del backend .NET en producción
  apiUrl: 'https://api.reysushi.com/api',
  // Timeout para peticiones HTTP (en ms)
  httpTimeout: 30000,
  // Configuración de reintentos
  maxRetries: 3,
  retryDelay: 1000
};
