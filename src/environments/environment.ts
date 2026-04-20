// ==========================================
// ENVIRONMENT CONFIGURATION
// ==========================================

export const environment = {
  production: false,
  // URL base del backend .NET
  apiUrl: 'https://localhost:5001/api',
  // Timeout para peticiones HTTP (en ms)
  httpTimeout: 30000,
  // Configuración de reintentos
  maxRetries: 3,
  retryDelay: 1000,
};
