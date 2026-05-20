import { Facebook, Instagram, Twitter } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { subscribeNewsletter } from '../lib/api';

type FooterProps = {
  onNavigate?: (sectionId: string, category?: string) => void;
  onOpenPage?: (slug: string) => void;
  onSubscribeSuccess?: (message: string) => void;
};

export default function Footer({ onNavigate, onOpenPage, onSubscribeSuccess }: FooterProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await subscribeNewsletter(email);
      setEmail('');
      onSubscribeSuccess?.(result.message);
    } catch (error) {
      onSubscribeSuccess?.(error instanceof Error ? error.message : 'Unable to subscribe.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <footer className="bg-brand-dark pt-24 pb-12 px-6 lg:px-24 border-t border-white/10" id="footer">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        <div>
          <button type="button" onClick={() => onNavigate?.('hero')} className="text-6xl font-bold font-display uppercase italic mb-8">
            sofa
          </button>
          <p className="text-white/40 text-sm mb-8 max-w-sm">
            Subscribe for the best of SOFA - new drops, styling tips and all the things worth knowing.
          </p>
          
          <form onSubmit={handleSubscribe} className="flex max-w-md gap-4">
            <input 
              required
              type="email" 
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="example@mail.com" 
              className="flex-1 bg-transparent border-b border-white/30 py-3 text-sm focus:border-white outline-none transition-colors"
            />
            <button type="submit" disabled={isSubmitting} className="bg-brand-cream text-brand-dark px-6 py-2 text-sm font-bold uppercase tracking-wider hover:bg-white transition-colors disabled:opacity-60">
              {isSubmitting ? 'Saving' : 'Join'}
            </button>
          </form>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6">Services</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><button type="button" onClick={() => onNavigate?.('why-sofa')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button type="button" onClick={() => onNavigate?.('contact')} className="hover:text-white transition-colors">Contact</button></li>
              <li><button type="button" onClick={() => onNavigate?.('news')} className="hover:text-white transition-colors">Blog</button></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6">Follow Us</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><a className="flex items-center gap-2 hover:text-white transition-colors" href="https://facebook.com" target="_blank" rel="noreferrer"><Facebook size={14} /> Facebook</a></li>
              <li><a className="flex items-center gap-2 hover:text-white transition-colors" href="https://twitter.com" target="_blank" rel="noreferrer"><Twitter size={14} /> Twitter</a></li>
              <li><a className="flex items-center gap-2 hover:text-white transition-colors" href="https://instagram.com" target="_blank" rel="noreferrer"><Instagram size={14} /> Instagram</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-6">Furniture</h4>
            <ul className="space-y-4 text-white/50 text-sm">
              <li><button type="button" onClick={() => onNavigate?.('best-sellers', 'Beds')} className="hover:text-white transition-colors">Beds</button></li>
              <li><button type="button" onClick={() => onNavigate?.('best-sellers', 'Chair')} className="hover:text-white transition-colors">Chair</button></li>
              <li><button type="button" onClick={() => onNavigate?.('best-sellers', 'All')} className="hover:text-white transition-colors">All</button></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
        <div className="text-white/20 text-[10px] uppercase tracking-widest">&copy; 2026 SOFA FURNITURE. ALL RIGHTS RESERVED.</div>
        <div className="flex gap-8 text-white/20 text-[10px] uppercase tracking-widest">
          <button type="button" onClick={() => onOpenPage?.('terms')} className="hover:text-white transition-colors">Terms & Conditions</button>
          <button type="button" onClick={() => onOpenPage?.('privacy')} className="hover:text-white transition-colors">Privacy Policy</button>
        </div>
      </div>
    </footer>
  );
}
