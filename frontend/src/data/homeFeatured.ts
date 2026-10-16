// Local mock data for the mini-deploy featured row. Visual only:
// the Agregar button has no cart logic yet.
export interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
}

export const HOME_FEATURED_PRODUCTS: FeaturedProduct[] = [
  { id: 'home-auriculares', name: 'Auriculares inalámbricos NovaSound', price: 32000 },
  { id: 'home-teclado', name: 'Teclado mecánico NovaKeys', price: 32000 },
  { id: 'home-parlante', name: 'Parlante portátil NovaBoom', price: 32000 },
  { id: 'home-mouse', name: 'Mouse ergonómico NovaClick', price: 32000 },
];
