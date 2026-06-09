import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { ThemeService, Theme } from '../services/theme.service';
import { UserRole } from '../models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  private router = inject(Router);
  private dataService = inject(DataService);
  private themeService = inject(ThemeService);

  currentUser = this.dataService.currentUser;
  currentTheme = this.themeService.currentTheme;
  previewEnabled = this.themeService.previewEnabled;
  settingsOpen = signal(false);
  sidebarOpen = signal(false);

  readonly pageTitles: Record<string, string> = {
    '/pedidos': 'Pedidos',
    '/productos': 'Productos',
    '/usuarios': 'Usuarios',
    '/cancelados': 'Pedidos Cancelados',
    '/historial': 'Historial',
  };

  readonly UserRole = UserRole;

  get pageTitle(): string {
    return this.pageTitles[this.router.url] ?? 'Rey Sushi';
  }

  logout(): void {
    this.dataService.logout();
  }

  toggleSettings(): void {
    this.settingsOpen.update((open) => !open);
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  togglePreview(): void {
    this.themeService.togglePreview();
  }

  readonly isAdmin = computed(() => {
    const user = this.currentUser();
    if (!user) return false;
    // El rol puede venir como string ('Admin') o como número (UserRole.Admin = 1)
    if (typeof user.role === 'number') {
      return user.role === UserRole.Admin;
    }
    return (user.role as string)?.toLowerCase() === 'admin';
  });
}
