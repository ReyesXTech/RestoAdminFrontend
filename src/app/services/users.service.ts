import { Injectable, signal } from '@angular/core';
import { User, UserRole } from '../models/models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private _users = signal<User[]>([
    {
      id: '1',
      fullName: 'Admin',
      role: UserRole.Admin,
      phone: '5550001',
      isActive: true,
    },
    {
      id: '2',
      fullName: 'Empleado 1',
      role: UserRole.Operator,
      phone: '5550002',
      isActive: true,
    },
  ]);

  readonly users = this._users.asReadonly();

  addUser(user: Omit<User, 'id'>): void {
    const newId = (Math.max(...this._users().map((u) => Number(u.id)), 0) + 1).toString();
    this._users.update((users) => [...users, { ...user, id: newId }]);
  }

  updateUser(user: User): void {
    this._users.update((users) => users.map((u) => (u.id === user.id ? user : u)));
  }

  deleteUser(id: string): void {
    this._users.update((users) => users.filter((u) => u.id !== id));
  }

  getUserById(id: string): User | undefined {
    return this._users().find((u) => u.id === id);
  }

  getUsersByRole(role: UserRole): User[] {
    return this._users().filter((u) => u.role === role);
  }
}
