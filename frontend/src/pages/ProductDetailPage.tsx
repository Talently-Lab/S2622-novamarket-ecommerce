import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import Icon from '../components/icons/Icon.tsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.tsx';
import { useCategories } from '../hooks/useCategories.ts';
import { getProductById } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import { formatPrice } from '../utils/format.ts';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { labelFor } = useCategories();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProductById(id, controller.signal);
        if (controller.signal.aborted) return;
        setProduct(data);
        setLoading(false);
      } catch (err) {
        // An aborted request is a navigation, not a failure to report.
        if (controller.signal.aborted) return;
        setError(
          err instanceof Error
            ? err.message
            : 'No pudimos cargar el detalle del producto.',
        );
        setLoading(false);
      }
    }

    void loadProduct();

    return () => {
      controller.abort();
    };
  }, [id]);

  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="max-w-md">
          <ProductCardSkeleton />
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h1 className="text-titulo-2 font-bold text-texto-principal">
          Producto no encontrado
        </h1>
        <p className="mt-2 text-cuerpo text-texto-secundario">
          {error ?? 'El producto solicitado no existe.'}
        </p>
        <Link
          to="/productos"
          className="mt-6 inline-flex items-center gap-1 text-cuerpo-boton font-semibold text-accion-primaria underline hover:text-accion-primaria-hover"
        >
          <Icon name="chevron_left" className="text-xl" />
          Volver al catálogo
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Navegación / Breadcrumbs */}
      <nav aria-label="Miga de pan">
        <ol className="flex items-center gap-1 text-caption text-texto-secundario">
          <li>
            <Link to="/" className="underline hover:text-texto-principal">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={`/productos?categoria=${product.category}`}
              className="underline hover:text-texto-principal"
            >
              {labelFor(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-semibold text-texto-principal">
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Imagen del producto */}
        <div className="aspect-square w-full overflow-hidden rounded-xl border border-borde-divisor bg-fondo-superficie">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-caption font-semibold uppercase tracking-wider text-texto-secundario">
              {labelFor(product.category)}
            </span>
            <h1 className="mt-1 text-titulo-1 font-bold text-texto-principal">
              {product.name}
            </h1>
            <p className="mt-3 text-precio font-bold text-texto-principal">
              {formatPrice(product.price)}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  product.stock > 0 ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="text-cuerpo-chico text-texto-secundario">
                {product.stock > 0
                  ? `Stock disponible: ${product.stock} u.`
                  : 'Sin stock'}
              </span>
            </div>

            <hr className="my-6 border-borde-divisor" />

            <div>
              <h2 className="text-cuerpo-chico-label font-bold text-texto-principal">
                Descripción
              </h2>
              <p className="mt-2 whitespace-pre-line text-cuerpo text-texto-secundario">
                {product.description || 'Sin descripción disponible.'}
              </p>
            </div>
          </div>

          {/* Botón "Agregar al carrito" preparado sin lógica aún */}
          <div className="mt-8 border-t border-borde-divisor pt-6">
            <Button
              variant="primary"
              disabled={product.stock <= 0}
              onClick={() => {
                console.log('Agregar al carrito ID:', product.id);
              }}
              style={{ width: '100%' }}
            >
              <Icon name="shopping_cart" className="mr-2 text-xl" />
              {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}