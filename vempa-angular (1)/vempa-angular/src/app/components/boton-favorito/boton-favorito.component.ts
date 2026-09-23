import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { ClienteAuthService } from '../../core/cliente-auth.service';

@Component({
  selector: 'app-boton-favorito',
  standalone: true,
  template: `
    <button
      type="button"
      class="boton-favorito"
      [class.boton-favorito--activo]="esFavorito"
      (click)="alClic($event)"
      [attr.aria-label]="esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
      [title]="esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'"
    >{{ esFavorito ? '♥' : '♡' }}</button>
  `,
})
export class BotonFavoritoComponent {
  @Input() productoId!: number;
  @Input() esFavorito = false;
  @Output() cambio = new EventEmitter<boolean>();

  constructor(
    private clienteAuth: ClienteAuthService,
    private api: ApiService,
    private router: Router
  ) {}

  async alClic(e: Event) {
    // evita seguir el [routerLink] de la tarjeta cuando el botón va dentro
    e.preventDefault();
    e.stopPropagation();

    if (!this.clienteAuth.estaLogueado) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      if (this.esFavorito) {
        await this.api.quitarFavorito(this.productoId);
        this.cambio.emit(false);
      } else {
        await this.api.agregarFavorito(this.productoId);
        this.cambio.emit(true);
      }
    } catch {
      // Si falla (ej. token vencido), simplemente no cambiamos el estado visual.
    }
  }
}
