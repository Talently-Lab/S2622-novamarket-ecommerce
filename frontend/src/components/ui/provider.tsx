import { ChakraProvider } from '@chakra-ui/react';
import type { ReactNode } from 'react';
import { system } from '../../theme/system.ts';

// Docs-prescribed Chakra v3 provider (components/ui/provider).
// Rendered once at the app root in src/main.tsx.
export function Provider({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
