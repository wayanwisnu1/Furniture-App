export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  imageKey: 'lamp' | 'chair' | 'sofa';
  colors: string[];
  description: string;
  stock: number;
  rating: number;
};

export type ProductResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  categories: string[];
};

export type CartItem = {
  product: Product;
  quantity: number;
  subtotal: number;
};

export type Cart = {
  items: CartItem[];
  total: number;
  count: number;
};

export type Content = {
  title: string;
  body: string;
};
