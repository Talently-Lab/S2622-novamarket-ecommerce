# Button (receta Figma `Buttons` 160:302)

No hay componente nuevo: es solo una receta del theme sobre el
`<Button />` de Chakra. Se usa el `Button` de `@chakra-ui/react`
directo con la prop `variant`.

> Aviso visible: el token `azul.600` (`#355871`) sigue pendiente de
> confirmación de diseño (ver `src/theme/system.ts`).

## Variantes

| Variante                | Apariencia (48 px de alto, radio 8 px, texto 16 px)                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------- |
| `primary` (por defecto) | Fondo `accion.primaria`, texto blanco semibold; al pasar el cursor cambia a `accion.primaria-hover`. |
| `secondary`             | Fondo blanco (`fondo.superficie`), borde de 1 px `azul.600`, texto `azul.900` semibold.              |
| `link`                  | Sin fondo ni borde, texto `azul.600` regular subrayado.                                              |

Cualquier variante con `disabled` muestra fondo `fondo.deshabilitado`
y texto `azul.600`, según Figma.

## Ejemplos

```tsx
import { Button } from '@chakra-ui/react';

// Principal (también vale sin variant: primary es el valor por defecto).
<Button variant="primary">Continuar</Button>;

// Secundaria.
<Button variant="secondary">Cancelar</Button>;

// Tipo enlace.
<Button variant="link">Ver detalles</Button>;

// Deshabilitado (aplica a cualquier variante).
<Button variant="primary" disabled>
  Continuar
</Button>;
```

## Solo receta, sin wrapper

Los estilos viven en `src/theme/button.recipe.ts` y se registran en
`src/theme/system.ts`. No existe `SharedButton`: no hay API nueva que
aprender, solo la prop `variant` del `Button` de Chakra.

## Nota de tipos

Las variantes `primary`, `secondary` y `link` no existen en el tema
base de Chakra, así que sus tipos se generan desde nuestro theme con
`chakra typegen`. El script `postinstall` lo re-ejecuta en cada
`npm install`; si agregas variantes a la receta, corre
`npx chakra typegen ./src/theme/system.ts` para actualizarlos.
