import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

export interface PerfilCliente {
  nombre: string;
  email: string;
  telefono?: string;
}

const CLAVE_PERFIL = 'vempa_cliente_perfil';

@Injectable({ providedIn: 'root' })
export class ClienteAuthService {
  private clienteSubject: BehaviorSubject<PerfilCliente | null>;
  cliente$;

  constructor(private api: ApiService) {
    const token = this.api.obtenerTokenCliente();
    const perfil = this.leerPerfilGuardado();
    this.clienteSubject = new BehaviorSubject<PerfilCliente | null>(token ? perfil : null);
    this.cliente$ = this.clienteSubject.asObservable();
  }

  get cliente(): PerfilCliente | null {
    return this.clienteSubject.value;
  }

  get estaLogueado(): boolean {
    return Boolean(this.api.obtenerTokenCliente());
  }

  private leerPerfilGuardado(): PerfilCliente | null {
    try {
      const crudo = localStorage.getItem(CLAVE_PERFIL);
      return crudo ? JSON.parse(crudo) : null;
    } catch {
      return null;
    }
  }

  private guardarSesion(data: any) {
    this.api.guardarTokenCliente(data.token);
    const perfil: PerfilCliente = { nombre: data.nombre, email: data.email, telefono: data.telefono };
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil));
    this.clienteSubject.next(perfil);
  }

  async registrar(nombre: string, email: string, telefono: string, password: string) {
    try {
      const data = await this.api.registroCliente(nombre, email, telefono, password);
      this.guardarSesion(data);
      return { error: null };
    } catch (err) {
      return { error: err as any };
    }
  }

  async iniciarSesion(email: string, password: string) {
    try {
      const data = await this.api.loginCliente(email, password);
      this.guardarSesion(data);
      return { error: null };
    } catch (err) {
      return { error: err as any };
    }
  }

  cerrarSesion() {
    this.api.borrarTokenCliente();
    localStorage.removeItem(CLAVE_PERFIL);
    this.clienteSubject.next(null);
  }
}
