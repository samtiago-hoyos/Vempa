# VEMPA — Frontend (Angular)

Catálogo público + panel admin. Convertido desde la versión original en React + Vite. Habla con el backend en `vempa-backend/` (ver ese proyecto para la API, base de datos y servidor).

## Stack

- **Frontend**: Angular (standalone components) → **Vercel** (gratis)
- **Backend**: Node.js + Express → **Render** (gratis) — repo `vempa-backend/`
- **Base de datos**: MySQL → **Filess.io** (gratis)
- **Imágenes**: **Cloudinary** (gratis)

## Configuración local

Edita `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  whatsappNumber: '573001234567',
};
```

```bash
npm install
npm start
```

- Catálogo: http://localhost:4200
- Panel admin: http://localhost:4200/admin/login (usuario creado desde `vempa-backend`, ver su README)

Antes de desplegar a producción, actualiza también `src/environments/environment.production.ts` con la URL real del backend y el número de WhatsApp de la tienda.

## Desplegar en Vercel (gratis)

1. Sube este proyecto a un repo de GitHub.
2. En https://vercel.com → **Add New Project** → importa el repo.
3. Vercel detecta automáticamente el **Framework Preset: Angular**.
4. **Root Directory**: la carpeta donde está este `package.json` (si el repo tiene más de un proyecto).
5. **Deploy**.
6. Copia la URL que te da Vercel (ej. `vempa.vercel.app`) y ponla como `FRONTEND_URL` en las variables de entorno del backend en Render (para que el CORS lo deje pasar).

## Estructura

```
src/
├── environments/
│   ├── environment.ts              # config de desarrollo
│   └── environment.production.ts   # config de producción
├── app/
│   ├── core/
│   │   ├── api.service.ts          # Cliente HTTP hacia el backend
│   │   ├── auth.service.ts         # Sesión del admin (JWT en localStorage)
│   │   ├── cliente-auth.service.ts # Sesión del cliente
│   │   ├── auth.guard.ts           # Protege rutas /admin/*
│   │   └── categorias.ts
│   ├── components/
│   │   ├── boton-favorito/
│   │   ├── product-card/
│   │   └── whatsapp-button/
│   ├── pages/
│   │   ├── catalogo/                # "/"
│   │   ├── producto-detalle/        # "/producto/:id"
│   │   ├── favoritos/                # "/favoritos"
│   │   ├── cliente-login/            # "/login"
│   │   ├── cliente-registro/         # "/registro"
│   │   ├── admin-login/              # "/admin/login"
│   │   ├── admin-productos/          # "/admin"
│   │   └── admin-producto-form/      # "/admin/productos/nuevo" y "/editar"
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
└── styles.css
```

## Nota sobre tus fotos

Si vienes con fotos `.HEIC` de iPhone, conviértelas antes a JPG/WebP (no se ven en la mayoría de navegadores). Súbelas directo desde el panel admin — el backend las sube automáticamente a Cloudinary.
