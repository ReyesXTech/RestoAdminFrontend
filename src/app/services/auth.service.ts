// ==========================================
// AUTH SERVICE
// ==========================================
// Servicio para gestión de autenticación
// Endpoints relacionados:
// - POST /api/auth/login
// - POST /api/auth/logout

import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  // Estado de autenticación
  private _isLoggedIn = signal<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false,
  );
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    // Cargar usuario desde localStorage (MOCK)
    // FUTURO: Esto se manejará con tokens JWT
    if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
      const user = localStorage.getItem('user');
      if (user) {
        this._currentUser.set(JSON.parse(user));
      }
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * MOCK: Reemplazar con llamada HTTP POST /api/auth/login
   */
  login(email: string, pass: string): boolean {
    // MOCK: Reemplazar con:
    // return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password: pass });

    if (email === 'admin@resto.com' && pass === 'admin123') {
      this._isLoggedIn.set(true);
      this._currentUser.set({
        id: 1,
        name: 'Admin User',
        fullName: 'Admin User',
        role: 'admin',
        phone: '5550001',
        email: 'admin@resto.com',
      });
      this.persistAuth();
      return true;
    }

    if (email === 'empleado@resto.com' && pass === 'user123') {
      this._isLoggedIn.set(true);
      this._currentUser.set({
        id: 2,
        name: 'Empleado 1',
        fullName: 'Empleado 1',
        role: 'normal',
        phone: '5550002',
        email: 'empleado@resto.com',
      });
      this.persistAuth();
      return true;
    }

    return false;
  }

  /**
   * Cierra la sesión actual
   * MOCK: Reemplazar con llamada HTTP POST /api/auth/logout
   */
  logout(): void {
    // MOCK: Reemplazar con:
    // this.http.post(`${this.apiUrl}/auth/logout`, {}).subscribe(() => { ... });

    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  /**
   * Persiste el estado de autenticación en localStorage
   */
  private persistAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(this._currentUser()));
    }
  }

  /**
   * Limpia el estado de autenticación
   */
  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
    }
  }
}
