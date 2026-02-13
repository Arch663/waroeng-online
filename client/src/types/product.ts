export interface Product {
  id: number;
  sku?: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}
