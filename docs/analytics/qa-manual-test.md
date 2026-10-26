# NovaMarket — Checklist de prueba manual de analítica

- **Rama:** `feat/analytics-events`
- **Commit:** `ddca593`
- **Alcance:** eventos del catálogo (MVP) y del embudo de registro
- **Fecha:** 2026-10-20

---

## 1. Contexto para QA

Los eventos todavía **no se envían a ningún destino externo** (ni Google Analytics
ni un endpoint propio). Por ahora la única evidencia es una línea en la consola
del navegador con el formato:

```text
[evento] nombre_del_evento { parámetros }
```

No debe aparecer ninguna request de analítica en la pestaña Network, y no hay
que instalar ni configurar nada.

### Preparar el entorno

1. `git checkout feat/analytics-events`
2. Usar Node 24 o superior (ver `.nvmrc`).
3. `cd frontend`
4. `npm install` (solo si faltan dependencias)
5. Levantar el backend con el entorno habitual de desarrollo.
6. Verificar que `frontend/.env` apunte a ese backend (`VITE_API_URL`).
7. `npm run dev`
8. Abrir la URL que imprime Vite (normalmente `http://localhost:5173`).

### Preparar la consola

1. Abrir DevTools: `F12` o `Ctrl + Shift + I`.
2. Ir a la pestaña **Console**.
3. Activar **Preserve log / Conservar registro** (para no perder eventos al
   navegar entre pantallas).
4. En el filtro de la consola escribir `[evento]`.

> Los logs se muestran como un objeto expandible. En Chrome/Edge se ve, por
> ejemplo, `[evento] select_category {categoria: 'perifericos', origen: 'home'}`.
> En Firefox puede verse como `Object { ... }`; expandiéndolo se ven los mismos
> campos.

---

## 2. Checklist — Catálogo

| ID | Acción | Resultado esperado en consola |
|---|---|---|
| CAT-01 | En el home, tocar el tile de la categoría **Periféricos**. | `[evento] select_category { categoria: 'perifericos', origen: 'home' }` y, al cargar el catálogo, `view_item_list` con `categoria: 'perifericos'`. |
| CAT-02 | En desktop (≥ 768 px), desde el catálogo, tocar **Accesorios** en la barra de categorías del navbar. | `[evento] select_category { categoria: 'accesorios', origen: 'filtro' }` seguido de `view_item_list`. |
| CAT-03 | En mobile (< 768 px), ir a `/productos`, abrir **Categorías**, elegir **Gadgets** y tocar **Ver N productos**. | `[evento] select_category { categoria: 'gadgets', origen: 'filtro' }` seguido de `view_item_list`. |
| CAT-04 | Entrar a `/productos` sin filtro. | `[evento] view_item_list { categoria: '', cantidad_resultados: N, pagina: 1 }`. |
| CAT-05 | Aplicar cualquier filtro de categoría. | `view_item_list` con el slug de la categoría y el nuevo conteo, `pagina: 1`. |
| CAT-06 | En mobile, tocar **Cargar más**. | `view_item_list` con el mismo `cantidad_resultados` y `pagina: 2`. |
| CAT-07 | En desktop (≥ 1024 px), con más de 8 productos, ir a la página 2 del paginador. | `view_item_list` con `pagina: 2`. |
| CAT-08 | Abrir la ficha de un producto **con stock**. | `[evento] view_item_detail { id_producto: '<_id>', nombre_producto: '…', categoria: 'perifericos', precio: 38900, en_stock: true }`. |
| CAT-09 | Abrir la ficha de un producto **sin stock**. | `view_item_detail` con `en_stock: false`. |
| CAT-10 | Tocar **Agregar** en una card del catálogo. | `[evento] click_add_to_cart { id_producto: '<_id>', nombre_producto: '…', precio: 38900, cantidad: 1, origen: 'grilla' }`. |
| CAT-11 | En la ficha, tocar **Agregar al carrito**. | `[evento] click_add_to_cart { id_producto: '<_id>', nombre_producto: '…', precio: 38900, cantidad: 1, origen: 'ficha' }`. |

---

## 3. Checklist — Registro

| ID | Acción | Resultado esperado en consola |
|---|---|---|
| REG-01 | Desde `/login`, tocar **Crear cuenta**. | `[evento] view_signup_form { origen: 'login' }`. |
| REG-02 | Abrir `/registro` directamente por URL. | `[evento] view_signup_form { origen: 'directo' }`. |
| REG-03 | En `/registro`, enviar el formulario vacío. | `[evento] submit_sign_up_attempt { campos_completos: false }` y después `[evento] sign_up_error { tipo_error: 'validacion_password' }`. |
| REG-04 | Completar todos los campos, poner un email con formato inválido y una contraseña válida; enviar. | `submit_sign_up_attempt { campos_completos: true }` y `sign_up_error { tipo_error: 'otro' }`. |
| REG-05 | Completar todo, pero con una contraseña sin mayúscula; enviar. | `submit_sign_up_attempt { campos_completos: true }` y `sign_up_error { tipo_error: 'validacion_password' }`. |
| REG-06 | Registrarse con un email **nuevo** y una contraseña válida (mínimo 8 caracteres, con mayúscula, minúscula y número). | `[evento] sign_up_success { id_usuario: '<_id>', fecha_registro: '2026-…' }`. |
| REG-07 | Volver a registrar el **mismo email** del caso REG-06. | `[evento] sign_up_error { tipo_error: 'email_duplicado' }`. |
| REG-08 | Opcional: detener el backend y enviar un registro válido. | `[evento] sign_up_error { tipo_error: 'error_servidor' }`. |

