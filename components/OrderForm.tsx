
import React, { useState } from 'react';
import { ArrowLeft, CreditCard, ShieldCheck, Mail, User, Sparkles, Shirt } from 'lucide-react';
import { DesignState, Order } from '../types';
import { saveOrder } from '../orderService';

interface OrderFormProps {
  design: DesignState;
  aiInfo: any;
  onBack: () => void;
  onSuccess: () => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ design, aiInfo, onBack, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(r => setTimeout(r, 1500));
    
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      customerName: formData.name,
      email: formData.email,
      color: design.color,
      designUrl: design.overlayImage || '',
      status: 'pending',
      createdAt: Date.now(),
      total: 35.00,
      aiDescription: aiInfo?.name || 'Ink-Custom Design'
    };
    
    saveOrder(newOrder);
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-inkPink font-black uppercase text-xs tracking-widest transition-colors group"
        >
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-inkPink/10 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </div>
          Volver al Editor
        </button>
        <div className="flex items-center gap-2">
           <Sparkles className="w-5 h-5 text-inkYellow" />
           <h2 className="text-2xl font-black dark:text-white uppercase tracking-tight">Checkout Seguro</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Form Column */}
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-8 bg-white dark:bg-slate-800/50 p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Tus Datos de Envío</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Nombre</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-inkBlue transition-colors" />
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-inkBlue outline-none transition-all dark:text-white font-bold"
                      placeholder="Ej. Alex Smith"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tu Correo</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-inkPink transition-colors" />
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-inkPink outline-none transition-all dark:text-white font-bold"
                      placeholder="email@ink.com"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-medium">
                    <span>Premium T-Shirt Base</span>
                    <span>$29.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-medium">
                    <span>Custom Ink-Print Fee</span>
                    <span>$6.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-2xl font-black dark:text-white tracking-tighter uppercase">Total</span>
                    <span className="text-4xl font-black rainbow-text">$35.00</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-4 border-white/20 dark:border-slate-900/20 border-t-white dark:border-t-slate-900 rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard className="w-6 h-6" />
                      Procesar Pedido
                    </>
                  )}
                </button>
                
                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-4 h-4 text-inkGreen" />
                  Seguridad Cifrada Ink-Secure
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-5 space-y-6">
           <div className="sticky top-24">
              <div className="bg-slate-900 dark:bg-white/5 p-8 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                   <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white/20 group-hover:text-inkPink transition-colors">
                      {/* Fix: Imported missing 'Shirt' icon from lucide-react */}
                      <Shirt size={32} />
                   </div>
                </div>

                <h3 className="font-black text-white uppercase tracking-tighter text-xl mb-8">Previsualización Final</h3>
                
                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center p-8 mb-8">
                  <div className={`absolute inset-0 opacity-10 ${design.color === 'BLACK' ? 'bg-black' : 'bg-white'}`} />
                  {design.overlayImage && (
                    <img 
                      src={design.overlayImage} 
                      alt="Preview" 
                      className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      style={{ transform: `scale(${design.scale * 1.5})` }}
                    />
                  )}
                </div>

                <div className="space-y-4 text-white">
                  <div>
                    <p className="text-[10px] font-black text-inkPink uppercase tracking-widest mb-1">Modelo Seleccionado</p>
                    <p className="text-xl font-bold tracking-tight">INK-Premium Comfort</p>
                  </div>
                  <div className="flex gap-4 text-xs font-black uppercase tracking-widest">
                    <span className="px-3 py-1 bg-white/10 rounded-full">Base: {design.color}</span>
                    <span className="px-3 py-1 bg-white/10 rounded-full">Fit: Regular</span>
                  </div>
                  {aiInfo && (
                    <div className="pt-4 mt-4 border-t border-white/5">
                       <p className="text-[10px] font-black text-inkBlue uppercase tracking-widest mb-1">Concepto AI</p>
                       <p className="text-sm font-medium italic opacity-70">"{aiInfo.name}"</p>
                    </div>
                  )}
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default OrderForm;
