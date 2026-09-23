import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ClienteAuthService } from '../../core/cliente-auth.service';
import { BotonFavoritoComponent } from '../boton-favorito/boton-favorito.component';

export interface Variante {
  id?: number;
  color: string;
  talla?: string;
  stock: number;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagenUrl?: string;
  variantes?: Variante[];
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BotonFavoritoComponent],
  template: `
    <article class="tarjeta-producto">
      <a [routerLink]="['/producto', producto.id]" class="tarjeta-producto__imagen">
        <img *ngIf="producto.imagenUrl" [src]="producto.imagenUrl" [alt]="producto.nombre" loading="lazy" />
        <div *ngIf="!producto.imagenUrl" class="tarjeta-producto__imagen-vacia">Sin foto</div>
        <app-boton-favorito
          [productoId]="producto.id"
          [esFavorito]="esFavorito"
          (cambio)="onCambioFavorito($event)"
        ></app-boton-favorito>
      </a>

      <div class="tarjeta-producto__info">
        <h3><a [routerLink]="['/producto', producto.id]">{{ producto.nombre }}</a></h3>
        <p class="tarjeta-producto__precio">\${{ formatearPrecio(producto.precio) }}</p>

        <div class="tarjeta-producto__controles" *ngIf="variantes.length > 0">
          <select [(ngModel)]="colorSeleccionado" aria-label="Elegir color">
            <option *ngFor="let v of variantes" [value]="v.color" [disabled]="v.stock <= 0">
              {{ v.color }} ({{ v.stock }} disponibles)
            </option>
          </select>
          <input
            type="number"
            min="1"
            [max]="maxStock"
            [(ngModel)]="cantidad"
            aria-label="Cantidad"
          />
        </div>

        <p class="tarjeta-producto__disponibles">
          {{ sinStock ? 'Agotado' : 'Disponibles: ' + (variante?.stock ?? 0) }}
        </p>

        <button class="tarjeta-producto__boton" (click)="pedirPorWhatsApp()" [disabled]="sinStock">
          {{ sinStock ? 'Agotado' : 'Pedir por WhatsApp' }}
        </button>
      </div>
    </article>
  `,
})
export class ProductCardComponent implements OnChanges {
  @Input() producto!: Producto;
  @Input() esFavorito = false;
  @Output() cambioFavorito = new EventEmitter<boolean>();

  private numeroWhatsapp = environment.whatsappNumber;
  colorSeleccionado = '';
  cantidad = 1;

  constructor(private clienteAuth: ClienteAuthService) {}

  ngOnChanges() {
    if (!this.colorSeleccionado && this.variantes.length) {
      this.colorSeleccionado = this.variantes[0].color;
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

  onCambioFavorito(valor: boolean) {
    this.cambioFavorito.emit(valor);
  }
}
