import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateUserCommand,
  UserResponse,
  UpdateUserCommand,
  DeleteUserCommand,
  GetUserByIdQuery,
} from '../models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _users = signal<UserResponse[]>([]);
  readonly users = this._users.asReadonly();

  loadAllUsers(): void {
    firstValueFrom(this.http.get<UserResponse[]>(`${this.apiUrl}/users`))
      .then((data) => this._users.set(data))
      .catch((err) => console.error('Error loading users', err));
  }

  getUserById(query: GetUserByIdQuery): Promise<UserResponse> {
    return firstValueFrom(this.http.get<UserResponse>(`${this.apiUrl}/users/${query.id}`));
  }

  createUser(command: CreateUserCommand): Promise<string> {
    return firstValueFrom(this.http.post<string>(`${this.apiUrl}/users`, command));
  }

  updateUser(command: UpdateUserCommand): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.apiUrl}/users/${command.id}`, command));
  }

  deleteUser(command: DeleteUserCommand): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/users/${command.id}`));
  }
}
