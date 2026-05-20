import { motion } from 'motion/react';

type CTAProps = {
  onContact?: () => void;
};

export default function CTA({ onContact }: CTAProps) {
  return (
    <section className="py-32 bg-brand-dark relative overflow-hidden" id="cta">
      {/* Decorative furniture outlines as per reference */}
      <div className="absolute top-1/2 left-10 -translate-y-1/2 opacity-20 hidden lg:block">
        <div className="w-48 h-48 border-2 border-dashed border-white/30 rounded-xl skew-x-3" />
      </div>
       <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-20 hidden lg:block">
        <div className="w-48 h-48 border-2 border-dashed border-white/30 rounded-full" />
      </div>

      <div className="relative z-10 text-center px-6">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl font-display font-medium mb-4 leading-tight"
        >
          Need help with<br />choosing furniture?
        </motion.h2>
        <p className="text-white/40 mb-12 text-lg">We're here for you!</p>
        <button type="button" onClick={onContact} className="px-12 py-5 bg-brand-cream text-brand-dark font-bold rounded-sm hover:scale-105 transition-all uppercase tracking-widest text-sm">
          Contact Us
        </button>
      </div>
    </section>
  );
}
