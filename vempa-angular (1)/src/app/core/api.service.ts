import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

const CLAVE_TOKEN_ADMIN = 'vempa_admin_token';
const CLAVE_TOKEN_CLIENTE = 'vempa_cliente_token';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiUrl;

  // ---------- Sesión admin ----------
  guardarToken(token: string) {
    localStorage.setItem(CLAVE_TOKEN_ADMIN, token);
  }
  obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN_ADMIN);
  }
  borrarToken() {
    localStorage.removeItem(CLAVE_TOKEN_ADMIN);
  }

  // ---------- Sesión cliente ----------
  guardarTokenCliente(token: string) {
    localStorage.setItem(CLAVE_TOKEN_CLIENTE, token);
  }
  obtenerTokenCliente(): string | null {
    return localStorage.getItem(CLAVE_TOKEN_CLIENTE);
  }
  borrarTokenCliente() {
    localStorage.removeItem(CLAVE_TOKEN_CLIENTE);
  }

  // Cada ruta protegida usa un token distinto según sea admin o cliente,
  // para que un admin logueado y un cliente logueado puedan convivir en el
  // mismo navegador sin pisarse las sesiones.
  private tokenParaRuta(ruta: string): string | null {
    if (ruta.startsWith('/api/admin')) return this.obtenerToken();
    if (ruta.startsWith('/api/clientes') && !ruta.endsWith('/registro') && !ruta.endsWith('/login')) {
      return this.obtenerTokenCliente();
    }
    return null;
  }

  private async solicitud(ruta: string, opciones: RequestInit = {}): Promise<any> {
    const token = this.tokenParaRuta(ruta);
    const encabezados: Record<string, string> = { ...((opciones.headers as Record<string, string>) || {}) };

    if (!(opciones.body instanceof FormData)) {
      encabezados['Content-Type'] = 'application/json';
    }
    if (token) {
      encabezados['Authorization'] = `Bearer ${token}`;
    }

    const respuesta = await fetch(`${this.apiUrl}${ruta}`, { ...opciones, headers: encabezados });
    const data = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(data.error || `Error ${respuesta.status}`);
    }
    return data;
  }

  // ---------- Admin ----------
  login(email: string, password: string) {
    return this.solicitud('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  obtenerProductosAdmin() {
    return this.solicitud('/api/admin/productos');
  }

  crearProducto(payload: unknown) {
    return this.solicitud('/api/admin/productos', { method: 'POST', body: JSON.stringify(payload) });
  }

  actualizarProducto(id: string, payload: unknown) {
    return this.solicitud(`/api/admin/productos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  }

  eliminarProducto(id: string) {
    return this.solicitud(`/api/admin/productos/${id}`, { method: 'DELETE' });
  }

  subirImagen(archivo: File) {
    const formData = new FormData();
    formData.append('imagen', archivo);
    return this.solicitud('/api/admin/upload', { method: 'POST', body: formData });
  }

  // ---------- Público ----------
  obtenerProductos() {
    return this.solicitud('/api/productos');
  }

  obtenerProducto(id: string) {
    return this.solicitud(`/api/productos/${id}`);
  }

  // ---------- Clientes ----------
  registroCliente(nombre: string, email: string, telefono: string, password: string) {
    return this.solicitud('/api/clientes/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, telefono, password }),
    });
  }

  loginCliente(email: string, password: string) {
    return this.solicitud('/api/clientes/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  }

  obtenerFavoritos() {
    return this.solicitud('/api/clientes/favoritos');
  }

  obtenerFavoritosIds() {
    return this.solicitud('/api/clientes/favoritos/ids');
  }

  agregarFavorito(productoId: number) {
    return this.solicitud(`/api/clientes/favoritos/${productoId}`, { method: 'POST' });
  }

  quitarFavorito(productoId: number) {
    return this.solicitud(`/api/clientes/favoritos/${productoId}`, { method: 'DELETE' });
  }
}
