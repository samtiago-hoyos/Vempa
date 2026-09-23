import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagina-login">
      <form class="tarjeta-login" (ngSubmit)="manejarEnvio()">
        <h1>VEMPA · Admin</h1>
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
      </form>
    </div>
  `,
})
export class AdminLoginComponent implements OnInit {
  email = '';
  password = '';
  error: string | null = null;
  enviando = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.auth.session) {
      this.router.navigate(['/admin']);
    }
  }

  async manejarEnvio() {
    this.enviando = true;
    this.error = null;
    const { error } = await this.auth.signIn(this.email, this.password);
    this.enviando = false;
    if (error) {
      this.error = 'Correo o contraseña incorrectos.';
    } else {
      this.router.navigate(['/admin']);
    }
  }
}
