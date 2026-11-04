// Display-shape types for the cart UI. `cartService` maps the backend
// `/api/cart` DTO (Spanish field names, `cantidad`) into this shape, and the
// guest cart stores it in localStorage as-is.
export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock?: number;
  imageUrl?: string;
}
