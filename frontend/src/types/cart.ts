// Display-shape types for the cart UI. The API mapping will land with the
// cart service (SN-285); this page only consumes props.
export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock?: number;
  imageUrl?: string;
}
