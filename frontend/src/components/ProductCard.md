# ProductCard (Figma `178:2042` / set `178:2059`)

Reusable catalog card. Fluid width: it fills its grid column on mobile,
tablet and desktop. No cart logic, no fetching.

## Variants (derived from props, deterministic)

| Props                              | Visual                        |
| ---------------------------------- | ----------------------------- |
| In stock, `added` unset            | CTA `Agregar` (primary)       |
| In stock, `added`                  | Green `Agregado` confirmation |
| `product.stock <= 0` (wins always) | Disabled `Sin stock` CTA      |

## Examples

```tsx
import ProductCard from './components/ProductCard.tsx';
import ProductCardSkeleton from './components/ProductCardSkeleton.tsx';

// A `Product` comes from the API-backed catalog service (`getProductsFromApi`).
const product = {
  id: '6ace8d886e3eb92ea0fc9bdc',
  name: 'Auriculares Bluetooth NovaSound X1',
  description: 'Auriculares inalámbricos',
  price: 45999,
  stock: 24,
  category: 'accesorios',
  imageUrl: 'https://placehold.co/600x400/png?text=Producto',
};

// Default: fires only the callback, nothing else.
<ProductCard product={product} onAdd={(p) => console.log(p.id)} />;

// Added confirmation (e.g. right after the callback fires).
<ProductCard product={product} added />;

// Out of stock derives from `product.stock <= 0`; CTA is disabled.
<ProductCard product={{ ...product, stock: 0 }} />;

// Loading grid: same geometry, `role="status"`, no buttons.
<ProductCardSkeleton />;
```

## Notes

- Broken images swap to a local placeholder (`role="img"` with the
  product name): gris-200 box with a large (`text-4xl`) dark-navy
  `image_not_supported` Material Symbol; no external retry URL.
- Both CTAs force `style={{ width: '100%' }}` inline: the shared recipe
  fixes width at 240px in a cascade layer injected after Tailwind's
  utilities, so neither the `width` style prop nor `w-full` survive.
  Height stays 44px per card design (recipe default is 240x48).
