import type { AdminSummary, Cart, Content, ProductResponse } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {};

  if (!response.ok) {
    if (url.startsWith('/api/admin/') && response.status === 404) {
      throw new Error('Server admin belum aktif. Restart dev server dengan npm.cmd run dev, lalu coba login lagi.');
    }

    throw new Error(payload.error || `Request failed (${response.status})`);
  }

  if (!contentType.includes('application/json')) {
    if (url.startsWith('/api/admin/')) {
      throw new Error('Server admin belum aktif. Restart dev server dengan npm.cmd run dev, lalu coba login lagi.');
    }

    throw new Error('API returned a non-JSON response. Please restart the app server.');
  }

  return payload as T;
}

export function getSessionId() {
  const key = 'sofa-session-id';
  const existing = window.localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const next = `web-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  window.localStorage.setItem(key, next);
  return next;
}

export function fetchProducts(params: { category?: string; q?: string; page?: number; limit?: number } = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      search.set(key, String(value));
    }
  });

  return request<ProductResponse>(`/api/products?${search.toString()}`);
}

export function fetchCart(sessionId: string) {
  return request<Cart>(`/api/cart/${encodeURIComponent(sessionId)}`);
}

export function addCartItem(sessionId: string, productId: string, quantity = 1) {
  return request<Cart>(`/api/cart/${encodeURIComponent(sessionId)}/items`, {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
}

export function updateCartItem(sessionId: string, productId: string, quantity: number) {
  return request<Cart>(`/api/cart/${encodeURIComponent(sessionId)}/items/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ quantity }),
  });
}

export function removeCartItem(sessionId: string, productId: string) {
  return request<Cart>(`/api/cart/${encodeURIComponent(sessionId)}/items/${encodeURIComponent(productId)}`, {
    method: 'DELETE',
  });
}

export function submitOrder(sessionId: string, data: { name: string; email: string; phone: string; address: string }) {
  return request<{ order: { id: string } }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ sessionId, ...data }),
  });
}

export function submitContact(data: { name: string; email: string; message: string }) {
  return request<{ ok: boolean; message: string }>('/api/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function subscribeNewsletter(email: string) {
  return request<{ ok: boolean; message: string }>('/api/newsletter', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function fetchArticle(slug: string) {
  return request<Content>(`/api/articles/${encodeURIComponent(slug)}`);
}

export function fetchPage(slug: string) {
  return request<Content>(`/api/pages/${encodeURIComponent(slug)}`);
}

export function loginAdmin(email: string, password: string) {
  return request<{ token: string; email: string }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function logoutAdmin(token: string) {
  return request<{ ok: boolean }>('/api/admin/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
}

function buildAdminSummaryFallback(products: ProductResponse['products']): AdminSummary {
  const categories = Array.from(new Set(products.map((product) => product.category))).map((category) => {
    const categoryProducts = products.filter((product) => product.category === category);

    return {
      category,
      products: categoryProducts.length,
      stock: categoryProducts.reduce((sum, product) => sum + product.stock, 0),
      value: categoryProducts.reduce((sum, product) => sum + product.stock * product.price, 0),
    };
  });
  const lowStockProducts = products.filter((product) => product.stock <= 10);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      products: products.length,
      stock: products.reduce((sum, product) => sum + product.stock, 0),
      inventoryValue: products.reduce((sum, product) => sum + product.stock * product.price, 0),
      activeCarts: 0,
      cartItems: 0,
      cartValue: 0,
      orders: 0,
      revenue: 0,
      contacts: 0,
      subscribers: 0,
      lowStock: lowStockProducts.length,
    },
    categories,
    products,
    lowStockProducts,
    orders: [],
    activeCarts: [],
    contacts: [],
    subscribers: [],
  };
}

export async function fetchAdminSummary(token: string) {
  try {
    const summary = await request<AdminSummary>('/api/admin/summary', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!summary.totals || !Array.isArray(summary.products)) {
      throw new Error('Admin summary is incomplete.');
    }

    return summary;
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('login')) {
      throw error;
    }

    const data = await fetchProducts({ category: 'All', page: 1, limit: 1000 });
    return buildAdminSummaryFallback(data.products);
  }
}
