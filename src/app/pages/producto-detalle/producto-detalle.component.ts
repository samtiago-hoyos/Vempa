import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ClienteAuthService } from '../../core/cliente-auth.service';
import { environment } from '../../../environments/environment';
import { WhatsAppButtonComponent } from '../../components/whatsapp-button/whatsapp-button.component';
import { BotonFavoritoComponent } from '../../components/boton-favorito/boton-favorito.component';
import { Producto, Variante } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, WhatsAppButtonComponent, BotonFavoritoComponent],
  template: `
    <p class="mensaje-estado" *ngIf="cargando">Cargando…</p>
    <p class="mensaje-estado mensaje-estado--error" *ngIf="error">{{ error }}</p>

    <div class="pagina-detalle" *ngIf="!cargando && !error && producto">
      <div class="pagina-detalle__volver">
        <a routerLink="/">← Volver al catálogo</a>
      </div>

      <div class="pagina-detalle__contenido">
        <div class="pagina-detalle__imagen">
          <img *ngIf="producto.imagenUrl" [src]="producto.imagenUrl" [alt]="producto.nombre" />
          <div *ngIf="!producto.imagenUrl" class="tarjeta-producto__imagen-vacia">Sin foto</div>
          <app-boton-favorito
            [productoId]="producto.id"
            [esFavorito]="esFavorito"
            (cambio)="esFavorito = $event"
          ></app-boton-favorito>
        </div>

        <div class="pagina-detalle__info">
          <h1>{{ producto.nombre }}</h1>
          <p class="pagina-detalle__precio">\${{ formatearPrecio(producto.precio) }}</p>
          <p class="pagina-detalle__descripcion" *ngIf="descripcion">{{ descripcion }}</p>

          <div class="tarjeta-producto__controles" *ngIf="variantes.length > 0">
            <select [(ngModel)]="colorSeleccionado" aria-label="Elegir color">
              <option *ngFor="let v of variantes" [value]="v.color" [disabled]="v.stock <= 0">
                {{ v.color }} ({{ v.stock }} disponibles)
              </option>
            </select>
            <input type="number" min="1" [max]="maxStock" [(ngModel)]="cantidad" aria-label="Cantidad" />
          </div>

          <p class="tarjeta-producto__disponibles">
            {{ sinStock ? 'Agotado' : 'Disponibles: ' + (variante?.stock ?? 0) }}
          </p>

          <button class="tarjeta-producto__boton" (click)="pedirPorWhatsApp()" [disabled]="sinStock">
            {{ sinStock ? 'Agotado' : 'Pedir por WhatsApp' }}
          </button>
        </div>
      </div>

      <app-whatsapp-button></app-whatsapp-button>
    </div>
  `,
})
export class ProductoDetalleComponent implements OnInit {
  private numeroWhatsapp = environment.whatsappNumber;

  id!: string;
  producto: Producto | null = null;
  descripcion = '';
  esFavorito = false;
  colorSeleccionado = '';
  cantidad = 1;
  cargando = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private clienteAuth: ClienteAuthService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || '';
    this.cargando = true;

    this.api
      .obtenerProducto(this.id)
      .then((data) => {
        this.producto = data;
        this.descripcion = (data as any).descripcion || '';
        this.colorSeleccionado = data.variantes?.[0]?.color ?? '';
      })
      .catch((err) => {
        this.error = err.message;
      })
      .finally(() => {
        this.cargando = false;
      });

    if (this.clienteAuth.estaLogueado) {
      this.api
        .obtenerFavoritosIds()
        .then((ids) => {
          this.esFavorito = ids.includes(Number(this.id));
        })
        .catch(() => {});
    }
  }

  get variantes(): Variante[] {
    return this.producto?.variantes || [];
  }

  get variante(): Variante | undefined {
    return this.variantes.find((v) => v.color === this.colorSeleccionado);
  }

  get sinStock(): boolean {
    return this.variantes.length === 0 || this.variantes.every((v) => v.stock <= 0);
  }

  get maxStock(): number {
    return Math.max(this.variante?.stock ?? 1, 1);
  }

  formatearPrecio(precio: number): string {
    return Number(precio).toLocaleString('es-CO');
  }

  pedirPorWhatsApp() {
    if (!this.producto) return;
    if (!this.numeroWhatsapp) {
      alert('Falta configurar el número de WhatsApp de la tienda (whatsappNumber en environment.ts).');
      return;
    }
    const detalle = this.variante ? ` color ${this.variante.color}` : '';
    const talla = this.variante?.talla ? `, talla ${this.variante.talla}` : '';
    const cliente = this.clienteAuth.cliente;
    const datosCliente = cliente
      ? ` Soy ${cliente.nombre}${cliente.telefono ? ` (tel: ${cliente.telefono})` : ''}.`
      : '';
    const mensaje = `Hola VEMPA,${datosCliente} Quiero pedir: ${this.producto.nombre}${detalle}${talla}. Cantidad: ${this.cantidad}.`;
    window.open(`https://wa.me/${this.numeroWhatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
  }
}
