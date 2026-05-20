import { motion } from 'motion/react';
import chairImage from '../assets/images/modern_armchair_white_1779096296367.png';
import lampImage from '../assets/images/modern_lamps_collection_1779096310280.png';
import sofaImage from '../assets/images/luxury_living_room_sofa_1779096324917.png';
import decorImage from '../assets/images/karoas_lamp.jpg';
import tableImage from '../assets/images/luna_table.jpg';

const items = [
  { img: chairImage, name: 'Chair', category: 'Chair', tone: 'Lounge' },
  { img: lampImage, name: 'Lamp', category: 'Lamp', tone: 'Lighting' },
  { img: sofaImage, name: 'Sofa', category: 'All', tone: 'Living' },
  { img: tableImage, name: 'Table', category: 'Table', tone: 'Dining' },
  { img: decorImage, name: 'Decor', category: 'Lamp', tone: 'Accent' },
];

type ExperienceProps = {
  onSelectCategory?: (category: string) => void;
};

export default function Experience({ onSelectCategory }: ExperienceProps) {
  return (
    <section className="py-24 bg-brand-dark overflow-hidden" id="experience">
      <div className="px-6 lg:px-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-end mb-14">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-6xl font-display font-medium max-w-lg leading-[0.98]"
        >
          We Provide You the Best Experience
        </motion.h2>
        
        <div className="flex flex-col gap-5 lg:pb-2">
           <div className="text-4xl font-display text-brand-cream/60">{'{||}'}</div>
           <p className="text-white/65 text-base leading-8 max-w-md">
            You don't have to worry about the result because all of these interiors are made by people who are professionals in their fields with an elegant and luxurious style and with premium materials.
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 px-6 lg:px-24">
        {items.map((item, i) => (
          <motion.button 
            type="button"
            key={`${item.name}-${i}`}
            onClick={() => onSelectCategory?.(item.category)}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group w-full min-w-0 text-left cursor-pointer"
            aria-label={`View ${item.name}`}
          >
            <div className="aspect-[4/5] w-full overflow-hidden rounded-sm border border-white/10 bg-white/5 transition-all duration-500 group-hover:-translate-y-1.5 group-hover:border-brand-cream/70 group-hover:bg-white/10">
              <img 
                src={item.img} 
                alt={item.name} 
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-brand-cream/60">{item.tone}</p>
                <h3 className="mt-1 text-lg font-medium text-white">{item.name}</h3>
              </div>
              <span className="text-xs text-white/35">0{i + 1}</span>
            </div>
          </motion.button>
        ))}
      </div>
    </section>
  );
}
