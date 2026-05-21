import { Search, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

type NavbarProps = {
  cartCount: number;
  isAdmin?: boolean;
  onNavigate: (sectionId: string, category?: string) => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
  onOpenShop: () => void;
};

export default function Navbar({ cartCount, isAdmin = false, onNavigate, onOpenCart, onOpenSearch, onOpenShop }: NavbarProps) {
  const links = [
    { label: 'Furniture', sectionId: 'best-sellers', category: 'All' },
    { label: 'About Us', sectionId: 'why-sofa' },
    { label: 'Blog', sectionId: 'news' },
    { label: 'Contact', sectionId: 'contact' },
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-transparent backdrop-blur-sm lg:px-12"
    >
      <button
        type="button"
        onClick={() => onNavigate('hero')}
        className="text-2xl font-bold tracking-tighter font-display uppercase italic"
      >
        sofnu.
      </button>

      {isAdmin && <div />}
      
      {!isAdmin && <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
        <li>
          <button
            type="button"
            onClick={onOpenShop}
            className="hover:text-white transition-colors uppercase"
          >
            Shop
          </button>
        </li>
        {links.map((link) => (
          <li key={link.label}>
            <button
              type="button"
              onClick={() => onNavigate(link.sectionId, link.category)}
              className="hover:text-white transition-colors uppercase"
            >
              {link.label}
            </button>
          </li>
        ))}
      </ul>}
      
      {!isAdmin && <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
          id="nav-search"
          aria-label="Open search"
        >
          <Search size={20} />
        </button>
        <button
          type="button"
          onClick={onOpenCart}
          className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
          id="nav-cart"
          aria-label="Open cart"
        >
          <ShoppingBag size={20} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cream px-1 text-[10px] font-bold text-brand-dark">
              {cartCount}
            </span>
          )}
        </button>
      </div>}
    </motion.nav>
  );
}
