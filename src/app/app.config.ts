import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { jwtInterceptorFn, errorInterceptorFn } from './interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      // Interceptors para todas las peticiones HTTP
      withInterceptors([
        errorInterceptorFn,  // Manejo de errores
        jwtInterceptorFn     // Token JWT (actualmente en modo mock)
      ])
    ),
    provideClientHydration(withEventReplay())
  ]
};
