import express from 'express';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  badge?: string;
  imageKey: string;
  imageUrl?: string;
  colors: string[];
  description: string;
  stock: number;
  rating: number;
};

type CartLine = {
  productId: string;
  quantity: number;
};

type Customer = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type Order = {
  id: string;
  customer: Customer;
  cart: ReturnType<typeof getCart>;
  createdAt: string;
};

type Contact = {
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';
const adminEmail = process.env.ADMIN_EMAIL || 'admin@sofnu.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

let products: Product[] = [
  {
    id: 'sakarias-lamp',
    name: 'Sakarias Lamp',
    price: 519,
    category: 'Lamp',
    badge: '15% OFF',
    imageKey: 'lamp',
    colors: ['#333333', '#eeeeee', '#d4a373'],
    description: 'A sculptural statement lamp with warm ambient light for living rooms and bedrooms.',
    stock: 18,
    rating: 4.8,
  },
  {
    id: 'karoas-lamp',
    name: 'Karoas Lamp',
    price: 519,
    category: 'Lamp',
    badge: 'NEW',
    imageKey: 'lamp',
    colors: ['#582f0e', '#1a1a1a', '#e9edc9'],
    description: 'Minimal table lamp with layered materials and a compact footprint.',
    stock: 12,
    rating: 4.7,
  },
  {
    id: 'malias-lamp',
    name: 'Malias Lamp',
    price: 519,
    category: 'Lamp',
    badge: 'NEW',
    imageKey: 'lamp',
    colors: ['#d4a373', '#cccccc', '#1a1a1a'],
    description: 'Soft diffused lighting for corners, consoles, and reading spaces.',
    stock: 9,
    rating: 4.6,
  },
  {
    id: 'ayla-chair',
    name: 'Ayla Chair',
    price: 429,
    category: 'Chair',
    badge: 'BEST',
    imageKey: 'chair',
    colors: ['#f4f1ea', '#1f1f1f', '#9c7b55'],
    description: 'A lounge chair with a relaxed pitch, broad arms, and premium fabric upholstery.',
    stock: 15,
    rating: 4.9,
  },
  {
    id: 'nola-bed',
    name: 'Nola Bed',
    price: 1299,
    category: 'Beds',
    badge: 'NEW',
    imageKey: 'sofa',
    colors: ['#e8dfd2', '#5f5a50', '#111111'],
    description: 'Low-profile upholstered bed frame designed for clean, quiet bedrooms.',
    stock: 7,
    rating: 4.8,
  },
  {
    id: 'luna-table',
    name: 'Luna Table',
    price: 799,
    category: 'Table',
    imageKey: 'sofa',
    colors: ['#d1b38c', '#2c2c2c', '#f2eee8'],
    description: 'Rounded dining table with a stable base and durable matte finish.',
    stock: 11,
    rating: 4.5,
  },
];

const carts = new Map<string, CartLine[]>();
const contacts: Contact[] = [];
const subscribers = new Set<string>();
const orders: Order[] = [];
const adminSessions = new Set<string>();

app.use(express.json({ limit: '15mb' }));

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';

  if (!token || !adminSessions.has(token)) {
    res.status(401).json({ error: 'Admin login required.' });
    return;
  }

  next();
}

