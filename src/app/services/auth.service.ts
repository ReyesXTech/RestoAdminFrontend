import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { LoginCommand, LoginResponse, UserResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private _isLoggedIn = signal<boolean>(false);
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private _currentUser = signal<UserResponse | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  private _token = signal<string | null>(null);

  constructor() {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');
      if (token && user) {
        this._token.set(token);
        this._currentUser.set(JSON.parse(user));
        this._isLoggedIn.set(true);
      }
    }
  }

  async login(credentials: LoginCommand): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials),
      );
      this._token.set(response.token);
      const user: UserResponse = {
        id: response.userId,
        fullName: response.fullName,
        phone: null,
        role: response.role as any,
        createdAtUtc: new Date().toISOString(),
        lastLoginUtc: null,
        isActive: true,
      };
      this._currentUser.set(user);
      this._isLoggedIn.set(true);
      this.persistAuth(response.token, user);
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    const token = this._token();
    if (token) {
      firstValueFrom(this.http.post(`${this.apiUrl}/auth/logout`, {})).finally(() =>
        this.clearAuth(),
      );
    } else {
      this.clearAuth();
    }
  }

  private clearAuth(): void {
    this._token.set(null);
    this._currentUser.set(null);
    this._isLoggedIn.set(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  private persistAuth(token: string, user: UserResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getToken(): string | null {
    return this._token();
  }
}
