import { motion } from 'motion/react';
import interiorImage from '../assets/images/luxury_living_room_sofa_1779096324917.png';

type InteriorDesignProps = {
  onReadMore?: () => void;
};

export default function InteriorDesign({ onReadMore }: InteriorDesignProps) {
  return (
    <section className="py-24 bg-brand-dark" id="interior-service">
      <div className="flex flex-col lg:flex-row h-full">
        <div className="lg:w-1/2 p-6 lg:p-24 flex flex-col justify-center">
          <motion.h3 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-3xl font-display font-medium mb-6"
          >
            Interior Design Service
          </motion.h3>
          <p className="text-white/50 text-sm leading-relaxed mb-10 max-w-sm">
            So whether you're bursting with design ideas and just need help refining, or you're looking for help with a full home styling refresh; our design experts are here to help!
          </p>
          <button type="button" onClick={onReadMore} className="w-fit px-8 py-3 border border-white/30 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-brand-dark transition-all flex items-center gap-4 group">
            Read More
            <span className="group-hover:translate-x-2 transition-transform">-&gt;</span>
          </button>
        </div>
        
        <div className="lg:w-1/2 relative overflow-hidden h-[500px]">
          <img 
            src={interiorImage} 
            alt="Interior Design" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-dark to-transparent lg:hidden" />
        </div>
      </div>
    </section>
  );
}
