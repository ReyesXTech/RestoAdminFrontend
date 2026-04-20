import { UserRole } from './common.models';

// ------------------- Crear usuario -------------------
export interface CreateUserCommand {
  fullName: string;
  phone: string;
  role: UserRole;
  password: string;
}

// ------------------- Listar todos los usuarios -------------------
export interface GetAllUsersQuery {} // vacío

// Respuesta para GetById y GetAll
export interface UserResponse {
  id: string;
  fullName: string;
  phone?: string | null;
  role: UserRole; // antes string → ahora enum
  createdAtUtc: string;
  lastLoginUtc?: string | null;
  isActive: boolean;
}

// ------------------- NUEVAS queries -------------------
export interface GetUserByIdQuery {
  id: string;
}

// ------------------- NUEVOS comandos -------------------
export interface UpdateUserCommand {
  id: string;
  fullName: string;
  phone?: string | null;
  role?: UserRole | null;
  password?: string | null;
  isActive?: boolean | null;
}

export interface DeleteUserCommand {
  id: string;
}
