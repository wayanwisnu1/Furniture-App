import { AlertTriangle, ArrowLeft, Boxes, ClipboardList, DollarSign, Lock, LogOut, Mail, Package, RefreshCcw, ShoppingCart, Users } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { fetchAdminSummary, loginAdmin, logoutAdmin } from '../lib/api';
import { productImage } from '../lib/productImages';
import type { AdminSummary } from '../lib/types';

type AdminDashboardProps = {
  onBack: () => void;
};

const adminTokenKey = 'sofnu-admin-token';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [token, setToken] = useState(() => window.localStorage.getItem(adminTokenKey) || '');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(window.localStorage.getItem(adminTokenKey)));
  const [error, setError] = useState('');

  async function loadSummary(nextToken = token) {
    if (!nextToken) return;

    try {
      setIsLoading(true);
      setError('');
      setSummary(await fetchAdminSummary(nextToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load admin data.');
      if (err instanceof Error && err.message.toLowerCase().includes('login')) {
        window.localStorage.removeItem(adminTokenKey);
        setToken('');
        setSummary(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadSummary(token);
    }
  }, [token]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError('');
      const result = await loginAdmin(credentials.email, credentials.password);
      window.localStorage.setItem(adminTokenKey, result.token);
      setToken(result.token);
      setCredentials({ email: '', password: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login admin gagal.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    if (token) {
      await logoutAdmin(token).catch(() => undefined);
    }

    window.localStorage.removeItem(adminTokenKey);
    setToken('');
    setSummary(null);
    setError('');
  }

  const cards = useMemo(() => {
    if (!summary) return [];

    return [
      { label: 'Total Produk', value: summary.totals.products, helper: `${summary.totals.stock} item stok`, icon: Package },
      { label: 'Nilai Inventori', value: formatPrice(summary.totals.inventoryValue), helper: 'Harga x stok tersedia', icon: DollarSign },
      { label: 'Order', value: summary.totals.orders, helper: `${formatPrice(summary.totals.revenue)} revenue`, icon: ClipboardList },
      { label: 'Cart Aktif', value: summary.totals.activeCarts, helper: `${summary.totals.cartItems} item belum checkout`, icon: ShoppingCart },
      { label: 'Low Stock', value: summary.totals.lowStock, helper: 'Stok 10 atau kurang', icon: AlertTriangle },
      { label: 'Kontak', value: summary.totals.contacts, helper: `${summary.totals.subscribers} subscriber`, icon: Mail },
    ];
  }, [summary]);

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#080808] px-6 py-24 text-white">
        <div className="w-full max-w-md border border-white/10 bg-white/[0.04] p-7 shadow-2xl">
          <button type="button" onClick={onBack} className="mb-8 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
            <ArrowLeft size={16} />
            Back to storefront
          </button>

          <div className="mb-8 flex items-center gap-4">
            <div className="bg-brand-cream/10 p-3 text-brand-cream">
              <Lock size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-brand-cream/60">Admin Login</p>
              <h1 className="mt-2 font-display text-3xl font-medium">Dashboard Barang</h1>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              required
              value={credentials.email}
              onChange={(event) => setCredentials({ ...credentials, email: event.target.value })}
              placeholder="Email admin"
              className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-brand-cream/70"
            />
            <input
              type="password"
              required
              value={credentials.password}
              onChange={(event) => setCredentials({ ...credentials, password: event.target.value })}
              placeholder="Password"
              className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none transition-colors placeholder:text-white/30 focus:border-brand-cream/70"
            />
            {error && <div className="border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-cream py-4 text-sm font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Login Admin'}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-24 text-white lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <button type="button" onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
              <ArrowLeft size={16} />
              Back to storefront
            </button>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-cream/60">Admin Monitoring</p>
            <h1 className="mt-3 font-display text-5xl font-medium tracking-tight">Dashboard Barang</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Pantau stok produk, nilai inventori, cart aktif, order, pesan kontak, dan subscriber dari satu halaman.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadSummary()}
            className="inline-flex items-center justify-center gap-2 bg-brand-cream px-5 py-3 text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-white"
          >
            <RefreshCcw size={16} />
            Refresh
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-white hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>

        {isLoading && <div className="border border-white/10 bg-white/5 p-6 text-white/50">Loading admin data...</div>}
        {error && <div className="border border-red-400/30 bg-red-500/10 p-6 text-red-100">{error}</div>}

        {summary && (
          <div className="space-y-10">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((card) => {
                const Icon = card.icon;

                return (
                  <div key={card.label} className="border border-white/10 bg-white/[0.04] p-5">
                    <div className="flex items-start justify-between gap-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">{card.label}</p>
                        <div className="mt-3 font-display text-3xl">{card.value}</div>
                        <p className="mt-2 text-sm text-white/45">{card.helper}</p>
                      </div>
                      <div className="bg-brand-cream/10 p-3 text-brand-cream">
                        <Icon size={22} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
              <div className="border border-white/10 bg-white/[0.03]">
                <div className="flex items-center justify-between border-b border-white/10 p-5">
                  <h2 className="font-display text-2xl">Stok Produk</h2>
                  <span className="text-xs uppercase tracking-widest text-white/40">Updated {formatDate(summary.generatedAt)}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                      <tr>
                        <th className="px-5 py-4 font-medium">Produk</th>
                        <th className="px-5 py-4 font-medium">Kategori</th>
                        <th className="px-5 py-4 font-medium">Harga</th>
                        <th className="px-5 py-4 font-medium">Stok</th>
                        <th className="px-5 py-4 font-medium">Nilai</th>
                        <th className="px-5 py-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.products.map((product) => (
                        <tr key={product.id} className="border-b border-white/5">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img src={productImage(product)} alt={product.name} className="h-12 w-12 object-cover" />
                              <div>
                                <div className="font-medium">{product.name}</div>
                                <div className="text-xs text-white/35">{product.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-white/60">{product.category}</td>
                          <td className="px-5 py-4 text-white/60">{formatPrice(product.price)}</td>
                          <td className="px-5 py-4">{product.stock}</td>
                          <td className="px-5 py-4 text-white/60">{formatPrice(product.price * product.stock)}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-1 text-xs ${product.stock <= 10 ? 'bg-amber-400/15 text-amber-100' : 'bg-emerald-400/15 text-emerald-100'}`}>
                              {product.stock <= 10 ? 'Low stock' : 'Ready'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <Boxes className="text-brand-cream" size={20} />
                    <h2 className="font-display text-2xl">Kategori</h2>
                  </div>
                  <div className="space-y-4">
                    {summary.categories.map((category) => (
                      <div key={category.category} className="border border-white/10 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.category}</span>
                          <span className="text-sm text-white/45">{category.products} produk</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between text-sm text-white/50">
                          <span>{category.stock} stok</span>
                          <span>{formatPrice(category.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-white/10 bg-white/[0.03] p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <Users className="text-brand-cream" size={20} />
                    <h2 className="font-display text-2xl">Subscriber</h2>
                  </div>
                  <div className="space-y-2 text-sm text-white/55">
                    {summary.subscribers.slice(0, 6).map((email) => (
                      <div key={email} className="border-b border-white/5 pb-2">{email}</div>
                    ))}
                    {!summary.subscribers.length && <p>Belum ada subscriber.</p>}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <h2 className="font-display text-2xl">Order Terbaru</h2>
                <div className="mt-5 space-y-4">
                  {summary.orders.slice(0, 6).map((order) => (
                    <div key={order.id} className="border border-white/10 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-medium">{order.id}</div>
                          <div className="mt-1 text-sm text-white/45">{order.customer.name} - {order.customer.phone}</div>
                        </div>
                        <div className="text-right">
                          <div>{formatPrice(order.cart.total)}</div>
                          <div className="mt-1 text-xs text-white/35">{formatDate(order.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!summary.orders.length && <p className="text-sm text-white/45">Belum ada order.</p>}
                </div>
              </div>

              <div className="border border-white/10 bg-white/[0.03] p-5">
                <h2 className="font-display text-2xl">Cart Aktif</h2>
                <div className="mt-5 space-y-4">
                  {summary.activeCarts.slice(0, 6).map((cart) => (
                    <div key={cart.sessionId} className="border border-white/10 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="max-w-[260px] truncate font-medium">{cart.sessionId}</div>
                          <div className="mt-1 text-sm text-white/45">{cart.count} item dalam cart</div>
                        </div>
                        <div>{formatPrice(cart.total)}</div>
                      </div>
                    </div>
                  ))}
                  {!summary.activeCarts.length && <p className="text-sm text-white/45">Tidak ada cart aktif.</p>}
                </div>
              </div>
            </section>

            <section className="border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-display text-2xl">Pesan Kontak</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {summary.contacts.slice(0, 4).map((contact) => (
                  <div key={`${contact.email}-${contact.createdAt}`} className="border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="mt-1 text-sm text-white/45">{contact.email}</div>
                      </div>
                      <span className="text-xs text-white/35">{formatDate(contact.createdAt)}</span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-white/55">{contact.message}</p>
                  </div>
                ))}
                {!summary.contacts.length && <p className="text-sm text-white/45">Belum ada pesan kontak.</p>}
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
