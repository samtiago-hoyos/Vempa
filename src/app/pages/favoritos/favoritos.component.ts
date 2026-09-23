import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ClienteAuthService } from '../../core/cliente-auth.service';
import { ProductCardComponent, Producto } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent],
  template: `
    <div class="pagina-catalogo" *ngIf="clienteAuth.estaLogueado">
      <div class="pagina-detalle__volver" style="padding: 20px 20px 0">
        <a routerLink="/">← Volver al catálogo</a>
      </div>

      <header class="encabezado">
        <h1>Mis favoritos</h1>
      </header>

      <main class="grilla-productos">
        <p class="mensaje-estado" *ngIf="cargando">Cargando…</p>
        <p class="mensaje-estado mensaje-estado--error" *ngIf="error">{{ error }}</p>
        <p class="mensaje-estado" *ngIf="!cargando && !error && productos.length === 0">
          Todavía no tienes productos favoritos.
        </p>
        <app-product-card
          *ngFor="let p of productos"
          [producto]="p"
          [esFavorito]="true"
          (cambioFavorito)="onCambioFavorito(p.id, $event)"
        ></app-product-card>
      </main>
    </div>
  `,
})
export class FavoritosComponent implements OnInit {
  productos: Producto[] = [];
  cargando = true;
  error: string | null = null;

  constructor(public clienteAuth: ClienteAuthService, private api: ApiService, private router: Router) {}

  ngOnInit() {
    if (!this.clienteAuth.estaLogueado) {
      this.router.navigate(['/login']);
      return;
    }

    this.api
      .obtenerFavoritos()
      .then((data) => {
        this.productos = data;
      })
      .catch((err) => {
        this.error = err.message;
      })
      .finally(() => {
        this.cargando = false;
      });
  }

  onCambioFavorito(productoId: number, valor: boolean) {
    if (!valor) {
      this.productos = this.productos.filter((p) => p.id !== productoId);
    }
  }
}
