import { motion } from 'motion/react';
import lampImage from '../assets/images/modern_lamps_collection_1779096310280.png';

type NewsProps = {
  onReadMore?: () => void;
};

export default function News({ onReadMore }: NewsProps) {
  return (
    <section className="py-24 px-6 lg:px-24 bg-brand-dark" id="news">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative aspect-square"
        >
          <img 
            src={lampImage} 
            alt="Lamps Showcase" 
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        
        <div>
          <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-white/40 mb-6">News</div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-display font-medium leading-[1.1] mb-10"
          >
            Official House Furniture Partner - Grand Designs Live 2026
          </motion.h2>
          
          <p className="text-white/40 text-sm leading-relaxed mb-12 max-w-sm">
            We're proud to announce Sofa as the Official House Furniture Partner for Grand Designs Live 2026. Furnishing the show's featured house, Cult brings bold design, considered function and distinctive personality to one of the UK's most iconic design destinations. Discover how we're bringing modern living to life and explore what's to come.
          </p>
          
          <button type="button" onClick={onReadMore} className="px-10 py-4 border border-white/30 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-brand-dark transition-all flex items-center gap-4 group">
            Read More
            <span className="group-hover:translate-x-2 transition-transform">-&gt;</span>
          </button>
        </div>
      </div>
    </section>
  );
}
