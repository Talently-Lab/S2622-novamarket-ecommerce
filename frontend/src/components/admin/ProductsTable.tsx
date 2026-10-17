import { useState } from 'react';
import type { Product } from '../../types/product.ts';
import { getCategoryDisplayName } from '../../utils/categories.ts';
import { formatPrice } from '../../utils/format.ts';
import Icon from '../icons/Icon.tsx';

export interface ProductsViewProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

/**
 * Product thumbnail. The design shows a grey tile with a picture glyph; on a
 * broken or empty `imagenUrl` the tile keeps that glyph instead of showing the
 * browser's broken-image affordance (same policy as ProductCard).
 */
function Thumb({ product }: { product: Product }) {
  const [failed, setFailed] = useState(false);
  const showImage = product.imageUrl !== '' && !failed;

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-fondo-deshabilitado">
      {showImage ? (
        <img
          src={product.imageUrl}
          alt=""
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Icon name="image" className="text-xl text-texto-principal" />
      )}
    </span>
  );
}

function RowActions({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: ProductsViewProps['onEdit'];
  onDelete: ProductsViewProps['onDelete'];
}) {
  return (
    <>
      <button
        type="button"
        aria-label={`Editar ${product.name}`}
        onClick={() => onEdit(product)}
        className="flex h-11 w-11 items-center justify-center rounded-md text-texto-principal hover:bg-fondo-pagina"
      >
        <Icon name="edit" className="text-xl" />
      </button>
      <button
        type="button"
        aria-label={`Eliminar ${product.name}`}
        onClick={() => onDelete(product)}
        className="flex h-11 w-11 items-center justify-center rounded-md text-texto-principal hover:bg-fondo-pagina"
      >
        <Icon name="delete" className="text-xl" />
      </button>
    </>
  );
}

/** Desktop products view: the dark-header table from Body-admin-desktop.jpg. */
export function ProductsTable({
  products,
  onEdit,
  onDelete,
}: ProductsViewProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-borde-divisor bg-fondo-superficie">
      <table className="w-full border-collapse text-left">
        <thead className="bg-fondo-estructura text-texto-sobre-estructura">
          <tr>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Producto
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Categoría
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Precio
            </th>
            <th scope="col" className="px-4 py-3 text-cuerpo-chico-label">
              Stock
            </th>
            <th scope="col" className="px-4 py-3 text-right text-cuerpo-chico-label">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-t border-borde-divisor">
              <td className="px-4 py-3">
                <span className="flex items-center gap-3">
                  <Thumb product={product} />
                  <span className="text-cuerpo text-texto-principal">
                    {product.name}
                  </span>
                </span>
              </td>
              <td className="px-4 py-3 text-cuerpo text-texto-secundario">
                {getCategoryDisplayName(product.category)}
              </td>
              <td className="px-4 py-3 text-precio font-bold text-texto-principal">
                {formatPrice(product.price)}
              </td>
              <td className="px-4 py-3 text-cuerpo text-texto-secundario">
                {product.stock} u.
              </td>
              <td className="px-4 py-3">
                <span className="flex items-center justify-end gap-1">
                  <RowActions
                    product={product}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile products view: the stacked rows from Body.jpg. */
export function ProductsList({
  products,
  onEdit,
  onDelete,
}: ProductsViewProps) {
  return (
    <ul className="flex flex-col">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex items-center gap-3 border-b border-borde-divisor py-3"
        >
          <Thumb product={product} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-cuerpo font-semibold text-texto-principal">
              {product.name}
            </p>
            <p className="text-cuerpo-chico text-texto-secundario">
              {getCategoryDisplayName(product.category)} · Stock:{' '}
              {product.stock} u.
            </p>
            <p className="text-precio font-bold text-texto-principal">
              {formatPrice(product.price)}
            </p>
          </div>
          <div className="flex shrink-0 items-center">
            <RowActions
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
