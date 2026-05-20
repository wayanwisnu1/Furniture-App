import { motion } from 'motion/react';
import heroImage from '../assets/images/hero_furniture_dark_1779096280990.png';

type HeroProps = {
  onStartShopping: () => void;
};

export default function Hero({ onStartShopping }: HeroProps) {
  return (
    <section className="relative h-screen w-full flex items-center justify-center overflow-hidden" id="hero">
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Modern Furniture Hero" 
          className="w-full h-full object-cover brightness-[0.4]"
          referrerPolicy="no-referrer"
        />
      </div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-display font-medium tracking-tight mb-6"
        >
          Modern Furniture
        </motion.h1>
        
        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-lg md:text-xl text-white/60 mb-10 max-w-xl mx-auto"
        >
          Turn your room with bento into a lot more minimalist with ease and speed
        </motion.p>
        
        <motion.button 
          type="button"
          onClick={onStartShopping}
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-10 py-4 bg-white text-brand-dark font-semibold rounded-sm hover:bg-white/90 transition-colors uppercase tracking-wider"
          id="hero-cta"
        >
          Start Shopping
        </motion.button>
      </div>
    </section>
  );
}
