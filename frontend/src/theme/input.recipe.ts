import { defineRecipe } from '@chakra-ui/react';

// Shared Figma "Inputs" recipe (component set 160:295).
// Overrides the default Chakra `input` recipe so every Chakra `Input`
// renders the NovaMarket style: 48px box, 8px radius (radii.md),
// white surface, 16px horizontal padding, 1px borde.input border.
// Focus and error read as 2px per Figma: the extra pixel is an inner
// 1px outline (offset -1px) so the box never shifts layout on state
// change. All colors are semantic tokens from src/theme/system.ts;
// no hex lives here.
// The `visualState` variant mirrors the Figma variants for
// deterministic previews and tests; real interaction still flows
// through _focusVisible / _invalid / _disabled. Forced states ride on
// the `data-visual-state` attribute (set by the SharedInput wrapper)
// because Chakra types custom recipe variants out of the `Input`
// props, so a custom variant prop would not typecheck. `completed`
// keeps the default border because Figma assigns it no distinct
// border.
const focusRing = {
  borderColor: 'borde.foco',
  outline: '1px solid',
  outlineColor: 'borde.foco',
  outlineOffset: '-1px',
};

const errorRing = {
  borderColor: 'borde.error',
  outline: '1px solid',
  outlineColor: 'borde.error',
  outlineOffset: '-1px',
};

const disabledLook = {
  opacity: 0.55,
  cursor: 'not-allowed',
};

export const inputRecipe = defineRecipe({
  className: 'novamarket-input',
  base: {
    width: '100%',
    height: '48px',
    px: '16px',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '24px',
    color: 'texto.principal',
    bg: 'fondo.superficie',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'borde.input',
    borderRadius: 'md',
    outline: 'none',
    _placeholder: {
      color: 'texto.principal',
      opacity: 0.55,
    },
    _focusVisible: focusRing,
    _invalid: errorRing,
    _disabled: disabledLook,
    "&[data-visual-state='focus']": focusRing,
    "&[data-visual-state='error']": errorRing,
    "&[data-visual-state='disabled']": disabledLook,
  },
});
