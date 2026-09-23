import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ClienteAuthService } from '../../core/cliente-auth.service';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-cliente-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pagina-login">
      <form class="tarjeta-login" (ngSubmit)="manejarEnvio()">
        <h1>VEMPA</h1>
        <p class="tarjeta-login__subtitulo">Inicia sesión</p>
        <label>
          Correo
          <input type="email" name="email" [(ngModel)]="email" required />
        </label>
        <label>
          Contraseña
          <input type="password" name="password" [(ngModel)]="password" required />
        </label>
        <p class="mensaje-estado mensaje-estado--error" *ngIf="error">{{ error }}</p>
        <button type="submit" [disabled]="enviando">
          {{ enviando ? 'Ingresando…' : 'Ingresar' }}
        </button>
        <p class="tarjeta-login__enlace">
          ¿No tienes cuenta? <a routerLink="/registro">Regístrate</a>
        </p>
      </form>
    </div>
  `,
})
export class ClienteLoginComponent implements OnInit {
  email = '';
  password = '';
  error: string | null = null;
  enviando = false;

  constructor(
    public clienteAuth: ClienteAuthService,
    private adminAuth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.adminAuth.session) {
      this.router.navigate(['/admin']);
    } else if (this.clienteAuth.estaLogueado) {
      this.router.navigate(['/']);
    }
  }

  async manejarEnvio() {
    this.enviando = true;
    this.error = null;

    // Primero probamos como admin. Si el correo/contraseña no coincide con
    // ninguna cuenta admin, el backend responde 401 y probamos como cliente.
    // Solo si ambos fallan mostramos el error al usuario.
    const admin = await this.adminAuth.signIn(this.email, this.password);
    if (!admin.error) {
      this.enviando = false;
      this.router.navigate(['/admin']);
      return;
    }

    const cliente = await this.clienteAuth.iniciarSesion(this.email, this.password);
    this.enviando = false;
    if (cliente.error) {
      this.error = (cliente.error as any).message || 'Correo o contraseña incorrectos.';
    } else {
      this.router.navigate(['/']);
    }
  }
}