import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { User, UserRole } from '../../models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent {
  // Exponer el enum para usarlo en la plantilla HTML
  readonly UserRole = UserRole;

  private dataService = inject(DataService);

  readonly users = this.dataService.users;
  readonly currentUser = this.dataService.currentUser;

  // CORREGIDO: usar el enum correctamente
  readonly roles: UserRole[] = [UserRole.Admin, UserRole.Operator];

  // Delete confirmation modal
  showDeleteModal = signal(false);
  userToDelete = signal<User | null>(null);

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';

  // CORREGIDO: permitir string | number | null
  editingId: string | number | null = null;

  formName = '';
  formPhone = '';

  // CORREGIDO: usar el tipo UserRole directamente
  formRole: UserRole = UserRole.Operator;

  openAddModal(): void {
    this.formName = '';
    this.formPhone = '';
    // this.formEmail = '';  // eliminado
    this.formRole = UserRole.Operator; // CORREGIDO
    this.showModal = true;
    this.editingId = null;
    this.modalMode = 'add';
  }

  openEditModal(user: User): void {
    this.formName = user.fullName;
    // CORREGIDO: manejar phone opcional
    this.formPhone = user.phone || '';
    // ELIMINADO: this.formEmail = user.email;
    this.formRole = user.role;
    this.showModal = true;
    // CORREGIDO: permitir cualquier tipo de id
    this.editingId = user.id;
    this.modalMode = 'edit';
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    if (!this.formName.trim() || !this.formPhone.trim()) return;

    const itemData = {
      name: this.formName,
      fullName: this.formName,
      phone: this.formPhone,
      role: this.formRole,
    };

    if (this.modalMode === 'add') {
      this.dataService.addUser(itemData);
    } else if (this.editingId !== null) {
      this.dataService.updateUser({
        id: this.editingId,
        ...itemData,
      });
    }

    this.closeModal();
  }

  deleteUser(user: User): void {
    const current = this.dataService.currentUser();
    if (current?.role !== UserRole.Admin) {
      return;
    }
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  confirmDelete(): void {
    const user = this.userToDelete();
    if (user) {
      this.dataService.deleteUser(user.id);
      this.showDeleteModal.set(false);
      this.userToDelete.set(null);
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  roleBadgeClass(role: UserRole): string {
    const map: Record<UserRole, string> = {
      [UserRole.Admin]: 'bg-purple-100 text-purple-700 border border-purple-300',
      [UserRole.Operator]: 'bg-blue-100 text-blue-700 border border-blue-300',
    };
    return map[role];
  }
}
