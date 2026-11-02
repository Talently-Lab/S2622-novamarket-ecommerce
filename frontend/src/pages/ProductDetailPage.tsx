import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import { trackEvent } from '../analytics/trackEvent.ts';
import Icon from '../components/icons/Icon.tsx';
import ProductCardSkeleton from '../components/ProductCardSkeleton.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useAddedFeedback } from '../hooks/useAddedFeedback.ts';
import { useCategories } from '../hooks/useCategories.ts';
import { getProductById } from '../services/productService.ts';
import type { Product } from '../types/product.ts';
import { formatPrice } from '../utils/format.ts';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { labelFor } = useCategories();
  const { addItem } = useCart();
  const { addedId, markAdded } = useAddedFeedback();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    // Bind the narrowed route param: narrowing is not carried into the async
    // closure below, so `id` would widen back to `string | undefined`.
    const productId = id;
    const controller = new AbortController();

    async function loadProduct() {
      setLoading(true);
      setError(null);

      try {
        const data = await getProductById(productId, controller.signal);
        if (controller.signal.aborted) return;
        setProduct(data);
        setLoading(false);
        trackEvent('view_item_detail', {
          id_producto: data.id,
          nombre_producto: data.name,
          categoria: data.category,
          precio: data.price,
          en_stock: data.stock > 0,
        });
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
        <h1 className="text-titulo-2 text-texto-principal font-bold">
          Producto no encontrado
        </h1>
        <p className="text-cuerpo text-texto-secundario mt-2">
          {error ?? 'El producto solicitado no existe.'}
        </p>
        <Link
          to="/productos"
          className="text-cuerpo-boton text-accion-primaria hover:text-accion-primaria-hover mt-6 inline-flex items-center gap-1 font-semibold underline"
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
        <ol className="text-caption text-texto-secundario flex items-center gap-1">
          <li>
            <Link to="/" className="hover:text-texto-principal underline">
              Inicio
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              to={`/productos?categoria=${product.category}`}
              className="hover:text-texto-principal underline"
            >
              {labelFor(product.category)}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span
              aria-current="page"
              className="text-texto-principal font-semibold"
            >
              {product.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* Imagen del producto */}
        <div className="border-borde-divisor bg-fondo-superficie aspect-square w-full overflow-hidden rounded-xl border">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <span className="text-caption text-texto-secundario font-semibold tracking-wider uppercase">
              {labelFor(product.category)}
            </span>
            <h1 className="text-titulo-1 text-texto-principal mt-1 font-bold">
              {product.name}
            </h1>
            <p className="text-precio text-texto-principal mt-3 font-bold">
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

            <hr className="border-borde-divisor my-6" />

            <div>
              <h2 className="text-cuerpo-chico-label text-texto-principal font-bold">
                Descripción
              </h2>
              <p className="text-cuerpo text-texto-secundario mt-2 whitespace-pre-line">
                {product.description || 'Sin descripción disponible.'}
              </p>
            </div>
          </div>

          {/* Figma `648:5146` ("Alert Added-to-cart"): the CTA becomes a
              green confirmation for 2 s, then returns to the button. */}
          <div className="border-borde-divisor mt-8 border-t pt-6">
            {addedId === String(product.id) ? (
              <p
                role="status"
                className="text-cuerpo-boton bg-fondo-exito text-texto-sobre-exito flex h-12 w-full items-center justify-center gap-2 rounded-md px-4 font-semibold"
              >
                <Icon name="check" />
                Agregado al carrito
              </p>
            ) : (
              <Button
                variant="primary"
                disabled={product.stock <= 0}
                onClick={() => {
                  trackEvent('click_add_to_cart', {
                    id_producto: product.id,
                    nombre_producto: product.name,
                    precio: product.price,
                    cantidad: 1,
                    origen: 'ficha',
                  });
                  markAdded(String(product.id));
                  addItem(product);
                }}
                style={{ width: '100%', height: '48px' }}
              >
                <Icon name="shopping_cart" className="mr-2 text-xl" />
                {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
