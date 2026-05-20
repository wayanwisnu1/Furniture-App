import { motion } from 'motion/react';

type StatsProps = {
  onReadMore?: () => void;
};

export default function Stats({ onReadMore }: StatsProps) {
  const stats = [
    { label: 'Years of Crafting', value: '7+' },
    { label: 'Factories', value: '22' },
    { label: 'Satisfied Customers', value: '9K' },
    { label: 'Products', value: '78' },
  ];

  return (
    <section className="py-24 px-6 lg:px-24 bg-brand-dark" id="stats">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24 items-center">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-display font-medium leading-tight mb-8"
          >
            Very Serious Materials<br />For Making Furniture
          </motion.h2>
          
          <button type="button" onClick={onReadMore} className="px-8 py-3 border border-white/30 text-xs font-semibold uppercase tracking-widest hover:bg-white hover:text-brand-dark transition-all flex items-center gap-4 group">
            Read More
            <span className="group-hover:translate-x-2 transition-transform">-&gt;</span>
          </button>
        </div>
        
        <div>
          <p className="text-white/50 text-sm leading-relaxed mb-12 max-w-md">
            You don't have to worry about the result because all of these interiors are made by people who are professionals in their fields with an elegant and luxurious style and with premium quality materials.
          </p>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            {stats.map((s, i) => (
              <motion.div 
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border-b border-white/10 pb-6"
              >
                <div className="text-5xl font-display font-medium mb-2 tracking-tighter">{s.value}</div>
                <div className="text-white/40 text-[10px] uppercase tracking-widest font-semibold">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
