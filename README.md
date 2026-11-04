# NovaMarket — E-commerce de productos tecnológicos 🛒

NovaMarket es una PYME que vende accesorios, periféricos y gadgets. Hoy depende de redes sociales y marketplaces de terceros; este MVP le da una tienda propia donde controlar su catálogo y la experiencia de compra.

**Duración:** 8 semanas · **Modelo:** simulación educativa ([Talently Lab](https://talentlylab.com.ar) — Cohorte S2622)

## 🌐 Demo en producción

| Servicio | URL |
| --- | --- |
| Frontend (Netlify) | https://nova-market-s2622.netlify.app |
| Backend (Render) | https://s2622-novamarket-ecommerce-backend.onrender.com |
| Documentación Swagger | https://s2622-novamarket-ecommerce-backend.onrender.com/api-docs |

> ⚠️ El backend está en el plan gratuito de Render: si estuvo inactivo, la primera request puede tardar 50 segundos o más en responder.

## 🎯 Alcance del MVP

**Incluido**

- Registro y login de usuarios (JWT)
- Catálogo de productos con filtro por categorías, búsqueda y ordenamiento
- Carrito de compras
- Checkout simulado (sin pago real)
- Login de administrador
- CRUD de productos (admin)
- Visualización y gestión de estado de pedidos (admin)

**Fuera de alcance**

- Pasarela de pagos real
- Gestión de envíos
- Integraciones externas
- App móvil nativa (solo web)

## 📊 Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router 7, Tailwind CSS 4, Chakra UI, Zod |
| Testing frontend | Vitest, React Testing Library |
| Backend | Node.js, Express 5, JWT, bcryptjs, Zod |
| Base de datos | MongoDB Atlas (Mongoose) |
| Documentación API | Swagger UI |
| Hosting | Netlify (frontend) · Render (backend) |

## 📁 Estructura del repositorio

```
S2622-novamarket-ecommerce/
├── backend/                 # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/          # Conexión a MongoDB
│   │   ├── controllers/     # Lógica de cada endpoint
│   │   ├── docs/            # Documentación Swagger
│   │   ├── helpers/         # JWT, respuestas, seed de productos
│   │   ├── middleware/      # Autenticación, roles, validación (Zod)
│   │   ├── models/          # Modelos de Mongoose (User, Product, Order…)
│   │   ├── routes/          # Definición de rutas
│   │   ├── services/        # Lógica de negocio
│   │   ├── zodSchemas/      # Esquemas de validación
│   │   └── index.js         # Punto de entrada
│   ├── .env.example         # Variables de entorno (plantilla)
│   └── package.json
├── frontend/                # SPA React + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizables
│   │   ├── context/         # Estado global (Auth)
│   │   ├── hooks/           # Hooks personalizados
│   │   ├── pages/           # Páginas y rutas (incluye /admin)
│   │   ├── routes/          # Rutas públicas y privadas
│   │   ├── services/        # Llamadas a la API (cliente HTTP centralizado)
│   │   ├── schemas/         # Validaciones con Zod
│   │   └── theme/           # Tema del sistema de diseño
│   ├── .env.example         # Variables de entorno (plantilla)
│   └── package.json
├── docs/                    # Documentación general (analítica, QA)
└── README.md
```

## 🚀 Instalación local

### Requisitos previos

- **Node.js 24** y **npm 11** (el frontend los exige en `engines`; con `nvm use` se toma la versión de `frontend/.nvmrc`)
- Una base de datos en **MongoDB Atlas** (o MongoDB local) y su cadena de conexión
- Git

### 1. Clonar el repositorio

```bash
git clone https://github.com/Talently-Lab/S2622-novamarket-ecommerce.git
cd S2622-novamarket-ecommerce
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env     # completar las variables (ver tabla más abajo)
npm start                # API en http://localhost:3000
```

Verificá que esté funcionando abriendo `http://localhost:3000/api/health` (debe responder `status: "OK"` y `db: "connected"`) o la documentación en `http://localhost:3000/api-docs`.

**Cargar productos de prueba (opcional):**

```bash
npm run seed
```

> ⚠️ El seed ejecuta `deleteMany({})` sobre la colección de productos: **borra todos los productos existentes** antes de insertar los de prueba. No lo corras contra la base de producción.

### 3. Frontend

En otra terminal:

```bash
cd frontend
nvm use                  # selecciona Node 24 (opcional si ya lo tenés)
npm ci
cp .env.example .env     # define VITE_API_URL
npm run dev              # App en http://localhost:5173
```

### 4. Acceder a la aplicación

- Frontend: http://localhost:5173
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api-docs

### Crear un usuario administrador

El registro público siempre crea usuarios con rol `client`. Para tener un admin:

1. Registrá un usuario desde `/registro`.
2. En MongoDB Atlas, abrí la colección `users` y cambiá el campo `rol` de ese usuario a `admin`.
3. Volvé a iniciar sesión: ya podés acceder a `/admin`.

## 🔐 Variables de entorno

### Backend (`backend/.env`)

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `MONGODB_URI` | Sí | Cadena de conexión a MongoDB |
| `JWT_SECRET` | Sí | Clave secreta para firmar los tokens JWT |
| `CORS_ORIGIN` | Sí en producción | Orígenes permitidos, separados por coma y sin `/` final. Si no se define, solo se permite `http://localhost:5173` |
| `PORT` | No | Puerto de la API (por defecto `3000`) |

Ejemplo de `CORS_ORIGIN` con varios orígenes:

```
CORS_ORIGIN=https://nova-market-s2622.netlify.app,http://localhost:5173
```

### Frontend (`frontend/.env`)

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | Sí | URL base de la API, sin `/` final. Si no se define, el frontend usa `/api` (mismo origen) |

> 🔒 Los archivos `.env` están en `.gitignore`. **Nunca** subas credenciales al repositorio; usá siempre los archivos `.env.example` como plantilla.

## 📡 Endpoints principales

Base URL: `/api`. Las respuestas siguen el formato `{ ok, message, data }`. Los endpoints protegidos requieren el header:

```
Authorization: Bearer <token>
```

El token se obtiene en el login y dura 1 día. La documentación interactiva completa está en `/api-docs`.

### Salud

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/health` | Público | Estado de la API y de la conexión a la base de datos |

### Autenticación — `/api/auth`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/auth/register` | Público | Registra un usuario (`nombre`, `email`, `password`) |
| POST | `/auth/login` | Público | Inicia sesión y devuelve el token JWT |
| GET | `/auth/me` | Autenticado | Datos del usuario logueado |
| POST | `/auth/logout` | Autenticado | Cierra la sesión |

La contraseña debe tener al menos 8 caracteres, con una mayúscula, una minúscula y un número.

### Productos — `/api/products`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/products` | Público | Lista productos con filtros y paginación |
| GET | `/products/:id` | Público | Detalle de un producto |
| POST | `/products` | Admin | Crea un producto |
| PUT | `/products/:id` | Admin | Actualiza un producto |
| PATCH | `/products/:id/stock` | Admin | Actualiza el stock |
| DELETE | `/products/:id` | Admin | Elimina un producto |

**Query params de `GET /products`:** `page`, `limit`, `category`, `name`, `minPrice`, `maxPrice`, `sortByPrice` (`asc` / `desc`), `sortByDate` (`asc` / `desc`).

**Categorías válidas:** `accesorios`, `perifericos`, `gadgets`.

### Carrito — `/api/cart` (requiere login)

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/cart` | Obtiene el carrito del usuario |
| POST | `/cart` | Agrega un producto (`productId`, `cantidad`) |
| PATCH | `/cart/:id` | Cambia la cantidad (`:id` es el ID del producto) |
| DELETE | `/cart/:id` | Quita un producto del carrito |
| DELETE | `/cart` | Vacía el carrito |

### Pedidos — `/api/orders` (requiere login)

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| POST | `/orders` | Cliente | Crea un pedido (`items`, `total`, `direccionEnvio`) |
| GET | `/orders/my` | Autenticado | Pedidos del usuario logueado |
| GET | `/orders/:id` | Autenticado | Detalle de un pedido |
| GET | `/orders` | Admin | Lista todos los pedidos |
| PUT | `/orders/:id/status` | Admin | Cambia el estado (`estado`) |

**Estados posibles:** `pendiente`, `pagado`, `enviado`, `entregado`, `cancelado`, `confirmado`.

### Datos para formularios — `/api/formdata`

| Método | Ruta | Acceso | Descripción |
| --- | --- | --- | --- |
| GET | `/formdata/products` | Público | Categorías de productos |
| GET | `/formdata/order-status` | Público | Estados de pedidos |

## 🖥️ Rutas del frontend

| Ruta | Acceso | Página |
| --- | --- | --- |
| `/` | Público | Inicio |
| `/productos` | Público | Catálogo con filtros |
| `/productos/:id` | Público | Detalle de producto |
| `/carrito` | Público | Carrito |
| `/login`, `/registro` | Público | Autenticación |
| `/admin/productos` | Admin | Listado y gestión de productos |
| `/admin/productos/nuevo` | Admin | Alta de producto |
| `/admin/productos/:id/editar` | Admin | Edición de producto |
| `/admin/pedidos` | Admin | Pedidos |

## 🧪 Scripts disponibles

**Backend** (`/backend`)

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia la API |
| `npm run seed` | Carga productos de prueba (⚠️ borra los existentes) |

**Frontend** (`/frontend`)

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run preview` | Previsualiza el build |
| `npm test` | Corre los tests con Vitest |
| `npm run typecheck` | Verifica tipos de TypeScript |
| `npm run lint` / `npm run lint:fix` | Revisa / corrige el código con ESLint |
| `npm run format` | Formatea con Prettier |

## ☁️ Deploy

- **Frontend (Netlify):** definir `VITE_API_URL` apuntando a `https://<backend>.onrender.com/api`.
- **Backend (Render):** definir `MONGODB_URI`, `JWT_SECRET` y `CORS_ORIGIN` con la URL del frontend en Netlify.

## 🤝 Convenciones de desarrollo

El repo usa **Conventional Commits** (validados con commitlint y husky):

```bash
git commit -m "feat: agregar filtro por categoría"
git commit -m "fix: corregir CORS para múltiples orígenes"
git commit -m "docs: actualizar README"
git commit -m "refactor: reorganizar componentes del carrito"
```

Ramas:

```bash
git checkout -b feat/nombre-de-la-funcionalidad
git checkout -b fix/descripcion-del-bug
git checkout -b docs/actualizacion-readme
```

## 👥 Equipo — Grupo S2622

| Rol | Responsable |
| --- | --- |
| Project Manager | _Tania Pamela Colque_ |
| Backend Developer | _ Facundo Fernández y Ariel Gonzalez Maillard_ |
| Frontend Developer | _Mauro y Kaira_ |
| Diseñador UX/UI | _Agostina Chiapino_ |
| QA Tester | _Rocio Ana Maria Bravo_ |

## 📝 Licencia y créditos

Proyecto parte de una simulación educativa de [Talently Lab](https://talentlylab.com.ar). Desarrollado por el equipo S2622 (2026).
