import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteAuthService } from '../../core/cliente-auth.service';

@Component({
  selector: 'app-cliente-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pagina-login">
      <form class="tarjeta-login" (ngSubmit)="manejarEnvio()">
        <h1>VEMPA</h1>
        <p class="tarjeta-login__subtitulo">Crea tu cuenta</p>
        <label>
          Nombre
          <input name="nombre" [(ngModel)]="nombre" required />
        </label>
        <label>
          Correo
          <input type="email" name="email" [(ngModel)]="email" required />
        </label>
        <label>
          Teléfono (para tus pedidos por WhatsApp)
          <input type="tel" name="telefono" [(ngModel)]="telefono" placeholder="3001234567" />
        </label>
        <label>
          Contraseña
          <input type="password" name="password" [(ngModel)]="password" minlength="6" required />
        </label>
        <p class="mensaje-estado mensaje-estado--error" *ngIf="error">{{ error }}</p>
        <button type="submit" [disabled]="enviando">
          {{ enviando ? 'Creando cuenta…' : 'Crear cuenta' }}
        </button>
        <p class="tarjeta-login__enlace">
          ¿Ya tienes cuenta? <a routerLink="/login">Inicia sesión</a>
        </p>
      </form>
    </div>
  `,
})
export class ClienteRegistroComponent implements OnInit {
  nombre = '';
  email = '';
  telefono = '';
  password = '';
  error: string | null = null;
  enviando = false;

  constructor(public clienteAuth: ClienteAuthService, private router: Router) {}

  ngOnInit() {
    if (this.clienteAuth.estaLogueado) {
      this.router.navigate(['/']);
    }
  }

  async manejarEnvio() {
    this.enviando = true;
    this.error = null;
    const { error } = await this.clienteAuth.registrar(this.nombre, this.email, this.telefono, this.password);
    this.enviando = false;
    if (error) {
      this.error = (error as any).message || 'No se pudo crear la cuenta.';
    } else {
      this.router.navigate(['/']);
    }
  }
}
