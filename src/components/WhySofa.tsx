import { ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';
import chairImage from '../assets/images/modern_armchair_white_1779096296367.png';

const features = [
  {
    num: '1/',
    title: 'Luxury facilities',
    desc: 'We provide many unique work space choices so that you can choose the workspace.',
    detail: 'Our team helps match furniture with room size, layout, material needs, and day-to-day comfort.',
  },
  {
    num: '2/',
    title: 'Many Choices',
    desc: 'The advantage hiring a workspace with us is that gives you comfortable service and all-around facilities.',
    detail: 'You can choose chairs, lamps, beds, tables, and coordinated room pieces from the same catalogue.',
  },
  {
    num: '3/',
    title: 'Affordable Price',
    desc: 'You can get a workspace of the highest quality at an affordable price and still enjoy the facilities that are only here.',
    detail: 'Clear pricing, practical materials, and focused collections keep the shopping process simple.',
  },
];

type WhySofaProps = {
  onReadFeature?: (title: string, body: string) => void;
};

export default function WhySofa({ onReadFeature }: WhySofaProps) {
  return (
    <section className="py-24 px-6 lg:px-24 bg-brand-dark overflow-hidden" id="why-sofa">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <motion.h2 
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="text-6xl md:text-7xl font-display font-medium mb-4"
          >
            Why<br />Sofnu
          </motion.h2>
          <p className="text-white/40 text-lg">Interior Modern sofas are designed to bring comfort, elegance, and durability into your space. Made with premium materials and a modern aesthetic, each sofa is crafted to enhance your interior while providing long-lasting quality and everyday comfort. A perfect choice for creating a stylish and welcoming living space.
.</p>
          
          <div className="mt-12 text-6xl font-display text-white/5 opacity-20">{'{?}'}</div>
        </div>
        
        <motion.div 
          initial={{ x: 100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          <img 
            src={chairImage} 
            alt="Designer Armchair" 
            className="w-full max-w-lg mx-auto"
            referrerPolicy="no-referrer"
          />
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-white/10 pt-12">
        {features.map((f, i) => (
          <motion.div 
            key={f.title}
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.2 }}
            className="group cursor-pointer"
          >
            <div className="text-white/30 font-display mb-4">{f.num}</div>
            <button type="button" onClick={() => onReadFeature?.(f.title, f.detail)} className="w-full text-left">
              <h3 className="text-xl font-medium mb-3 group-hover:text-brand-cream transition-colors flex items-center justify-between">
                {f.title}
                <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
