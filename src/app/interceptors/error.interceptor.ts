// ==========================================
// ERROR INTERCEPTOR
// ==========================================
// Este interceptor capturará los errores HTTP
// y los mostrará al usuario mediante ToastService.
//
// ESTADO ACTUAL: Solo loguea errores en consola
// PARA ACTIVAR: Descomentar las líneas que usan ToastService
// ==========================================

import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
  HttpHandlerFn
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
// import { ToastService } from '../services/toast.service';

/**
 * Interceptor funcional para manejar errores HTTP
 * Se registra en app.config.ts
 */
export function errorInterceptorFn(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // const toastService = inject(ToastService);
  
  return next(req).pipe(
    // Reintentar peticiones fallidas (opcional)
    retry({ count: 1, delay: 500 }),
    
    catchError((error: HttpErrorResponse) => {
      // ==========================================
      // MODO MOCK: Solo loguear en consola
      // ==========================================
      console.error('HTTP Error:', error);
      
      // Cuando se implemente el backend, descomentar esto:
      // ------------------------------------------
      // let errorMessage = 'Ocurrió un error inesperado';
      // 
      // if (error.error instanceof ErrorEvent) {
      //   // Error del lado del cliente
      //   errorMessage = `Error: ${error.error.message}`;
      // } else {
      //   // Error del lado del servidor
      //   switch (error.status) {
      //     case 400:
      //       errorMessage = 'Solicitud inválida';
      //       if (error.error?.errors) {
      //         Object.values(error.error.errors).forEach(messages => {
      //           (messages as string[]).forEach(msg => console.error(msg));
      //         });
      //       }
      //       break;
      //     case 401:
      //       errorMessage = 'No autorizado. Por favor inicie sesión.';
      //       // Redirigir al login
      //       // router.navigate(['/login']);
      //       break;
      //     case 403:
      //       errorMessage = 'No tiene permisos para realizar esta acción';
      //       break;
      //     case 404:
      //       errorMessage = 'Recurso no encontrado';
      //       break;
      //     case 500:
      //       errorMessage = 'Error del servidor';
      //       break;
      //     default:
      //       errorMessage = `Error ${error.status}: ${error.message}`;
      //   }
      // }
      // 
      // toastService.show(errorMessage, 'error');
      // ------------------------------------------
      
      return throwError(() => error);
    })
  );
}

/**
 * Clase interceptor (alternativa funcional)
 * Se puede usar si se prefiere la sintaxis de clases
 */
@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  // private toastService = inject(ToastService);
  
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // ==========================================
        // MODO MOCK: Solo loguear en consola
        // ==========================================
        console.error('HTTP Error:', error);
        
        // Cuando se implemente el backend, descomentar:
        // let errorMessage = 'Ocurrió un error inesperado';
        // if (error.status >= 400) {
        //   errorMessage = error.error?.message || `Error ${error.status}`;
        //   this.toastService.show(errorMessage, 'error');
        // }
        
        return throwError(() => error);
      })
    );
  }
}

/**
 * Utilidad para manejar errores en subscripciones
 * Se puede usar directamente en los componentes
 */
export function handleHttpError(
  error: HttpErrorResponse,
  // toastService?: ToastService
): void {
  console.error('HTTP Error:', error);
  
  // Cuando se implemente el backend:
  // let errorMessage = 'Ocurrió un error inesperado';
  // if (error.error?.message) {
  //   errorMessage = error.error.message;
  // }
  // toastService?.show(errorMessage, 'error');
}