function productCategories() {
  return [...Array.from(new Set(products.map((product) => product.category))), 'All'];
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueProductId(name: string) {
  const base = slugify(name) || `product-${Date.now()}`;
  let id = base;
  let index = 2;

  while (products.some((product) => product.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }

  return id;
}

function productFromBody(body: Record<string, unknown>, existing?: Product): Product | { error: string } {
  const name = String(body.name ?? existing?.name ?? '').trim();
  const category = String(body.category ?? existing?.category ?? '').trim();
  const imageKey = String(body.imageKey ?? existing?.imageKey ?? 'sofa').trim();
  const imageUrl = String(body.imageUrl ?? existing?.imageUrl ?? '').trim();
  const description = String(body.description ?? existing?.description ?? '').trim();
  const badge = String(body.badge ?? existing?.badge ?? '').trim();
  const price = Number(body.price ?? existing?.price);
  const stock = Number(body.stock ?? existing?.stock);
  const rating = Number(body.rating ?? existing?.rating ?? 4.5);
  const colors = Array.isArray(body.colors)
    ? body.colors.map((color) => String(color).trim()).filter(Boolean)
    : String(body.colors ?? existing?.colors.join(',') ?? '#f4f1ea,#1f1f1f,#9c7b55')
      .split(',')
      .map((color) => color.trim())
      .filter(Boolean);

  if (!name || !category || !description) {
    return { error: 'Name, category, and description are required.' };
  }

  if (!['lamp', 'chair', 'sofa'].includes(imageKey)) {
    return { error: 'Image type must be lamp, chair, or sofa.' };
  }

  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Price must be a number greater than or equal to 0.' };
  }

  if (!Number.isFinite(stock) || stock < 0) {
    return { error: 'Stock must be a number greater than or equal to 0.' };
  }

  if (!Number.isFinite(rating) || rating < 0 || rating > 5) {
    return { error: 'Rating must be between 0 and 5.' };
  }

  return {
    id: existing?.id || uniqueProductId(name),
    name,
    price: Math.round(price),
    category,
    badge: badge || undefined,
    imageKey,
    imageUrl: imageUrl || undefined,
    colors: colors.length ? colors.slice(0, 4) : ['#f4f1ea', '#1f1f1f', '#9c7b55'],
    description,
    stock: Math.floor(stock),
    rating: Number(rating.toFixed(1)),
  };
}

function removeProductFromCarts(productId: string) {
  for (const [sessionId, cart] of carts.entries()) {
    carts.set(
      sessionId,
      cart.filter((line) => line.productId !== productId),
    );
  }
}

function clampProductQuantityInCarts(productId: string, stock: number) {
  for (const [sessionId, cart] of carts.entries()) {
    const nextCart = cart
      .map((line) => (line.productId === productId ? { ...line, quantity: Math.min(line.quantity, stock) } : line))
      .filter((line) => line.quantity > 0);
    carts.set(sessionId, nextCart);
  }
}

function getCart(sessionId: string) {
  if (!carts.has(sessionId)) {
    carts.set(sessionId, []);
  }

  const lines = carts.get(sessionId)!;
  const items = lines
    .map((line) => {
      const product = products.find((item) => item.id === line.productId);
      return product ? { product, quantity: line.quantity, subtotal: product.price * line.quantity } : null;
    })
    .filter(Boolean);

  return {
    items,
    total: items.reduce((sum, item) => sum + item!.subtotal, 0),
    count: items.reduce((sum, item) => sum + item!.quantity, 0),
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/products', (req, res) => {
  const category = String(req.query.category || 'All');
  const query = String(req.query.q || '').trim().toLowerCase();
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 6));

  const filtered = products.filter((product) => {
    const matchesCategory = category === 'All' || product.category === category;
    const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase();
    return matchesCategory && (!query || searchable.includes(query));
  });

  const start = (page - 1) * limit;

  res.json({
    products: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    categories: productCategories(),
  });
});

app.get('/api/products/:id', (req, res) => {
  const product = products.find((item) => item.id === req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product });
});

app.post('/api/admin/login', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (email !== adminEmail.toLowerCase() || password !== adminPassword) {
    res.status(401).json({ error: 'Email atau password admin salah.' });
    return;
  }

  const token = randomUUID();
  adminSessions.add(token);
  res.status(201).json({ token, email: adminEmail });
});

app.post('/api/admin/logout', requireAdmin, (req, res) => {
  const header = req.headers.authorization || '';
  adminSessions.delete(header.slice('Bearer '.length));
  res.json({ ok: true });
});

