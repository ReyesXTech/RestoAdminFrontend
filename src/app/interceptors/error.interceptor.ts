import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

// ===============================
// Interceptor
// ===============================
export const errorInterceptorFn: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const toastService = inject(ToastService);
  const router = inject(Router);

  return next(req).pipe(
    retry({ count: 1, delay: 500 }),

    catchError((error: HttpErrorResponse) => {
      let userMessage = 'Ocurrió un error inesperado';
      const body = error.error;

      if (body) {
        if (typeof body === 'string') {
          userMessage = body;
        } else if (body.message) {
          userMessage = body.message;
        } else if (body.detail) {
          userMessage = body.detail;
        } else if (body.title) {
          userMessage = body.title;
        } else if (body.errors) {
          const messages = Object.values(body.errors).flat();
          if (messages.length > 0) {
            userMessage = messages.join('. ');
          }
        }
      }

      switch (error.status) {
        case 400:
          userMessage = userMessage || 'Solicitud inválida';
          break;
        case 401:
          userMessage = 'No autorizado. Por favor inicie sesión.';
          router.navigate(['/login']);
          break;
        case 403:
          userMessage = userMessage || 'No tiene permisos para esta acción';
          break;
        case 404:
          userMessage = userMessage || 'Recurso no encontrado';
          break;
        case 409:
          userMessage = userMessage || 'Conflicto';
          break;
        case 500:
          userMessage = 'Error interno del servidor';
          break;
        default:
          userMessage = `Error ${error.status}: ${userMessage}`;
      }

      toastService.show(userMessage, 'error');
      return throwError(() => error);
    }),
  );
};
