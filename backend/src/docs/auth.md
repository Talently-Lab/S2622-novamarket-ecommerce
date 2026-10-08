# Rutas de autenticación

## Registrar usuario

Registra un usuario nuevo y devuelve un token de autenticación junto con sus
datos (sin la contraseña).

### Solicitud

- **Método:** `POST`
- **Ruta:** `/api/auth/register`
- **Content-Type:** `application/json`

El cuerpo de la solicitud debe incluir estos campos:

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

`confirmPassword` no forma parte del contrato de este endpoint.


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

## Iniciar sesión

Autentica a un usuario con su email y contraseña. Si las credenciales son
válidas, devuelve un JWT y los datos del usuario sin incluir la contraseña.

### Solicitud

- **Método:** `POST`
- **Ruta:** `/api/auth/login`
- **Content-Type:** `application/json`

El cuerpo debe incluir:

| Campo | Tipo | Requerido | Validación del servidor |
| --- | --- | --- | --- |
| `email` | string | Sí | Debe tener formato de email válido |
| `password` | string | Sí | Debe ser una cadena de texto |

Ejemplo:

```json
{
  "email": "ana@example.com",
  "password": "ClaveSegura1"
}
```

### Errores

Los errores de validación tienen estado HTTP `400`. Se devuelve el primer error
de validación encontrado:

| Situación | Mensaje |
| --- | --- |
| `email` no es una cadena de texto o falta | `El email debe ser una cadena de texto` |
| `email` tiene formato inválido o está vacío | `Email inválido` |
| `password` no es una cadena de texto o falta | `La contraseña debe ser una cadena de texto` |
| No existe un usuario con ese email o la contraseña no coincide | `Credenciales inválidas` |

Los errores de credenciales responden con estado HTTP `401`. El cuerpo de error
tiene esta forma:

```json
{
  "ok": false,
  "message": "Credenciales inválidas",
  "error": "Credenciales inválidas"
}
```

Actualmente, cualquier excepción que ocurra durante el inicio de sesión se
responde con estado HTTP `401` y el mensaje de la excepción.

### Respuesta exitosa

Si las credenciales son válidas, el servidor responde con estado HTTP `200`:

```json
{
  "ok": true,
  "message": "Login exitoso",
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

El JWT vence en 1 día e incluye el identificador y el rol del usuario. La
contraseña no se incluye en la respuesta.
