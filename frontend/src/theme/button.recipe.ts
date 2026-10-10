import { defineRecipe } from '@chakra-ui/react';

// Shared Figma "Buttons" recipe (component set 160:302).
// Overrides the default Chakra `button` recipe so the team keeps using
// Chakra `<Button />` directly with `variant="primary" | "secondary" | "link"`.
// No wrapper component: there is no new API to learn.
// Figma: 240x48 box, 8px radius (radii.md), 16px text. Primary hover
// switches to `accion.primaria-hover`; disabled is a flat gray fill.
// All colors are semantic tokens from src/theme/system.ts; no hex lives here.
// NOTE: `texto.secundario` resolves to azul/600 (#355871), still pending
// design confirm — see src/theme/system.ts.
export const buttonRecipe = defineRecipe({
  className: 'novamarket-button',
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '240px',
    height: '48px',
    px: '16px',
    fontSize: '16px',
    lineHeight: '24px',
    borderRadius: 'md',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    _disabled: {
      bg: 'fondo.deshabilitado',
      color: 'texto.secundario',
      borderColor: 'transparent',
      cursor: 'not-allowed',
      opacity: 1,
    },
  },
  variants: {
    variant: {
      primary: {
        bg: 'accion.primaria',
        color: 'texto.sobre-accion',
        fontWeight: 'semibold',
        _hover: {
          bg: 'accion.primaria-hover',
        },
      },
      secondary: {
        bg: 'fondo.superficie',
        color: 'texto.principal',
        fontWeight: 'semibold',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'texto.secundario',
      },
      link: {
        width: 'auto',
        bg: 'transparent',
        color: 'texto.secundario',
        fontWeight: 'normal',
        textDecoration: 'underline',
      },
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
});
