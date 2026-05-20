import type { Cart, Content, ProductResponse } from './types';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed');
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