app.get('/api/admin/summary', requireAdmin, (_req, res) => {
  const activeCarts = Array.from(carts.entries())
    .map(([sessionId]) => ({ sessionId, ...getCart(sessionId) }))
    .filter((cart) => cart.count > 0);
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

  res.json({
    generatedAt: new Date().toISOString(),
    totals: {
      products: products.length,
      stock: products.reduce((sum, product) => sum + product.stock, 0),
      inventoryValue: products.reduce((sum, product) => sum + product.stock * product.price, 0),
      activeCarts: activeCarts.length,
      cartItems: activeCarts.reduce((sum, cart) => sum + cart.count, 0),
      cartValue: activeCarts.reduce((sum, cart) => sum + cart.total, 0),
      orders: orders.length,
      revenue: orders.reduce((sum, order) => sum + order.cart.total, 0),
      contacts: contacts.length,
      subscribers: subscribers.size,
      lowStock: lowStockProducts.length,
    },
    categories,
    products,
    lowStockProducts,
    orders: orders.slice().reverse(),
    activeCarts,
    contacts: contacts.slice().reverse(),
    subscribers: Array.from(subscribers).sort(),
  });
});

app.post('/api/admin/products', requireAdmin, (req, res) => {
  const product = productFromBody(req.body);

  if ('error' in product) {
    res.status(400).json({ error: product.error });
    return;
  }

  products.push(product);
  res.status(201).json({ product });
});

app.put('/api/admin/products/:id', requireAdmin, (req, res) => {
  const current = products.find((item) => item.id === req.params.id);

  if (!current) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const product = productFromBody(req.body, current);

  if ('error' in product) {
    res.status(400).json({ error: product.error });
    return;
  }

  products = products.map((item) => (item.id === current.id ? product : item));
  clampProductQuantityInCarts(product.id, product.stock);
  res.json({ product });
});

app.patch('/api/admin/products/:id/stock', requireAdmin, (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const stock = Number(req.body.stock);

  if (!Number.isFinite(stock) || stock < 0) {
    res.status(400).json({ error: 'Stock must be a number greater than or equal to 0.' });
    return;
  }

  product.stock = Math.floor(stock);
  clampProductQuantityInCarts(product.id, product.stock);
  res.json({ product });
});

app.post('/api/admin/products/:id/stock/add', requireAdmin, (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const quantity = Number(req.body.quantity);

  if (!Number.isFinite(quantity) || quantity <= 0) {
    res.status(400).json({ error: 'Quantity must be greater than 0.' });
    return;
  }

  product.stock += Math.floor(quantity);
  res.json({ product });
});

app.delete('/api/admin/products/:id', requireAdmin, (req, res) => {
  const product = products.find((item) => item.id === req.params.id);

  if (!product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  products = products.filter((item) => item.id !== product.id);
  removeProductFromCarts(product.id);
  res.json({ ok: true, product });
});

app.get('/api/cart/:sessionId', (req, res) => {
  res.json(getCart(req.params.sessionId));
});

app.post('/api/cart/:sessionId/items', (req, res) => {
  const productId = String(req.body.productId || '');
  const quantity = Math.max(1, Number(req.body.quantity || 1));
  const product = products.find((item) => item.id === productId);

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const cart = carts.get(req.params.sessionId) || [];
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + quantity);
  } else {
    cart.push({ productId, quantity: Math.min(product.stock, quantity) });
  }

  carts.set(req.params.sessionId, cart);
  res.status(201).json(getCart(req.params.sessionId));
});

app.patch('/api/cart/:sessionId/items/:productId', (req, res) => {
  const quantity = Number(req.body.quantity || 0);
  const product = products.find((item) => item.id === req.params.productId);
  const cart = carts.get(req.params.sessionId) || [];

  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  const line = cart.find((item) => item.productId === product.id);
  if (line) {
    line.quantity = Math.min(product.stock, Math.max(0, quantity));
  }

  carts.set(
    req.params.sessionId,
    cart.filter((item) => item.quantity > 0),
  );
  res.json(getCart(req.params.sessionId));
});

