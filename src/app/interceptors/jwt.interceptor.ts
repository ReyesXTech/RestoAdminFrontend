// ==========================================
// JWT INTERCEPTOR
// ==========================================
// Añade automáticamente el token JWT a todas las peticiones salientes
// cuando el usuario está autenticado.
// ==========================================

import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor funcional para añadir token JWT a las peticiones
 * Registrado en app.config.ts
 */
export function jwtInterceptorFn(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  // Inyectamos el AuthService directamente en el interceptor funcional
  const authService = inject(AuthService);

  const token = authService.getToken(); // Método que obtiene el token almacenado

  // Si hay token, clonamos la petición y añadimos el header Authorization
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
}

/**
 * Interceptor de clase (alternativa por si se prefiere usar clases)
 * También se puede usar con HTTP_INTERCEPTORS en módulos tradicionales
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(req);
  }
}

/**
 * Interceptor de errores (opcional, ya lo tienes en otro archivo)
 * Maneja errores 401 para redirigir al login automáticamente
 */
export function errorInterceptorFn(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expirado o inválido: limpiar almacenamiento y redirigir
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    }),
  );
}
