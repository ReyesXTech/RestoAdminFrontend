import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { User } from '../../models/models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent {
  private dataService = inject(DataService);

  readonly users = this.dataService.users;
  readonly currentUser = this.dataService.currentUser;
  readonly roles: User['role'][] = ['admin', 'normal'];

  // Delete confirmation modal
  showDeleteModal = signal(false);
  userToDelete = signal<User | null>(null);

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: number | null = null;
  formName = '';
  formPhone = '';
  formEmail = '';
  formRole: User['role'] = 'normal';

  openAddModal(): void {
    this.formName = '';
    this.formPhone = '';
    this.formEmail = '';
    this.formRole = 'normal';
    this.showModal = true;
    this.editingId = null;
    this.modalMode = 'add';
  }

  // Add editUser method to open the edit modal
  openEditModal(user: User): void {
    this.formName = user.fullName;
    this.formPhone = user.phone;
    this.formEmail = user.email;
    this.formRole = user.role;
    this.showModal = true;
    this.editingId = user.id;
    this.modalMode = 'edit';
  }

  closeModal(): void {
    this.showModal = false;
  }

  // Update saveUser to handle editing existing users
  saveUser(): void {
    if (!this.formName.trim() || !this.formPhone.trim()) return;

    const itemData = {
      name: this.formName,
      fullName: this.formName,
      phone: this.formPhone,
      email: this.formEmail,
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
    if (current?.role !== 'admin') {
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

  roleBadgeClass(role: User['role']): string {
    const map: Record<User['role'], string> = {
      admin: 'bg-purple-100 text-purple-700 border border-purple-300',
      normal: 'bg-blue-100 text-blue-700 border border-blue-300',
    };
    return map[role];
  }
}
