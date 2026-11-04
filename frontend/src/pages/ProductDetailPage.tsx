import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button } from '@chakra-ui/react';
import { trackEvent } from '../analytics/trackEvent.ts';
import AddedAlert from '../components/AddedAlert.tsx';
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
      <main className="flex w-full justify-center px-4 pt-6 pb-4 md:px-20">
        <div className="w-full max-w-[1280px]">
          <div className="max-w-md">
            <ProductCardSkeleton />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex w-full justify-center px-4 pt-6 pb-4 text-center md:px-20">
        <div className="w-full max-w-[1280px]">
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
        </div>
      </main>
    );
  }

  return (
    // Figma `D - Detalle` #648:5087: body `24px 80px 16px` on the shared
    // 1280px column, with a 560px image and a 48px gutter.
    <main className="flex w-full justify-center px-4 pt-6 pb-4 md:px-20">
      <div className="w-full max-w-[1280px]">
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:gap-8 xl:grid-cols-[560px_minmax(0,1fr)] xl:gap-12 xl:pr-12">
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

            <div className="border-borde-divisor mt-8 border-t pt-6">
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
                  void addItem(product).then((added) => {
                    if (added) markAdded(String(product.id));
                  });
                }}
                style={{ width: '100%', height: '48px' }}
              >
                <Icon name="shopping_cart" className="mr-2 text-xl" />
                {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
              </Button>
            </div>
          </div>
        </div>

        {/* Figma `648:5146`: the confirmation floats over the page, it is not a
          state of the CTA. */}
        <AddedAlert visible={addedId === String(product.id)} />
      </div>
    </main>
  );
}
