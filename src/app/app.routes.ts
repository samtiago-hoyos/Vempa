import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  // Vista 1: Catálogo público
  {
    path: '',
    loadComponent: () => import('./pages/catalogo/catalogo.component').then((m) => m.CatalogoComponent),
  },
  // Vista 2: Detalle de producto
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./pages/producto-detalle/producto-detalle.component').then((m) => m.ProductoDetalleComponent),
  },
  // Vista 3: Login / Registro de clientes
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/cliente-login/cliente-login.component').then((m) => m.ClienteLoginComponent),
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/cliente-registro/cliente-registro.component').then((m) => m.ClienteRegistroComponent),
  },
  // Vista 4: Favoritos del cliente
  {
    path: 'favoritos',
    loadComponent: () => import('./pages/favoritos/favoritos.component').then((m) => m.FavoritosComponent),
  },
  // Vista 6: Lista de productos (Admin - Protegida por authGuard)
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin-productos/admin-productos.component').then((m) => m.AdminProductosComponent),
  },
  // Vista 7: Formulario crear/editar producto (Admin - Protegida por authGuard)
  {
    path: 'admin/productos/nuevo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin-producto-form/admin-producto-form.component').then(
        (m) => m.AdminProductoFormComponent
      ),
  },
  {
    path: 'admin/productos/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/admin-producto-form/admin-producto-form.component').then(
        (m) => m.AdminProductoFormComponent
      ),
  },
  // Ruta comodín para redireccionar cualquier URL desconocida al catálogo
  { path: '**', redirectTo: '' },
];