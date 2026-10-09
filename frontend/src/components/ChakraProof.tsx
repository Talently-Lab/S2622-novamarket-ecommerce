import { Box, Button, Text } from '@chakra-ui/react';
import { Link } from 'react-router';

// Single proof that NovaMarket semantic tokens flow through Chakra.
// Uses only semantic token names (fondo/borde/texto/accion) — no hex here.
export function ChakraProof() {
  return (
    <Box
      bg="fondo.superficie"
      borderColor="borde.divisor"
      borderWidth="1px"
      borderRadius="lg"
      p="6"
      mt="8"
    >
      <Text color="texto.principal" fontWeight="semibold">
        Componentes NovaMarket
      </Text>
      <Text color="texto.secundario" mt="1">
        Prueba de tokens semánticos con Chakra UI.
      </Text>
      <Button
        asChild
        bg="accion.primaria"
        color="texto.sobre-accion"
        borderRadius="md"
        mt="4"
        _hover={{ bg: 'accion.primaria-hover' }}
      >
        <Link to="/productos">Ver productos</Link>
      </Button>
    </Box>
  );
}