---

## 4. Checklist — Duplicados y StrictMode

La app corre con React StrictMode en desarrollo. Estos casos verifican que no se
dupliquen eventos por re-renders.

| ID | Acción | Resultado esperado |
|---|---|---|
| DUP-01 | Recargar `/productos`. | Aparece **un solo** `view_item_list` por carga/filtro. |
| DUP-02 | Entrar a una ficha y recargar. | Aparece **un solo** `view_item_detail` por producto. |
| DUP-03 | Recargar `/registro`. | Aparece **un solo** `view_signup_form`. |
| DUP-04 | Enviar el formulario de registro una vez. | Un `submit_sign_up_attempt` y **exactamente uno** entre `sign_up_success` y `sign_up_error`. |

---

## 5. Calidad de datos

- [ ] `categoria` llega como slug de la base: `perifericos`, `accesorios` o
      `gadgets`. Nunca `Periféricos`, `Accesorios` ni el texto de la UI.
- [ ] `precio` llega como número: `38900`. Nunca `"$38.900"` ni `"38900"`.
- [ ] `id_producto` es el `_id` de Mongo del producto.
- [ ] `en_stock` es booleano (`true` / `false`), no `"true"` ni `1`.
- [ ] `cantidad` es `1` (todavía no existe selector de cantidad).
- [ ] En `view_item_list`, `cantidad_resultados` es un número y `pagina` es un
      número.
- [ ] `sign_up_success` incluye `id_usuario` y `fecha_registro`.
- [ ] `sign_up_error` **no** incluye email, contraseña ni el mensaje crudo del
      backend.
- [ ] No aparecen eventos con parámetros adicionales (fecha, usuario, etc.) fuera
      de los definidos en las planillas.

---

## 6. Fuera de alcance (no reportar como bug)

- Buscador (`search_product`), ordenar (`sort_items`), filtro de precio
  (`apply_filter` / `clear_filters`).
- Alerta de stock bajo en el panel admin.
- Botón **Agregar** de la sección **Destacados** del home.
- Persistencia o envío de eventos a un servicio externo.
- Envío automático de fecha/hora o `id_usuario` en todos los eventos. La única
  excepción es `fecha_registro` en `sign_up_success`, porque la planilla de
  registro lo pide en esa fila.

---

## 7. Para el equipo de Data: dónde ver los datos en el navegador

**Importante:** en esta etapa los eventos sólo se imprimen en la consola del
navegador. No viajan a Google Analytics ni a ningún endpoint. Si se recarga la
página sin "Preserve log", los logs anteriores se pierden.

### Cómo verlos

1. Abrir la app en Chrome, Edge o Firefox.
2. Abrir DevTools (`F12` o `Ctrl + Shift + I`) → pestaña **Console**.
3. Activar **Preserve log / Conservar registro**.
4. Filtrar por `[evento]`.
5. Navegar por la app y ejecutar las acciones del checklist.

Cada evento genera **una entrada**:

```text
[evento] view_item_detail {id_producto: '507f1f77bcf86cd799439011', nombre_producto: 'Mouse Gamer NovaTech RGB 7200DPI', categoria: 'perifericos', precio: 38900, en_stock: true}
```

### Qué representa cada evento

| Evento | Parámetros | Para qué sirve |
|---|---|---|
| `select_category` | `categoria`, `origen` (`home` / `filtro`) | Qué categorías despiertan interés y desde dónde se eligen. |
| `view_item_list` | `categoria`, `cantidad_resultados`, `pagina` | Llegada al catálogo y qué se muestra en cada vista. |
| `view_item_detail` | `id_producto`, `nombre_producto`, `categoria`, `precio`, `en_stock` | Productos más vistos e interés en productos agotados. |
| `click_add_to_cart` | `id_producto`, `nombre_producto`, `precio`, `cantidad`, `origen` (`grilla` / `ficha`) | Intención de agregar al carrito y desde qué pantalla. |
| `view_signup_form` | `origen` (`login` / `directo`) | Base del embudo de registro. |
| `submit_sign_up_attempt` | `campos_completos` | Intención real de registrarse. |
| `sign_up_success` | `id_usuario`, `fecha_registro` | Numerador de la tasa de conversión de registro. |
| `sign_up_error` | `tipo_error` (`email_duplicado`, `validacion_password`, `error_servidor`, `otro`) | Diagnóstico de fricción en el registro. |

`sign_up_success` y `sign_up_error` son mutuamente excluyentes: cada
`submit_sign_up_attempt` termina en uno de los dos.

### Cómo guardar la evidencia

- Para conservar el historial completo de una sesión: activar **Preserve log**,
  reproducir el flujo y usar clic derecho sobre la consola → **Save as…** (Chrome
  y Edge) o **Export / Save** según el navegador.
- También se puede copiar la salida con clic derecho → **Copy console** y pegarla
  en un archivo de texto o planilla.
- Para reportar un caso puntual alcanza con una captura donde se vea la línea
  `[evento]` completa y el objeto expandido con todos sus parámetros.

### Decisiones de instrumentación que conviene conocer

- Los links de categorías del **navbar** se reportan con `origen: 'filtro'`
  porque en desktop esa barra es el único filtro de categorías.
- `view_item_list` sin filtro envía `categoria: ''` porque no hay un valor de
  base para "Todos".
- Si el formulario de registro falla una validación del cliente, también se
  emite `sign_up_error`, para que todo intento tenga un cierre.
- `/registro` abierto directamente envía `origen: 'directo'` (valor adicional a
  los ejemplos de la planilla).
