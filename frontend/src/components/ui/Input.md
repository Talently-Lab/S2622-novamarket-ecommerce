# SharedInput — cómo usarlo

Input compartido con los 5 estados del Figma (`Inputs`, set `160:295`):
Default, Focus, Error, Completed y Disabled.
El estilo sale de la recipe `input` del theme; este componente solo
conecta label, helper/error, icono y accesibilidad.

> Estás en la rama `feat/shared-input-figma`. En `main` este
> componente todavía no existe.

## Uso básico

```tsx
import { SharedInput } from '../components/ui/Input.tsx';

<SharedInput
  id="login-email"
  label="Correo electrónico"
  type="email"
  value={email}
  onChange={(event) => setEmail(event.target.value)}
/>;
```

## Con validación (caso típico en Login/Register)

```tsx
<SharedInput
  id="register-password"
  label="Contraseña"
  type="password"
  value={password}
  onChange={(event) => setPassword(event.target.value)}
  helperText="Mínimo 8 caracteres"
  errorText={errors.password}
  isInvalid={Boolean(errors.password)}
  isDisabled={pending}
/>
```

Reglas que el componente aplica solo:

- Si `isInvalid + errorText` → borde rojo de 2px + mensaje de error.
  El `helperText` se oculta mientras haya error.
- Si `isDisabled` → opacidad 0.55 y no editable.
- Siempre: `aria-invalid` y `aria-describedby` enlazados al
  helper/error correspondientes. No hay que hacerlo a mano.

## Props

| Prop           | Requerida | Tipo                                              | Qué hace                                                   |
| -------------- | --------- | ------------------------------------------------- | ---------------------------------------------------------- |
| `label`        | Sí        | `string`                                          | Etiqueta de 14px sobre el input.                           |
| `helperText`   | No        | `string`                                          | Texto de ayuda de 12px. Se oculta si hay error.            |
| `errorText`    | No        | `string`                                          | Mensaje de error de 12px. Requiere `isInvalid`.            |
| `icon`         | No        | `ReactNode`                                       | Icono a la derecha del input.                              |
| `isDisabled`   | No        | `boolean`                                         | Estado Disabled (opacidad 0.55).                           |
| `isInvalid`    | No        | `boolean`                                         | Estado Error (borde `#B91C1C` 2px + `errorText`).           |
| `isCompleted`  | No        | `boolean`                                         | Marca el estado Completed (ver nota abajo).                |
| `visualState`  | No        | `'default' \| 'focus' \| 'error' \| 'completed' \| 'disabled'` | Fuerza un estado visual. Solo para previews y tests. |
| `id`           | No        | `string`                                          | Si se omite, se genera uno con `useId()`.                  |
| `type`, `value`, `onChange`, `placeholder`, `name`, `autoComplete`, … | No | Las de `Input` de Chakra | Pasan directo al input interno. El editor las autocompleta. |

Orden de prioridad si se combinan: `visualState` > `isDisabled` >
`isInvalid` > `isCompleted` > `default`.

## Notas

- **Con Chakra puro también vale**: un `<Input />` de
  `@chakra-ui/react` ya renderiza el estilo Figma gracias a la recipe.
  `SharedInput` es solo el atajo para no armar
  `Field + Label + Input + ErrorText` a mano.
- **Completed no tiene borde propio**: Figma no le asigna borde
  distinto, así que `isCompleted` solo marca `data-completed` (útil
  para tests). Visualmente se ve como Default.
- **Label**: Figma pide `#0E2926`, color que aún no tiene token en el
  theme, así que el label usa `texto.principal` hasta que diseño lo
  confirme. Lo mismo con `azul/600 #355871` (ver comentario en
  `src/theme/system.ts`).
- No hardcodear colores: todo sale de los tokens semánticos
  (`borde.input`, `borde.foco`, `borde.error`).
