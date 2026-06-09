import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { UserResponse, UserRole } from '../../models';
import { TooltipService } from '../../services/tooltip.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  readonly UserRole = UserRole;

  private tooltipService = inject(TooltipService);
  private dataService = inject(DataService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  readonly users = this.dataService.users;
  readonly currentUser = this.dataService.currentUser;

  readonly roles: UserRole[] = [UserRole.Admin, UserRole.Operador];

  // Lista de códigos de país
  readonly countryCodes = [
    { code: '+53', name: 'Cuba' },
    { code: '+1', name: 'EE.UU./Canadá' },
    { code: '+34', name: 'España' },
    { code: '+52', name: 'México' },
    { code: '+54', name: 'Argentina' },
  ];

  showDeleteModal = signal(false);
  userToDelete = signal<UserResponse | null>(null);

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editingId: string | null = null;

  formName = '';
  formPhoneCountryCode = '+53';
  formPhoneNationalNumber = '';
  formRole: UserRole = UserRole.Operador;
  formPassword = '';

  ngOnInit(): void {
    const user = this.currentUser();
    if (!this.isAdminUser(user)) {
      this.toastService.show('Acceso restringido a administradores', 'error');
      this.router.navigate(['/pedidos']);
      return;
    }
    this.dataService.loadUsers();
  }

  private isAdminUser(user: any): boolean {
    if (!user) return false;
    if (typeof user.role === 'number') {
      return user.role === UserRole.Admin;
    }
    if (typeof user.role === 'string') {
      return user.role.toLowerCase() === 'admin';
    }
    return false;
  }

  openAddModal(): void {
    this.formName = '';
    this.formPhoneCountryCode = '+53';
    this.formPhoneNationalNumber = '';
    this.formPassword = '';
    this.formRole = UserRole.Operador;
    this.showModal = true;
    this.editingId = null;
    this.modalMode = 'add';
  }

  openEditModal(user: UserResponse): void {
    this.formName = user.fullName;
    // Dividir el teléfono en código y número
    const phoneInfo = this.parsePhone(user.phone || '');
    this.formPhoneCountryCode = phoneInfo.countryCode;
    this.formPhoneNationalNumber = phoneInfo.nationalNumber;
    this.formRole = this.normalizeRole(user.role);
    this.formPassword = '';
    this.showModal = true;
    this.editingId = user.id;
    this.modalMode = 'edit';
  }

  closeModal(): void {
    this.showModal = false;
  }

  getRoleName(role: any): string {
    if (typeof role === 'number') {
      return role === UserRole.Admin ? 'Admin' : 'Operario';
    }
    if (typeof role === 'string') {
      return role.toLowerCase() === 'admin' ? 'Admin' : 'Operario';
    }
    return 'Operario';
  }

  getRoleBadgeClass(role: any): string {
    if (typeof role === 'number') {
      return role === UserRole.Admin ? 'admin' : 'operario';
    }
    if (typeof role === 'string') {
      const normalized = role.trim().toLowerCase();
      if (normalized === 'admin') return 'admin';
      if (normalized === 'operador' || normalized === 'operario') return 'operario';
    }
    return 'operario';
  }

  private normalizeRole(role: any): UserRole {
    if (typeof role === 'number') {
      return role;
    }
    if (typeof role === 'string') {
      const normalized = role.trim().toLowerCase();
      if (normalized === 'admin') return UserRole.Admin;
      if (normalized === 'operador' || normalized === 'operario') return UserRole.Operador;
    }
    return UserRole.Operador;
  }

  private parsePhone(phone: string): { countryCode: string; nationalNumber: string } {
    // Buscar código de país conocido al inicio
    const matchedCode = this.countryCodes.find((c) => phone.startsWith(c.code));
    if (matchedCode) {
      // Extraer el número nacional (el resto después del código) y quitar espacios
      const rawNational = phone.substring(matchedCode.code.length).replace(/\s/g, '');
      return {
        countryCode: matchedCode.code,
        nationalNumber: rawNational,
      };
    }
    // Fallback: asumimos +53 y el número completo (sin espacios)
    const cleanPhone = phone.replace(/\s/g, '');
    return { countryCode: '+53', nationalNumber: cleanPhone };
  }

  async saveUser(): Promise<void> {
    if (!this.formName.trim() || !this.formPhoneNationalNumber.trim()) return;

    const fullPhone = this.formPhoneCountryCode + this.formPhoneNationalNumber;

    try {
      if (this.modalMode === 'add') {
        await this.dataService.addUser({
          fullName: this.formName,
          phone: fullPhone,
          role: this.formRole,
          password: this.formPassword,
        });
      } else if (this.editingId) {
        await this.dataService.updateUser({
          id: this.editingId,
          fullName: this.formName,
          phone: fullPhone,
          role: this.formRole,
          password: this.formPassword || undefined,
        });
      }
      this.closeModal();
      this.dataService.loadUsers();
    } catch (error) {
      console.error('Error saving user', error);
    }
  }

  deleteUser(user: UserResponse): void {
    if (!this.isAdminUser(this.currentUser())) return;
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

  showActionTooltip(event: MouseEvent, action: 'edit' | 'delete'): void {
    const button = event.currentTarget as HTMLElement;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top - 8;
    const text = action === 'edit' ? 'Editar' : 'Eliminar';
    this.tooltipService.show(text, x, y);
  }

  hideActionTooltip(): void {
    this.tooltipService.hide();
  }
}
