/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Minus, Plus, Search, ShoppingBag, X } from 'lucide-react';
import { motion, useScroll, useSpring } from 'motion/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import Hero from './components/Hero';
import WhySofa from './components/WhySofa';
import Products from './components/Products';
import Experience from './components/Experience';
import Stats from './components/Stats';
import News from './components/News';
import InteriorDesign from './components/InteriorDesign';
import CTA from './components/CTA';
import Footer from './components/Footer';
import MapSection from './components/MapSection';
import {
  addCartItem,
  fetchArticle,
  fetchCart,
  fetchPage,
  fetchProducts,
  getSessionId,
  removeCartItem,
  submitOrder,
  updateCartItem,
} from './lib/api';
import { productImage } from './lib/productImages';
import type { Cart, Content, Product } from './lib/types';

const emptyCart: Cart = { items: [], total: 0, count: 0 };

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  const [sessionId] = useState(() => getSessionId());
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['Chair', 'Lamp', 'Beds', 'Table', 'All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [cart, setCart] = useState<Cart>(emptyCart);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [content, setContent] = useState<Content | null>(null);
  const [toast, setToast] = useState('');
  const [isAdminOpen, setAdminOpen] = useState(() => window.location.hash === '#admin');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [checkout, setCheckout] = useState({ name: '', email: '', phone: '', address: '' });
  const productsPerPage = activeCategory === 'All' ? 100 : 3;
  const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));

  useEffect(() => {
    let ignore = false;
    setIsProductsLoading(true);

    fetchProducts({ category: activeCategory, page, limit: productsPerPage })
      .then((data) => {
        if (ignore) return;
        setProducts(data.products);
        setCategories(data.categories);
        setTotalProducts(data.total);
      })
      .catch((error) => showToast(error.message))
      .finally(() => {
        if (!ignore) setIsProductsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [activeCategory, page, productsPerPage]);

  useEffect(() => {
    fetchCart(sessionId)
      .then(setCart)
      .catch((error) => showToast(error.message));
  }, [sessionId]);

  useEffect(() => {
    function handleHashChange() {
      setAdminOpen(window.location.hash === '#admin');
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      fetchProducts({ q: searchQuery, limit: 8 })
        .then((data) => setSearchResults(data.products))
        .catch((error) => showToast(error.message));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  const featuredSearch = useMemo(() => (searchQuery.trim() ? searchResults : products), [products, searchQuery, searchResults]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(''), 3000);
  }

  function navigateTo(id: string, category?: string) {
    if (window.location.hash === '#admin') {
      window.history.pushState('', document.title, window.location.pathname + window.location.search);
    }

    setAdminOpen(false);

    if (category) {
      setActiveCategory(category);
      setPage(1);
    }

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openAdmin() {
    window.location.hash = 'admin';
    setAdminOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleAddToCart(productId: string) {
    try {
      const nextCart = await addCartItem(sessionId, productId);
      setCart(nextCart);
      setCartOpen(true);
      showToast('Product added to cart.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to add item.');
    }
  }

  async function handleQuantity(productId: string, quantity: number) {
    try {
      setCart(await updateCartItem(sessionId, productId, quantity));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to update item.');
    }
  }

  async function handleRemove(productId: string) {
    try {
      setCart(await removeCartItem(sessionId, productId));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to remove item.');
    }
  }

  async function openArticle(slug: string) {
    try {
      setContent(await fetchArticle(slug));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to load content.');
    }
  }

  async function openPage(slug: string) {
    try {
      setContent(await fetchPage(slug));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to load page.');
    }
  }

  async function handleCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await submitOrder(sessionId, checkout);
      setCart(emptyCart);
      setCheckout({ name: '', email: '', phone: '', address: '' });
      showToast(`Order ${result.order.id} created.`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Checkout failed.');
    }
  }

  return (
    <div className="min-h-screen bg-brand-dark selection:bg-brand-cream selection:text-brand-dark overflow-x-hidden">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-brand-cream z-[100] origin-left"
        style={{ scaleX }}
      />

      <Navbar
        cartCount={cart.count}
        onNavigate={navigateTo}
        onOpenAdmin={openAdmin}
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
      />
      
      {isAdminOpen ? (
        <AdminDashboard onBack={() => navigateTo('hero')} />
      ) : (
        <>
          <main>
            <Hero onStartShopping={() => navigateTo('best-sellers', 'All')} />
            <WhySofa onReadFeature={(title, body) => setContent({ title, body })} />
            <Products
              activeCategory={activeCategory}
              categories={categories}
              isLoading={isProductsLoading}
              page={page}
              products={products}
              totalPages={totalPages}
              onCategoryChange={(category) => {
                setActiveCategory(category);
                setPage(1);
              }}
              onGoToShop={() => navigateTo('best-sellers', 'All')}
              onNextPage={() => setPage((current) => (current >= totalPages ? 1 : current + 1))}
              onPrevPage={() => setPage((current) => (current <= 1 ? totalPages : current - 1))}
              onViewProduct={setSelectedProduct}
            />
            <Experience onSelectCategory={(category) => navigateTo('best-sellers', category)} />
            <Stats onReadMore={() => openArticle('materials')} />
            <News onReadMore={() => openArticle('grand-designs-2026')} />
            <InteriorDesign onReadMore={() => openArticle('interior-design-service')} />
            <MapSection />
            <CTA onContact={() => navigateTo('contact')} />
          </main>
          
          <Footer
            onNavigate={navigateTo}
            onOpenPage={openPage}
            onSubscribeSuccess={showToast}
          />
        </>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 bg-white text-brand-dark px-5 py-3 text-sm font-semibold shadow-2xl">
          {toast}
        </div>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md p-6" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center gap-3 border-b border-white/20 pb-4">
              <Search size={22} />
              <input
                autoFocus
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search furniture..."
                className="flex-1 bg-transparent text-2xl outline-none placeholder:text-white/30"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:bg-white/10">
                <X size={22} />
              </button>
            </div>

            <div className="mt-8 grid gap-4">
              {featuredSearch.map((product) => (
                <div key={product.id} className="flex items-center gap-4 border border-white/10 p-3">
                  <img src={productImage(product)} alt={product.name} className="h-20 w-20 object-cover bg-white/5" />
                  <button type="button" onClick={() => setSelectedProduct(product)} className="flex-1 text-left">
                    <div className="text-xs uppercase tracking-widest text-white/40">{product.category}</div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-white/50">{formatPrice(product.price)}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product.id)}
                    className="bg-brand-cream px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-dark"
                  >
                    Add
                  </button>
                </div>
              ))}
              {searchQuery && !featuredSearch.length && <p className="text-white/40">No products found.</p>}
            </div>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[75] bg-black/70" role="dialog" aria-modal="true">
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setCartOpen(false)} aria-label="Close cart" />
          <aside className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto bg-[#101010] p-6 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={22} />
                <h2 className="font-display text-2xl">Cart</h2>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} className="p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.product.id} className="flex gap-4 border-b border-white/10 pb-4">
                  <img src={productImage(item.product)} alt={item.product.name} className="h-20 w-20 object-cover bg-white/5" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-sm text-white/50">{formatPrice(item.subtotal)}</div>
                    <div className="mt-3 flex items-center gap-2">
                      <button type="button" onClick={() => handleQuantity(item.product.id, item.quantity - 1)} className="p-2 border border-white/15">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => handleQuantity(item.product.id, item.quantity + 1)} className="p-2 border border-white/15">
                        <Plus size={14} />
                      </button>
                      <button type="button" onClick={() => handleRemove(item.product.id)} className="ml-auto text-xs uppercase tracking-widest text-white/40 hover:text-white">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!cart.items.length && <p className="text-sm text-white/40">Your cart is empty.</p>}
            </div>

            <div className="my-8 flex justify-between border-t border-white/10 pt-5 text-lg">
              <span>Total</span>
              <span>{formatPrice(cart.total)}</span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-3">
              {(['name', 'email', 'phone', 'address'] as const).map((field) => (
                <input
                  key={field}
                  required
                  value={checkout[field]}
                  onChange={(event) => setCheckout({ ...checkout, [field]: event.target.value })}
                  placeholder={field === 'address' ? 'Delivery address' : field[0].toUpperCase() + field.slice(1)}
                  className="w-full bg-white/5 border border-white/10 p-3 text-sm outline-none focus:border-white"
                />
              ))}
              <button
                type="submit"
                disabled={!cart.items.length}
                className="w-full bg-brand-cream py-4 text-sm font-bold uppercase tracking-widest text-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                Checkout
              </button>
            </form>
          </aside>
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[72] bg-black/75 p-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto grid max-w-4xl gap-6 bg-[#101010] p-6 md:grid-cols-2">
            <img src={productImage(selectedProduct)} alt={selectedProduct.name} className="h-full min-h-80 w-full object-cover bg-white/5" />
            <div>
              <div className="flex justify-end">
                <button type="button" onClick={() => setSelectedProduct(null)} className="p-2 hover:bg-white/10">
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs uppercase tracking-widest text-white/40">{selectedProduct.category}</p>
              <h2 className="mt-3 font-display text-4xl">{selectedProduct.name}</h2>
              <p className="mt-4 text-white/50">{selectedProduct.description}</p>
              <div className="mt-6 text-2xl">{formatPrice(selectedProduct.price)}</div>
              <div className="mt-2 text-sm text-white/40">Rating {selectedProduct.rating}/5 - {selectedProduct.stock} in stock</div>
              <button
                type="button"
                onClick={() => handleAddToCart(selectedProduct.id)}
                className="mt-8 bg-brand-cream px-8 py-4 text-sm font-bold uppercase tracking-widest text-brand-dark"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {content && (
        <div className="fixed inset-0 z-[74] bg-black/75 p-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-xl bg-[#101010] p-8">
            <div className="mb-6 flex justify-end">
              <button type="button" onClick={() => setContent(null)} className="p-2 hover:bg-white/10">
                <X size={20} />
              </button>
            </div>
            <h2 className="font-display text-3xl">{content.title}</h2>
            <p className="mt-5 leading-relaxed text-white/55">{content.body}</p>
          </div>
        </div>
      )}
    </div>
  );
}
