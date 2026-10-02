import { products } from '../mocks/products.ts';

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        Products
      </h1>
      <p className="mt-2 text-slate-600">
        Low-fi catalog with {products.length} mock products.
      </p>
      <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <li
            key={product.id}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              loading="lazy"
              className="aspect-[3/2] w-full bg-slate-100 object-cover"
            />
            <div className="p-4">
              <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                {product.category}
              </p>
              <h2 className="mt-1 text-sm font-semibold text-slate-900">
                {product.name}
              </h2>
              <p className="mt-2 text-base font-bold text-slate-900">
                ${product.price.toLocaleString('en-US')}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Stock: {product.stock}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
