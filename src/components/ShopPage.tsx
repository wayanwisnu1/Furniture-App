import { ArrowLeft, Minus, Plus, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchProducts } from '../lib/api';
import { productImage } from '../lib/productImages';
import type { Product } from '../lib/types';

type ShopPageProps = {
  onAddToCart: (productId: string, quantity: number) => void;
  onBack: () => void;
  onViewProduct: (product: Product) => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function ShopPage({ onAddToCart, onBack, onViewProduct }: ShopPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    setIsLoading(true);
    setError('');

    fetchProducts({ category: 'All', page: 1, limit: 1000 })
      .then((data) => {
        if (ignore) return;
        setProducts(data.products);
        setCategories(data.categories);
        setQuantities(Object.fromEntries(data.products.map((product) => [product.id, 1])));
      })
      .catch((err) => {
        if (!ignore) setError(err instanceof Error ? err.message : 'Unable to load products.');
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const search = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase();
      return matchesCategory && (!search || searchable.includes(search));
    });
  }, [activeCategory, products, query]);

  function setQuantity(product: Product, quantity: number) {
    const nextQuantity = Math.min(product.stock, Math.max(1, quantity));
    setQuantities({ ...quantities, [product.id]: nextQuantity });
  }

  function addProduct(product: Product) {
    const quantity = Math.min(product.stock, Math.max(1, quantities[product.id] || 1));
    onAddToCart(product.id, quantity);
  }

  return (
    <main className="min-h-screen bg-brand-dark px-6 py-24 text-white lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <button type="button" onClick={onBack} className="mb-7 inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white">
              <ArrowLeft size={16} />
              Back to home
            </button>
            <p className="text-xs uppercase tracking-[0.28em] text-brand-cream/60">Complete Catalogue</p>
            <h1 className="mt-3 font-display text-5xl font-medium tracking-tight md:text-6xl">Shop Produk</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
              Pilih produk yang tersedia, tentukan jumlah barang, lalu masukkan ke keranjang dalam satu klik.
            </p>
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-auto lg:min-w-[420px]">
            <div className="flex items-center gap-3 border border-white/10 bg-white/[0.04] px-4 py-3">
              <Search size={18} className="text-white/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search product..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest text-white/40">
                <SlidersHorizontal size={14} />
                Filter
              </div>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                    activeCategory === category ? 'bg-brand-cream text-brand-dark' : 'border border-white/10 text-white/55 hover:border-white/40 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {isLoading && <div className="border border-white/10 bg-white/5 p-6 text-white/50">Loading products...</div>}
        {error && <div className="border border-red-400/30 bg-red-500/10 p-6 text-red-100">{error}</div>}

        {!isLoading && !error && (
          <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => {
              const quantity = quantities[product.id] || 1;
              const isOutOfStock = product.stock <= 0;

              return (
                <article key={product.id} className="group border border-white/10 bg-white/[0.03]">
                  <button type="button" onClick={() => onViewProduct(product)} className="block w-full overflow-hidden bg-white/5 text-left">
                    <img
                      src={productImage(product)}
                      alt={product.name}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </button>

                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <button type="button" onClick={() => onViewProduct(product)} className="text-left">
                        <p className="text-xs uppercase tracking-[0.22em] text-white/40">{product.category}</p>
                        <h2 className="mt-2 font-display text-2xl">{product.name}</h2>
                      </button>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(product.price)}</div>
                        <div className={`mt-1 text-xs ${isOutOfStock ? 'text-red-200' : 'text-white/40'}`}>
                          {isOutOfStock ? 'Out of stock' : `${product.stock} stock`}
                        </div>
                      </div>
                    </div>

                    <p className="min-h-12 text-sm leading-6 text-white/50">{product.description}</p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <div className="flex h-12 items-center border border-white/10">
                        <button
                          type="button"
                          onClick={() => setQuantity(product, quantity - 1)}
                          disabled={isOutOfStock}
                          className="h-full px-4 text-white/65 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Decrease ${product.name} quantity`}
                        >
                          <Minus size={15} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={Math.max(1, product.stock)}
                          value={quantity}
                          onChange={(event) => setQuantity(product, Number(event.target.value))}
                          disabled={isOutOfStock}
                          className="h-full w-14 bg-transparent text-center text-sm outline-none disabled:opacity-40"
                          aria-label={`${product.name} quantity`}
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(product, quantity + 1)}
                          disabled={isOutOfStock || quantity >= product.stock}
                          className="h-full px-4 text-white/65 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                          aria-label={`Increase ${product.name} quantity`}
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => addProduct(product)}
                        disabled={isOutOfStock}
                        className="inline-flex h-12 flex-1 items-center justify-center gap-2 bg-brand-cream px-5 text-xs font-bold uppercase tracking-widest text-brand-dark transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ShoppingBag size={16} />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}

            {!visibleProducts.length && (
              <div className="border border-white/10 bg-white/[0.03] p-6 text-white/45">
                Produk tidak ditemukan.
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
