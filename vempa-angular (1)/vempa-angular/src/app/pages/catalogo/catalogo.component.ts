import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CATEGORIAS, Categoria } from '../../core/categorias';
import { ClienteAuthService } from '../../core/cliente-auth.service';
import { ProductCardComponent, Producto } from '../../components/product-card/product-card.component';
import { WhatsAppButtonComponent } from '../../components/whatsapp-button/whatsapp-button.component';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, WhatsAppButtonComponent],
  template: `
    <div class="pagina-catalogo">
      <div class="barra-cliente">
        <ng-container *ngIf="clienteAuth.estaLogueado; else invitado">
          <span>Hola, {{ clienteAuth.cliente?.nombre }}</span>
          <a routerLink="/favoritos">Mis favoritos</a>
          <button (click)="clienteAuth.cerrarSesion()">Cerrar sesión</button>
        </ng-container>
        <ng-template #invitado>
          <a routerLink="/login">Iniciar sesión</a>
          <a routerLink="/registro">Crear cuenta</a>
        </ng-template>
      </div>

      <header class="encabezado">
        <img src="assets/logo.png" alt="VEMPA" class="encabezado__logo-img" />
        <p class="encabezado__subtitulo">Moda Deportiva Femenina</p>
      </header>

      <nav class="nav-categorias">
        <button [class.activo]="categoria === 'todos'" (click)="categoria = 'todos'">Inicio</button>
        <button *ngFor="let c of categorias" [class.activo]="categoria === c.valor" (click)="categoria = c.valor">
          {{ c.etiqueta }}
        </button>
      </nav>

      <div class="banner-lema">No pares hasta estar orgullosa.</div>

      <main class="grilla-productos">
        <p class="mensaje-estado" *ngIf="cargando">Cargando productos…</p>
        <p class="mensaje-estado mensaje-estado--error" *ngIf="error">
          No se pudo cargar el catálogo: {{ error }}
        </p>
        <p class="mensaje-estado" *ngIf="!cargando && !error && productosFiltrados.length === 0">
          Todavía no hay productos en esta categoría.
        </p>
        <app-product-card
          *ngFor="let p of productosFiltrados"
          [producto]="p"
          [esFavorito]="favoritosIds.includes(p.id)"
          (cambioFavorito)="alCambiarFavorito(p.id, $event)"
        ></app-product-card>
      </main>

      <app-whatsapp-button></app-whatsapp-button>
    </div>
  `,
})
export class CatalogoComponent implements OnInit {
  categorias: Categoria[] = CATEGORIAS;
  productos: Producto[] = [];
  favoritosIds: number[] = [];
  categoria = 'todos';
  cargando = true;
  error: string | null = null;

  constructor(public clienteAuth: ClienteAuthService, private api: ApiService) {}

  ngOnInit() {
    this.api
      .obtenerProductos()
      .then((data) => {
        this.productos = data;
      })
      .catch((err) => {
        this.error = err.message;
      })
      .finally(() => {
        this.cargando = false;
      });

    this.cargarFavoritos();
  }

  cargarFavoritos() {
    if (!this.clienteAuth.estaLogueado) {
      this.favoritosIds = [];
      return;
    }
    this.api
      .obtenerFavoritosIds()
      .then((ids) => {
        this.favoritosIds = ids;
      })
      .catch(() => {});
  }

  get productosFiltrados(): Producto[] {
    return this.categoria === 'todos'
      ? this.productos
      : this.productos.filter((p: any) => p.categoria === this.categoria);
  }

  alCambiarFavorito(productoId: number, esFavoritoAhora: boolean) {
    this.favoritosIds = esFavoritoAhora
      ? [...this.favoritosIds, productoId]
      : this.favoritosIds.filter((id) => id !== productoId);
  }
}
