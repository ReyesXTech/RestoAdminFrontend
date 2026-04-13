import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  private _isLoggedIn = signal<boolean>(
    typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') === 'true' : false,
  );
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private _currentUser = signal<User | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor() {
    if (typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true') {
      const user = localStorage.getItem('user');
      if (user) this._currentUser.set(JSON.parse(user));
    }
  }

  /**
   * Login con fullName y password (MOCK)
   * FUTURO: POST /api/auth/login
   */
  login(fullName: string, password: string): boolean {
    // MOCK: usuarios de prueba (sin email)
    if (fullName === 'Admin User' && password === 'admin123') {
      this._isLoggedIn.set(true);
      const user: User = {
        id: '1',
        fullName: 'Admin User',
        role: UserRole.Admin,
        phone: '5550001',
        isActive: true,
      };
      this._currentUser.set(user);
      this.persistAuth();
      return true;
    }
    if (fullName === 'Empleado 1' && password === 'user123') {
      this._isLoggedIn.set(true);
      const user: User = {
        id: '2',
        fullName: 'Empleado 1',
        role: UserRole.Operator,
        phone: '5550002',
        isActive: true,
      };
      this._currentUser.set(user);
      this.persistAuth();
      return true;
    }
    return false;
  }

  logout(): void {
    this._isLoggedIn.set(false);
    this._currentUser.set(null);
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  private persistAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(this._currentUser()));
    }
  }

  private clearAuth(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
    }
  }
}
