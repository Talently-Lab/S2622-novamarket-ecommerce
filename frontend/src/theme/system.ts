import { createSystem, defaultConfig } from '@chakra-ui/react';

// Chakra v3 system. Global preflight is disabled per the official docs
// (`createSystem(defaultConfig, { preflight: false })`) so it does not
// fight Tailwind v4, which owns the CSS reset via `@import 'tailwindcss'`
// in src/index.css. NovaMarket semantic tokens are bridged here in T2.
export const system = createSystem(defaultConfig, { preflight: false });
