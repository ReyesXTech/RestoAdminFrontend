// ==========================================
// USERS SERVICE
// ==========================================
// Servicio para gestión de usuarios
// Endpoints relacionados:
// - GET /api/users (obtener todos)
// - GET /api/users/{id} (obtener uno)
// - POST /api/users (crear)
// - PUT /api/users/{id} (actualizar)
// - DELETE /api/users/{id} (eliminar)

import { Injectable, signal } from '@angular/core';
import { User } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  // Estado de usuarios
  private _users = signal<User[]>([
    {
      id: 1,
      name: 'Admin User',
      fullName: 'Admin User',
      role: 'admin',
      phone: '5550001',
      email: 'admin@resto.com',
    },
    {
      id: 2,
      name: 'Empleado 1',
      fullName: 'Empleado 1',
      role: 'normal',
      phone: '5550002',
      email: 'empleado@resto.com',
    },
  ]);

  readonly users = this._users.asReadonly();

  /**
   * Agrega un nuevo usuario
   * MOCK: Reemplazar con llamada HTTP POST /api/users
   */
  addUser(user: Omit<User, 'id'>): void {
    // FUTURO:
    // this.http.post<User>(`${this.apiUrl}/users`, user).subscribe(newUser => {
    //   this._users.update(users => [...users, newUser]);
    // });

    const newId = Math.max(...this._users().map((u) => u.id), 0) + 1;
    this._users.update((users) => [
      ...users,
      { ...user, id: newId, fullName: user.fullName || user.name || '' },
    ]);
  }

  /**
   * Actualiza un usuario existente
   * MOCK: Reemplazar con llamada HTTP PUT /api/users/{id}
   */
  updateUser(user: User): void {
    // FUTURO:
    // this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user).subscribe(updated => {
    //   this._users.update(users => users.map(u => u.id === user.id ? updated : u));
    // });

    this._users.update((users) => users.map((u) => (u.id === user.id ? user : u)));
  }

  /**
   * Elimina un usuario
   * MOCK: Reemplazar con llamada HTTP DELETE /api/users/{id}
   */
  deleteUser(id: number): void {
    // FUTURO:
    // this.http.delete(`${this.apiUrl}/users/${id}`).subscribe(() => {
    //   this._users.update(users => users.filter(u => u.id !== id));
    // });

    this._users.update((users) => users.filter((u) => u.id !== id));
  }

  /**
   * Obtiene un usuario por ID
   */
  getUserById(id: number): User | undefined {
    return this._users().find((u) => u.id === id);
  }

  /**
   * Obtiene usuarios por rol
   */
  getUsersByRole(role: User['role']): User[] {
    return this._users().filter((u) => u.role === role);
  }
}
