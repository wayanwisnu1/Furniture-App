import React, { useState } from 'react';
import { submitContact } from '../lib/api';
import { showErrorAlert, showSuccessAlert } from '../lib/alerts';

export default function MapSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitContact(formData);
      setFormData({ name: '', email: '', message: '' });
      showSuccessAlert(result.message);
    } catch (error) {
      showErrorAlert(error instanceof Error ? error.message : 'Message failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-24 px-6 lg:px-24 bg-brand-dark border-t border-white/5" id="contact">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-24">
        <div>
          <h2 className="text-4xl font-display font-medium mb-8 uppercase tracking-tight">Get in Touch</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-sm p-4 focus:border-white outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Email</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-sm p-4 focus:border-white outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-widest text-white/40 mb-2">Message</label>
              <textarea 
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-sm p-4 focus:border-white outline-none transition-colors resize-none" 
              />
            </div>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-cream text-brand-dark font-bold py-4 rounded-sm hover:bg-white transition-colors uppercase tracking-[0.2em] disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        <div className="h-[500px] w-full rounded-sm overflow-hidden bg-white/5 relative">
          <iframe
            title="Location Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3017.100650754826!2d107.64948577356509!3d-6.901172167533931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e793e3aaa16d%3A0x9f316cf4133b7112!2sMulia%20Jaya%20Abadi%20Mebel!5e1!3m2!1sid!2sid!4v1779183556902!5m2!1sid!2sid"
            className="h-full w-full"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
}
