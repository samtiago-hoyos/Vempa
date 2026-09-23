import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { CATEGORIAS, Categoria } from '../../core/categorias';

interface VarianteForm {
  color: string;
  talla: string;
  stock: number | string;
}

interface FormularioProducto {
  nombre: string;
  descripcion: string;
  precio: number | string;
  categoria: string;
  imagenUrl: string | null;
  activo: boolean;
}

const PRODUCTO_VACIO: FormularioProducto = {
  nombre: '',
  descripcion: '',
  precio: '',
  categoria: CATEGORIAS[0].valor,
  imagenUrl: null,
  activo: true,
};

@Component({
  selector: 'app-admin-producto-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="pagina-admin">
      <header class="admin-encabezado">
        <h1>{{ esEdicion ? 'Editar producto' : 'Nuevo producto' }}</h1>
        <a class="boton-enlace" routerLink="/admin">← Volver a la lista</a>
      </header>

      <p class="mensaje-estado mensaje-estado--error" *ngIf="error">{{ error }}</p>

      <form class="tarjeta-formulario" (ngSubmit)="guardarProducto()" *ngIf="!cargando">
        <label>
          Nombre
          <input name="nombre" [(ngModel)]="form.nombre" required />
        </label>

        <label>
          Descripción
          <textarea name="descripcion" [(ngModel)]="form.descripcion"></textarea>
        </label>

        <div class="fila">
          <label>
            Precio
            <input type="number" min="0" name="precio" [(ngModel)]="form.precio" required />
          </label>

          <label>
            Categoría
            <select name="categoria" [(ngModel)]="form.categoria">
              <option *ngFor="let c of categorias" [value]="c.valor">{{ c.etiqueta }}</option>
            </select>
          </label>
        </div>

        <label>
          Foto del producto
          <input type="file" accept="image/*" (change)="onArchivoSeleccionado($event)" />
        </label>
        <img class="vista-previa" *ngIf="form.imagenUrl && !archivoImagen" [src]="form.imagenUrl" alt="Actual" />

        <label class="checkbox">
          <input type="checkbox" name="activo" [(ngModel)]="form.activo" />
          Visible en el catálogo
        </label>

        <h3>Colores / tallas / stock</h3>
        <div class="fila fila--variante" *ngFor="let v of variantes; let idx = index">
          <input placeholder="Color" [(ngModel)]="v.color" [name]="'color' + idx" />
          <input placeholder="Talla (opcional)" [(ngModel)]="v.talla" [name]="'talla' + idx" />
          <input type="number" min="0" placeholder="Stock" [(ngModel)]="v.stock" [name]="'stock' + idx" />
          <button type="button" (click)="quitarVariante(idx)" aria-label="Quitar variante">✕</button>
        </div>
        <button type="button" class="boton-secundario" (click)="agregarVariante()">+ Agregar color/talla</button>

        <div class="fila fila--acciones">
          <button type="submit" [disabled]="guardando">
            {{ guardando ? 'Guardando…' : (esEdicion ? 'Guardar cambios' : 'Crear producto') }}
          </button>
        </div>
      </form>

      <p class="mensaje-estado" *ngIf="cargando">Cargando…</p>
    </div>
  `,
})
export class AdminProductoFormComponent implements OnInit {
  id: string | null = null;
  esEdicion = false;

  categorias: Categoria[] = CATEGORIAS;
  form: FormularioProducto = { ...PRODUCTO_VACIO };
  variantes: VarianteForm[] = [{ color: '', talla: '', stock: 0 }];
  archivoImagen: File | null = null;

  cargando = false;
  guardando = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router, private api: ApiService) {}

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.esEdicion = Boolean(this.id);
    if (!this.esEdicion) return;

    this.cargando = true;
    this.api
      .obtenerProductosAdmin()
      .then((lista: any[]) => {
        const p = lista.find((x) => String(x.id) === String(this.id));
        if (!p) {
          this.error = 'Producto no encontrado.';
          return;
        }
        this.form = {
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          precio: p.precio,
          categoria: p.categoria,
          imagenUrl: p.imagenUrl,
          activo: !!p.activo,
        };
        this.variantes = p.variantes?.length
          ? p.variantes.map((v: any) => ({ ...v }))
          : [{ color: '', talla: '', stock: 0 }];
      })
      .catch((err: any) => {
        this.error = err.message;
      })
      .finally(() => {
        this.cargando = false;
      });
  }

  onArchivoSeleccionado(e: Event) {
    const input = e.target as HTMLInputElement;
    this.archivoImagen = input.files?.[0] || null;
  }

  agregarVariante() {
    this.variantes = [...this.variantes, { color: '', talla: '', stock: 0 }];
  }

  quitarVariante(idx: number) {
    this.variantes = this.variantes.filter((_, i) => i !== idx);
  }

  async guardarProducto() {
    this.guardando = true;
    this.error = null;
    try {
      let imagenUrl = this.form.imagenUrl;
      if (this.archivoImagen) {
        const resultado = await this.api.subirImagen(this.archivoImagen);
        imagenUrl = resultado.url;
      }

      const payload = {
        nombre: this.form.nombre,
        descripcion: this.form.descripcion,
        precio: Number(this.form.precio),
        categoria: this.form.categoria,
        imagenUrl,
        activo: this.form.activo,
        variantes: this.variantes
          .filter((v) => v.color.trim() !== '')
          .map((v) => ({
            color: v.color,
            talla: v.talla || null,
            stock: Number(v.stock) || 0,
          })),
      };

      if (this.esEdicion && this.id) {
        await this.api.actualizarProducto(this.id, payload);
      } else {
        await this.api.crearProducto(payload);
      }

      this.router.navigate(['/admin']);
    } catch (err: any) {
      this.error = err.message;
    } finally {
      this.guardando = false;
    }
  }
}
