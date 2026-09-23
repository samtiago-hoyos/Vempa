import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pagina-admin">
      <header class="admin-encabezado">
        <h1>VEMPA · Panel admin</h1>
        <div class="admin-encabezado__acciones">
          <a class="boton-enlace" routerLink="/admin/productos/nuevo">+ Nuevo producto</a>
          <button (click)="auth.signOut()">Cerrar sesión</button>
        </div>
      </header>

      <p class="mensaje-estado mensaje-estado--error" *ngIf="error">{{ error }}</p>

      <section class="lista-productos-admin">
        <h2>Productos ({{ productos.length }})</h2>
        <p *ngIf="cargando">Cargando…</p>
        <table *ngIf="!cargando">
          <thead>
            <tr>
              <th>Foto</th>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock total</th>
              <th>Visible</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of productos">
              <td><img *ngIf="p.imagenUrl" class="miniatura" [src]="p.imagenUrl" [alt]="p.nombre" /></td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.categoria }}</td>
              <td>\${{ formatearPrecio(p.precio) }}</td>
              <td>{{ stockTotal(p) }}</td>
              <td>{{ p.activo ? 'Sí' : 'No' }}</td>
              <td>
                <a [routerLink]="['/admin/productos', p.id, 'editar']">Editar</a>
                <button class="boton-peligro" (click)="eliminarProducto(p.id)">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
})
export class AdminProductosComponent implements OnInit {
  productos: any[] = [];
  cargando = true;
  error: string | null = null;

  constructor(public auth: AuthService, private api: ApiService) {}

  ngOnInit() {
    this.cargarProductos();
  }

  async cargarProductos() {
    this.cargando = true;
    try {
      this.productos = await this.api.obtenerProductosAdmin();
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.cargando = false;
    }
  }

  stockTotal(p: any): number {
    return (p.variantes || []).reduce((acc: number, v: any) => acc + v.stock, 0);
  }

  formatearPrecio(precio: number): string {
    return Number(precio).toLocaleString('es-CO');
  }

  async eliminarProducto(id: number) {
    if (!confirm('¿Eliminar este producto y sus variantes?')) return;
    try {
      await this.api.eliminarProducto(String(id));
      await this.cargarProductos();
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
