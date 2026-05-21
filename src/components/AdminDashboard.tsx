import { AlertTriangle, ArrowLeft, Boxes, ClipboardList, DollarSign, Edit3, Lock, LogOut, Mail, Package, Plus, RefreshCcw, Save, ShoppingCart, Trash2, Users } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  addAdminProductStock,
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminSummary,
  loginAdmin,
  logoutAdmin,
  updateAdminProduct,
  updateAdminProductStock,
  type AdminProductPayload,
} from '../lib/api';
import { confirmSweetAlert, showErrorAlert, showSuccessAlert, showWarningAlert } from '../lib/alerts';
import { productImage } from '../lib/productImages';
import type { AdminSummary, Product } from '../lib/types';

type AdminDashboardProps = {
  onBack: () => void;
};

const adminTokenKey = 'sofnu-admin-token';

type ProductForm = Omit<AdminProductPayload, 'colors'> & {
  colors: string;
};

const emptyProductForm: ProductForm = {
  name: '',
  price: 0,
  category: 'Chair',
  badge: '',
  imageKey: 'sofa',
  imageUrl: '',
  colors: '#f4f1ea, #1f1f1f, #9c7b55',
  description: '',
  stock: 1,
  rating: 4.5,
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formFromProduct(product: Product): ProductForm {
  return {
    name: product.name,
    price: product.price,
    category: product.category,
    badge: product.badge || '',
    imageKey: product.imageKey,
    imageUrl: product.imageUrl || '',
    colors: product.colors.join(', '),
    description: product.description,
    stock: product.stock,
    rating: product.rating,
  };
}

function payloadFromForm(form: ProductForm): AdminProductPayload {
  return {
    ...form,
    price: Number(form.price),
    stock: Number(form.stock),
    rating: Number(form.rating),
    imageUrl: form.imageUrl?.trim() || undefined,
    colors: form.colors.split(',').map((color) => color.trim()).filter(Boolean),
  };
}

function resizeImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const maxSize = 1200;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Gambar gagal diproses.'));
        return;
      }

      context.drawImage(image, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Gambar gagal dibaca.'));
    };

    image.src = objectUrl;
  });
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [token, setToken] = useState(() => window.localStorage.getItem(adminTokenKey) || '');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [adminPage, setAdminPage] = useState<'dashboard' | 'stock' | 'product-form'>('dashboard');
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [editingProductId, setEditingProductId] = useState('');
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [actionProductId, setActionProductId] = useState('');
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

  useEffect(() => {
    if (!summary) return;

    setStockDrafts(Object.fromEntries(summary.products.map((product) => [product.id, String(product.stock)])));
  }, [summary]);

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

  function resetProductForm() {
    setEditingProductId('');
    setProductForm(emptyProductForm);
    setAdminPage('dashboard');
  }

  function openAddProductPage() {
    setEditingProductId('');
    setProductForm(emptyProductForm);
    setError('');
    setAdminPage('product-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsLoading(true);
      setError('');

      if (productForm.imageUrl?.startsWith('data:') && productForm.imageUrl.length > 12_000_000) {
        const message = 'Ukuran gambar terlalu besar. Upload ulang gambar agar otomatis dikompres, atau gunakan URL gambar.';
        setError(message);
        showWarningAlert(message);
        setIsLoading(false);
        return;
      }

      if (editingProductId) {
        await updateAdminProduct(token, editingProductId, payloadFromForm(productForm));
        showSuccessAlert('Produk berhasil diedit dan akan tampil di Shop.');
      } else {
        await createAdminProduct(token, payloadFromForm(productForm));
        showSuccessAlert('Produk baru berhasil ditambahkan ke Shop.');
      }

      resetProductForm();
      await loadSummary(token);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Produk gagal disimpan.';
      setError(message);
      showErrorAlert(message);
    } finally {
      setIsLoading(false);
    }
  }

  function handleEditProduct(product: Product) {
    setEditingProductId(product.id);
    setProductForm(formFromProduct(product));
    setError('');
    setAdminPage('product-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleImageFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      const message = 'File harus berupa gambar.';
      setError(message);
      showWarningAlert(message);
      return;
    }

    try {
      setError('');
      const imageUrl = await resizeImageFile(file);
      setProductForm((current) => ({ ...current, imageUrl }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gambar gagal diproses.';
      setError(message);
      showErrorAlert(message);
    }
  }

  async function runProductAction(productId: string, action: () => Promise<unknown>, successMessage: string) {
    try {
      setActionProductId(productId);
      setError('');
      await action();
      await loadSummary(token);
      showSuccessAlert(successMessage);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed.';
      setError(message);
      showErrorAlert(message);
    } finally {
      setActionProductId('');
    }
  }

  function handleSaveStock(productId: string) {
    const stock = Number(stockDrafts[productId]);

    if (!Number.isFinite(stock) || stock < 0) {
      const message = 'Stock harus angka 0 atau lebih.';
      setError(message);
      showWarningAlert(message);
      return;
    }

    runProductAction(productId, () => updateAdminProductStock(token, productId, Math.floor(stock)), 'Stock berhasil diubah.');
  }

  function handleAddStock(productId: string, quantity: number) {
    runProductAction(productId, () => addAdminProductStock(token, productId, quantity), `Stock berhasil ditambah ${quantity}.`);
  }

  async function handleDeleteProduct(productId: string, productName: string) {
    const confirmed = await confirmSweetAlert({
      title: 'Hapus produk?',
      text: `Hapus ${productName} dari katalog dan Shop?`,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
    });

    if (!confirmed) return;

    runProductAction(productId, () => deleteAdminProduct(token, productId), 'Produk berhasil dihapus dari Shop.');
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

  if (adminPage === 'product-form') {
    return (
      <main className="min-h-screen bg-[#080808] px-6 py-24 text-white lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 border-b border-white/10 pb-8">
            <button type="button" onClick={resetProductForm} className="mb-6 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
              <ArrowLeft size={16} />
              Back to dashboard
            </button>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-cream/60">Product CRUD</p>
            <h1 className="mt-3 font-display text-5xl font-medium tracking-tight">{editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Produk yang disimpan dari halaman ini akan langsung masuk ke data katalog dan muncul di halaman Shop Produk.
            </p>
          </div>

          {error && <div className="mb-6 border border-red-400/30 bg-red-500/10 p-6 text-red-100">{error}</div>}

          <section className="border border-white/10 bg-white/[0.03] p-5">
            <form onSubmit={handleProductSubmit} className="grid gap-4 lg:grid-cols-4">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Nama Produk</span>
                <input
                  required
                  value={productForm.name}
                  onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                  placeholder="Contoh: Luna Dining Table"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Kategori</span>
                <input
                  required
                  value={productForm.category}
                  onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}
                  placeholder="Contoh: Table, Chair, Lamp, Beds"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Tipe Gambar</span>
                <select
                  value={productForm.imageKey}
                  onChange={(event) => setProductForm({ ...productForm, imageKey: event.target.value as Product['imageKey'] })}
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-brand-cream/70"
                >
                  <option value="sofa">Sofa / Room</option>
                  <option value="chair">Chair</option>
                  <option value="lamp">Lamp</option>
                </select>
                <p className="text-xs text-white/35">Pilih jenis foto default yang paling mendekati produk.</p>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">URL Gambar</span>
                <input
                  value={productForm.imageUrl || ''}
                  onChange={(event) => setProductForm({ ...productForm, imageUrl: event.target.value })}
                  placeholder="Opsional, tempel link gambar: https://contoh.com/produk.jpg"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
                <p className="text-xs text-white/35">Jika diisi, gambar ini akan dipakai di Shop menggantikan tipe gambar default.</p>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Badge</span>
                <input
                  value={productForm.badge}
                  onChange={(event) => setProductForm({ ...productForm, badge: event.target.value })}
                  placeholder="Opsional, contoh: NEW, BEST, 15% OFF"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <label className="space-y-2 lg:col-span-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Upload Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => handleImageFile(event.target.files?.[0])}
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm file:mr-4 file:border-0 file:bg-brand-cream file:px-4 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-widest file:text-brand-dark focus:border-brand-cream/70"
                />
                <p className="text-xs text-white/35">Pilih file JPG/PNG/WebP dari komputer. Gambar akan tampil sebagai preview dan dipakai di produk.</p>
              </label>
              <div className="border border-white/10 bg-black/30 p-3 lg:col-span-2">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-white/40">Preview Gambar</div>
                <img
                  src={productForm.imageUrl || productImage({ imageKey: productForm.imageKey })}
                  alt="Preview produk"
                  className="aspect-[4/3] w-full object-cover bg-white/5"
                />
              </div>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Harga</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={productForm.price}
                  onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })}
                  placeholder="Masukkan angka saja, contoh: 799"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Stock</span>
                <input
                  type="number"
                  min="0"
                  required
                  value={productForm.stock}
                  onChange={(event) => setProductForm({ ...productForm, stock: Number(event.target.value) })}
                  placeholder="Jumlah barang tersedia, contoh: 12"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Rating</span>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  required
                  value={productForm.rating}
                  onChange={(event) => setProductForm({ ...productForm, rating: Number(event.target.value) })}
                  placeholder="Nilai 0 sampai 5, contoh: 4.8"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Warna Produk</span>
                <input
                  value={productForm.colors}
                  onChange={(event) => setProductForm({ ...productForm, colors: event.target.value })}
                  placeholder="Kode warna dipisah koma, contoh: #d1b38c, #2c2c2c, #f2eee8"
                  className="w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
                <p className="text-xs text-white/35">Gunakan kode warna HEX untuk swatch kecil di kartu produk.</p>
              </label>
              <label className="space-y-2 lg:col-span-3">
                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Deskripsi Produk</span>
                <textarea
                  required
                  value={productForm.description}
                  onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                  placeholder="Tuliskan detail produk, contoh: Dining table dengan top walnut, kaki kokoh, cocok untuk ruang makan modern."
                  className="min-h-32 w-full border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/30 focus:border-brand-cream/70"
                />
              </label>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex min-h-32 items-center justify-center gap-2 bg-brand-cream px-5 py-4 text-xs font-bold uppercase tracking-widest text-brand-dark hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {editingProductId ? <Save size={16} /> : <Plus size={16} />}
                {editingProductId ? 'Simpan Edit' : 'Tambah Produk'}
              </button>
            </form>
          </section>
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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openAddProductPage}
              className="inline-flex items-center justify-center gap-2 bg-brand-cream px-5 py-3 text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-white"
            >
              <Plus size={16} />
              Tambah Produk
            </button>
            <button
              type="button"
              onClick={() => loadSummary()}
              className="inline-flex items-center justify-center gap-2 border border-white/15 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/70 transition-colors hover:border-white hover:text-white"
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
        </div>

        {isLoading && <div className="border border-white/10 bg-white/5 p-6 text-white/50">Loading admin data...</div>}
        {error && <div className="border border-red-400/30 bg-red-500/10 p-6 text-red-100">{error}</div>}

        {summary && (
          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
            <aside className="h-fit border border-white/10 bg-white/[0.03] p-4 lg:sticky lg:top-24">
              <p className="mb-4 text-xs uppercase tracking-[0.24em] text-white/35">Menu Admin</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setAdminPage('dashboard')}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    adminPage === 'dashboard' ? 'bg-brand-cream text-brand-dark' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ClipboardList size={16} />
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => setAdminPage('stock')}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                    adminPage === 'stock' ? 'bg-brand-cream text-brand-dark' : 'text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Package size={16} />
                  Stok Produk
                </button>
              </div>
            </aside>

            <div className="space-y-10">
            {adminPage === 'dashboard' && (
              <>
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

            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-5 flex items-center gap-3">
                  <Boxes className="text-brand-cream" size={20} />
                  <h2 className="font-display text-2xl">Kategori</h2>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
              </>
            )}

            {adminPage === 'stock' && (
            <section className="border border-white/10 bg-white/[0.03]">
              <div className="flex items-center justify-between border-b border-white/10 p-5">
                <h2 className="font-display text-2xl">Stok Produk</h2>
                <span className="text-xs uppercase tracking-widest text-white/40">Updated {formatDate(summary.generatedAt)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <tr>
                      <th className="px-5 py-4 font-medium">Produk</th>
                      <th className="px-5 py-4 font-medium">Kategori</th>
                      <th className="px-5 py-4 font-medium">Harga</th>
                      <th className="px-5 py-4 font-medium">Stok</th>
                      <th className="px-5 py-4 font-medium">Nilai</th>
                      <th className="px-5 py-4 font-medium">Status</th>
                      <th className="px-5 py-4 font-medium">Aksi</th>
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
                        <td className="px-5 py-4">
                          <input
                            type="number"
                            min="0"
                            value={stockDrafts[product.id] ?? product.stock}
                            onChange={(event) => setStockDrafts({ ...stockDrafts, [product.id]: event.target.value })}
                            className="w-24 border border-white/10 bg-black/30 px-3 py-2 outline-none focus:border-brand-cream/70"
                            aria-label={`Stock ${product.name}`}
                          />
                        </td>
                        <td className="px-5 py-4 text-white/60">{formatPrice(product.price * product.stock)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-1 text-xs ${product.stock <= 10 ? 'bg-amber-400/15 text-amber-100' : 'bg-emerald-400/15 text-emerald-100'}`}>
                            {product.stock <= 10 ? 'Low stock' : 'Ready'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveStock(product.id)}
                              disabled={actionProductId === product.id}
                              className="inline-flex items-center gap-1 border border-white/15 px-3 py-2 text-xs text-white/70 hover:border-brand-cream/70 hover:text-white disabled:opacity-40"
                            >
                              <Save size={13} />
                              Stock
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddStock(product.id, 5)}
                              disabled={actionProductId === product.id}
                              className="inline-flex items-center gap-1 border border-white/15 px-3 py-2 text-xs text-white/70 hover:border-brand-cream/70 hover:text-white disabled:opacity-40"
                            >
                              <Plus size={13} />
                              5
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="inline-flex items-center gap-1 border border-white/15 px-3 py-2 text-xs text-white/70 hover:border-brand-cream/70 hover:text-white"
                            >
                              <Edit3 size={13} />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              disabled={actionProductId === product.id}
                              className="inline-flex items-center gap-1 border border-red-400/30 px-3 py-2 text-xs text-red-100 hover:bg-red-500/15 disabled:opacity-40"
                            >
                              <Trash2 size={13} />
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            )}

          </div>
          </div>
        )}
      </div>
    </main>
  );
}
