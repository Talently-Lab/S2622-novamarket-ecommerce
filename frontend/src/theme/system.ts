import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import { inputRecipe } from './input.recipe.ts';

// NovaMarket theme bridge for Chakra v3.
// Primitives mirror frontend/src/index.css `@theme` (same hex values);
// semantics reference primitives via `{colors.*}` so components consume
// only semantic names. No hard hex lives outside this file.
// NOTE: azul/600 is assumed #355871 (guide image read as #3S5871).
// Pending design confirm — keep this assumption visible.
const config = defineConfig({
  // Disabled per official docs so Chakra does not fight Tailwind v4,
  // which owns the CSS reset via `@import 'tailwindcss'` in index.css.
  preflight: false,
  theme: {
    recipes: {
      input: inputRecipe,
    },
    tokens: {
      colors: {
        azul: {
          900: { value: '#1e293b' },
          600: { value: '#355871' },
        },
        naranja: {
          700: { value: '#a3450e' },
          600: { value: '#c45311' },
          500: { value: '#ed742d' },
        },
        menta: {
          300: { value: '#99f2c8' },
        },
        rojo: {
          700: { value: '#b91c1c' },
        },
        gris: {
          0: { value: '#ffffff' },
          50: { value: '#f8fafc' },
          200: { value: '#e4e4e4' },
          '50-a16': {
            value: 'color-mix(in srgb, #f8fafc 16%, transparent)',
          },
        },
      },
      fonts: {
        body: {
          value: "'Inter', ui-sans-serif, system-ui, sans-serif",
        },
        heading: {
          value: "'Inter', ui-sans-serif, system-ui, sans-serif",
        },
      },
      radii: {
        sm: { value: '4px' },
        md: { value: '8px' },
        lg: { value: '12px' },
        xl: { value: '16px' },
      },
    },
    semanticTokens: {
      colors: {
        fondo: {
          pagina: { value: '{colors.gris.50}' },
          superficie: { value: '{colors.gris.0}' },
          estructura: { value: '{colors.azul.900}' },
          deshabilitado: { value: '{colors.gris.200}' },
          exito: { value: '{colors.menta.300}' },
        },
        texto: {
          principal: { value: '{colors.azul.900}' },
          secundario: { value: '{colors.azul.600}' },
          'sobre-estructura': { value: '{colors.gris.50}' },
          'sobre-estructura-sec': { value: '{colors.gris.200}' },
          'sobre-accion': { value: '{colors.gris.0}' },
          'sobre-exito': { value: '{colors.azul.900}' },
          error: { value: '{colors.rojo.700}' },
        },
        accion: {
          primaria: { value: '{colors.naranja.600}' },
          'primaria-hover': { value: '{colors.naranja.700}' },
          acento: { value: '{colors.naranja.500}' },
        },
        borde: {
          divisor: { value: '{colors.gris.200}' },
          'divisor-estructura': { value: '{colors.gris.50-a16}' },
          input: { value: '{colors.azul.600}' },
          foco: { value: '{colors.azul.900}' },
          error: { value: '{colors.rojo.700}' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
