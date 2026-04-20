import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { UserResponse, UserRole } from '../../models';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  readonly UserRole = UserRole;

  private dataService = inject(DataService);

  readonly users = this.dataService.users;
  readonly currentUser = this.dataService.currentUser;

  readonly roles: UserRole[] = [UserRole.Admin, UserRole.Operator];

  showDeleteModal = signal(false);
  userToDelete = signal<UserResponse | null>(null);

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: string | null = null;

  formName = '';
  formPhone = '';
  formRole: UserRole = UserRole.Operator;
  formPassword = ''; // solo para crear

  ngOnInit(): void {
    this.dataService.loadUsers();
  }

  openAddModal(): void {
    this.formName = '';
    this.formPhone = '';
    this.formPassword = '';
    this.formRole = UserRole.Operator;
    this.showModal = true;
    this.editingId = null;
    this.modalMode = 'add';
  }

  openEditModal(user: UserResponse): void {
    this.formName = user.fullName;
    this.formPhone = user.phone || '';
    this.formRole = user.role;
    this.formPassword = ''; // no se muestra en edición
    this.showModal = true;
    this.editingId = user.id;
    this.modalMode = 'edit';
  }

  closeModal(): void {
    this.showModal = false;
  }

  async saveUser(): Promise<void> {
    if (!this.formName.trim() || !this.formPhone.trim()) return;

    try {
      if (this.modalMode === 'add') {
        await this.dataService.addUser({
          fullName: this.formName,
          phone: this.formPhone,
          role: this.formRole,
          password: this.formPassword,
        });
      } else if (this.editingId) {
        await this.dataService.updateUser({
          id: this.editingId,
          fullName: this.formName,
          phone: this.formPhone,
          role: this.formRole,
          password: this.formPassword || undefined,
        });
      }
      this.closeModal();
      this.dataService.loadUsers(); // Recargar lista
    } catch (error) {
      console.error('Error saving user', error);
    }
  }

  deleteUser(user: UserResponse): void {
    const current = this.dataService.currentUser();
    if (current?.role !== UserRole.Admin) return;
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  async confirmDelete(): Promise<void> {
    const user = this.userToDelete();
    if (user) {
      try {
        await this.dataService.deleteUser(user.id);
        this.showDeleteModal.set(false);
        this.userToDelete.set(null);
        this.dataService.loadUsers();
      } catch (error) {
        console.error('Error deleting user', error);
      }
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }
}
