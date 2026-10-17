/**
 * Shared catalog domain type (SN-249).
 * `id` accepts string (Mongo `_id`) and number (legacy numeric fixtures)
 * so API-backed and mock-backed products share one shape.
 */
export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}
