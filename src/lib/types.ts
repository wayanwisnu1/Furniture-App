export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  imageKey: 'lamp' | 'chair' | 'sofa';
  imageUrl?: string;
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

export type AdminOrder = {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  cart: Cart;
  createdAt: string;
};

export type AdminContact = {
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type AdminCategorySummary = {
  category: string;
  products: number;
  stock: number;
  value: number;
};

export type AdminActiveCart = Cart & {
  sessionId: string;
};

export type AdminSummary = {
  generatedAt: string;
  totals: {
    products: number;
    stock: number;
    inventoryValue: number;
    activeCarts: number;
    cartItems: number;
    cartValue: number;
    orders: number;
    revenue: number;
    contacts: number;
    subscribers: number;
    lowStock: number;
  };
  categories: AdminCategorySummary[];
  products: Product[];
  lowStockProducts: Product[];
  orders: AdminOrder[];
  activeCarts: AdminActiveCart[];
  contacts: AdminContact[];
  subscribers: string[];
};
