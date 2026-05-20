import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import { productImage } from '../lib/productImages';
import type { Product } from '../lib/types';

type ProductsProps = {
  activeCategory: string;
  categories: string[];
  isLoading: boolean;
  page: number;
  products: Product[];
  totalPages: number;
  onCategoryChange: (category: string) => void;
  onGoToShop: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onViewProduct: (product: Product) => void;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export default function Products({
  activeCategory,
  categories,
  isLoading,
  page,
  products,
  totalPages,
  onCategoryChange,
  onGoToShop,
  onNextPage,
  onPrevPage,
  onViewProduct,
}: ProductsProps) {

  return (
    <section className="py-24 px-6 lg:px-24 bg-brand-dark" id="best-sellers">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-6xl font-display font-medium tracking-tight"
        >
          Best Selling<br />Product
        </motion.h2>
        
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-6 py-2 rounded-sm text-sm font-medium transition-all ${
                activeCategory === cat ? 'bg-white text-brand-dark border-transparent' : 'bg-transparent text-white/50 border border-white/20 hover:border-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {isLoading && <div className="text-white/40">Loading products...</div>}
        {products.map((product, i) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="group relative"
          >
            <div className="aspect-[3/4] overflow-hidden mb-6 relative bg-white/5">
              <img 
                src={productImage(product)} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              {product.badge && (
                <div className="absolute top-0 right-0 p-4">
                   <div className="bg-white text-brand-dark text-[10px] font-bold px-3 py-1 rotate-90 origin-right translate-x-4">
                    {product.badge}
                 </div>
                </div>
              )}
              <div className="absolute bottom-6 left-6 text-sm font-display">{formatPrice(product.price)}</div>
              <button
                type="button"
                onClick={() => onViewProduct(product)}
                aria-label={`View ${product.name}`}
                className="absolute bottom-6 right-6 p-2 bg-white/10 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowUpRight size={20} />
              </button>
            </div>
            
            <div className="flex items-start justify-between">
              <button type="button" onClick={() => onViewProduct(product)} className="text-left">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-1">{product.category}</p>
                <h3 className="text-lg font-medium">{product.name}</h3>
              </button>
              <div className="flex gap-1.5 mt-1">
                {product.colors.map((c, ci) => (
                  <div 
                    key={ci} 
                    className="w-3 h-3 rounded-full border border-white/20" 
                    style={{ backgroundColor: c }} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        {!isLoading && !products.length && <div className="text-white/40">No products in this category.</div>}
      </div>
      
      <div className="mt-20 flex items-center justify-between border-t border-white/10 pt-10">
        <div className="flex gap-4">
          <button type="button" onClick={onPrevPage} className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-brand-dark transition-all" aria-label="Previous page">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center text-xs uppercase tracking-widest text-white/40">
            {page}/{totalPages}
          </div>
          <button type="button" onClick={onNextPage} className="p-3 border border-white/20 rounded-full hover:bg-white hover:text-brand-dark transition-all" aria-label="Next page">
            <ArrowRight size={18} />
          </button>
        </div>
        
        <button type="button" onClick={onGoToShop} className="px-10 py-4 bg-brand-cream text-brand-dark font-semibold uppercase text-sm tracking-wider hover:bg-white transition-all">
          Go to Shop
        </button>
      </div>
    </section>
  );
}
