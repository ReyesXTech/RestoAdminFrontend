// ==========================================
// JWT INTERCEPTOR
// ==========================================
// Este interceptor se encargará de añadir el token JWT
// a todas las peticiones HTTP cuando se implemente el backend real.
//
// ESTADO ACTUAL: Solo pasa las peticiones sin modificar (mock mode)
// PARA ACTIVAR: Descomentar la línea que añade el Authorization header
// ==========================================

import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHandlerFn
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataService } from '../services/data.service';

/**
 * Interceptor funcional para añadir token JWT a las peticiones
 * Se registra en app.config.ts
 */
export function jwtInterceptorFn(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // const dataService = inject(DataService);
  
  // ==========================================
  // MODO MOCK: No modificar las peticiones
  // ==========================================
  // Cuando se implemente el backend, descomentar esto:
  // ------------------------------------------
  // const currentUser = dataService.currentUser();
  // const token = localStorage.getItem('authToken');
  // 
  // if (token && currentUser) {
  //   req = req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json'
  //     }
  //   });
  // }
  // ------------------------------------------
  
  // Por ahora, solo pasar la petición sin modificar
  return next(req);
}

/**
 * Clase interceptor (alternativa funcional)
 * Se puede usar si se prefiere la sintaxis de clases
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private dataService = inject(DataService);
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // ==========================================
    // MODO MOCK: No modificar las peticiones
    // ==========================================
    // Cuando se implemente el backend, descomentar esto:
    // ------------------------------------------
    // const token = localStorage.getItem('authToken');
    // if (token) {
    //   req = req.clone({
    //     setHeaders: {
    //       Authorization: `Bearer ${token}`
    //     }
    //   });
    // }
    // ------------------------------------------
    
    return next.handle(req);
  }
}