app.delete('/api/cart/:sessionId/items/:productId', (req, res) => {
  carts.set(
    req.params.sessionId,
    (carts.get(req.params.sessionId) || []).filter((item) => item.productId !== req.params.productId),
  );
  res.json(getCart(req.params.sessionId));
});

app.post('/api/orders', (req, res) => {
  const sessionId = String(req.body.sessionId || '');
  const customer = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim(),
    phone: String(req.body.phone || '').trim(),
    address: String(req.body.address || '').trim(),
  };
  const cart = getCart(sessionId);

  if (!customer.name || !customer.email || !customer.phone || !customer.address) {
    res.status(400).json({ error: 'Please complete all checkout fields.' });
    return;
  }

  if (!cart.items.length) {
    res.status(400).json({ error: 'Cart is empty.' });
    return;
  }

  const order = {
    id: `SOFA-${Date.now()}`,
    customer,
    cart,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  carts.set(sessionId, []);
  res.status(201).json({ order });
});

app.post('/api/contact', (req, res) => {
  const contact = {
    name: String(req.body.name || '').trim(),
    email: String(req.body.email || '').trim(),
    message: String(req.body.message || '').trim(),
    createdAt: new Date().toISOString(),
  };

  if (!contact.name || !contact.email || !contact.message) {
    res.status(400).json({ error: 'Please complete the contact form.' });
    return;
  }

  contacts.push(contact);
  res.status(201).json({ ok: true, message: 'Message received.' });
});

app.post('/api/newsletter', (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  subscribers.add(email);
  res.status(201).json({ ok: true, message: 'Subscription saved.' });
});

app.get('/api/articles/:slug', (req, res) => {
  const articles: Record<string, { title: string; body: string }> = {
    'grand-designs-2026': {
      title: 'Official House Furniture Partner - Grand Designs Live 2026',
      body: 'SOFA will furnish the show home with modern lounge pieces, lighting, and interior details. The collaboration focuses on warm minimal rooms, durable materials, and furniture that works for daily living.',
    },
    materials: {
      title: 'Very Serious Materials For Making Furniture',
      body: 'Our furniture uses kiln-dried frames, reinforced joints, layered foam, and tactile fabrics selected for daily use. Each piece is checked before shipping and paired with care guidance.',
    },
    'interior-design-service': {
      title: 'Interior Design Service',
      body: 'Book a design consultation to review room dimensions, mood, layout, and product selection. Our team prepares a practical furniture plan with coordinated pieces from the SOFA catalogue.',
    },
  };

  const article = articles[req.params.slug];
  if (!article) {
    res.status(404).json({ error: 'Article not found' });
    return;
  }

  res.json(article);
});

app.get('/api/pages/:slug', (req, res) => {
  const pages: Record<string, { title: string; body: string }> = {
    terms: {
      title: 'Terms & Conditions',
      body: 'Orders are confirmed after checkout submission. Availability may change before fulfilment. Our team will contact customers to confirm delivery schedule, payment details, and final invoice.',
    },
    privacy: {
      title: 'Privacy Policy',
      body: 'Contact, newsletter, and checkout information is used to process requests and improve service. This demo backend stores data in memory only and does not share it with third parties.',
    },
  };

  const page = pages[req.params.slug];
  if (!page) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }

  res.json(page);
});

async function start() {
  if (isProduction) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  listenWithFallback(port);
}

function listenWithFallback(nextPort: number, attempts = 0) {
  const server = app.listen(nextPort, '0.0.0.0', () => {
    console.log(`SOFA app running at http://localhost:${nextPort}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE' && attempts < 10) {
      const fallbackPort = nextPort + 1;
      console.log(`Port ${nextPort} is busy, trying ${fallbackPort}...`);
      listenWithFallback(fallbackPort, attempts + 1);
      return;
    }

    throw error;
  });
}

start();
