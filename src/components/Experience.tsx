import { motion } from 'motion/react';
import chairImage from '../assets/images/modern_armchair_white_1779096296367.png';
import lampImage from '../assets/images/modern_lamps_collection_1779096310280.png';

const items = [
  { img: chairImage, name: 'Chair', category: 'Chair' },
  { img: lampImage, name: 'Lamp', category: 'Lamp' },
  { img: chairImage, name: 'Modern', category: 'All' },
  { img: lampImage, name: 'Decor', category: 'Table' },
  { img: chairImage, name: 'Sofa', category: 'All' },
  { img: lampImage, name: 'Light', category: 'Lamp' },
];

type ExperienceProps = {
  onSelectCategory?: (category: string) => void;
};

export default function Experience({ onSelectCategory }: ExperienceProps) {
  return (
    <section className="py-24 bg-brand-dark overflow-hidden" id="experience">
      <div className="px-6 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-6xl font-display font-medium max-w-lg"
        >
          We Provide You the Best Experience
        </motion.h2>
        
        <div className="flex flex-col gap-6">
           <div className="text-4xl font-display text-white/10">{'{||}'}</div>
           <p className="text-white/40 text-sm leading-relaxed max-w-sm">
            You don't have to worry about the result because all of these interiors are made by people who are professionals in their fields with an elegant and luxurious style and with premium materials.
          </p>
        </div>
      </div>
      
      <div className="flex gap-8 px-6 lg:px-24 overflow-x-auto pb-8 scrollbar-hide no-scrollbar">
        {items.map((item, i) => (
          <motion.button 
            type="button"
            key={`${item.name}-${i}`}
            onClick={() => onSelectCategory?.(item.category)}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex-shrink-0 w-48 h-48 rounded-full bg-white/5 flex items-center justify-center group cursor-pointer border border-white/5 hover:border-white/20 transition-all"
            aria-label={`View ${item.name}`}
          >
            <img 
              src={item.img} 
              alt={item.name} 
              className="w-3/4 h-3/4 object-contain group-hover:rotate-12 transition-transform"
              referrerPolicy="no-referrer"
            />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
