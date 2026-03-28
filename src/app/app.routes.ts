import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'pedidos', pathMatch: 'full' },
      {
        path: 'pedidos',
        loadComponent: () =>
          import('./pages/pedidos/pedidos.component').then(m => m.PedidosComponent),
      },
      {
        path: 'cancelados',
        loadComponent: () =>
          import('./pages/cancelados/cancelados.component').then(m => m.CanceladosComponent),
      },
      {
        path: 'historial',
        loadComponent: () =>
          import('./pages/historial/historial.component').then(m => m.HistorialComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./pages/menu/menu.component').then(m => m.MenuComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
