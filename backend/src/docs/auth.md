# Rutas de autenticación

## Registrar usuario

Registra un usuario nuevo y devuelve un token de autenticación junto con sus
datos (sin la contraseña).

### Solicitud

- **Método:** `POST`
- **Ruta:** `/api/auth/register`
- **Content-Type:** `application/json`

El front debe enviar estos campos:

| Campo | Tipo | Requerido | Validación del servidor |
| --- | --- | --- | --- |
| `nombre` | string | Sí | Al menos 2 caracteres |
| `email` | string | Sí | Debe tener formato de email válido |
| `password` | string | Sí | Al menos 8 caracteres, una mayúscula, una minúscula y un número |

Ejemplo:

```json
{
  "nombre": "Ana Pérez",
  "email": "ana@example.com",
  "password": "ClaveSegura1"
}
```

No se envía `confirmPassword`; la confirmación, si el front la solicita, se
valida localmente y no se guarda en el servidor.


### Validaciones y errores

El cuerpo de error tiene esta forma:

```json
{
  "ok": false,
  "message": "El email ya está registrado",
  "error": "El email ya está registrado"
}
```

### Respuesta exitosa

Si el registro se completa, el servidor responde con estado HTTP `201`:

```json
{
  "ok": true,
  "message": "Usuario registrado correctamente",
  "data": {
    "token": "<jwt>",
    "user": {
      "_id": "<id>",
      "nombre": "Ana Pérez",
      "email": "ana@example.com",
      "rol": "client",
      "carrito": {
        "items": [],
        "fechaCreacion": null,
        "fechaActualizacion": null
      },
      "createdAt": "<fecha>",
      "updatedAt": "<fecha>",
      "__v": 0
    }
  }
}
```
