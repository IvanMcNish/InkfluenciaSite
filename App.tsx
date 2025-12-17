
import React, { useState, useEffect } from 'react';
import { Package, ShoppingBag, LayoutDashboard, Shirt, CheckCircle, Moon, Sun, Monitor } from 'lucide-react';
import Customizer from './components/Customizer';
import OrderForm from './components/OrderForm';
import AdminDashboard from './components/AdminDashboard';
import { DesignState } from './types';

enum View {
  HOME,
  CUSTOMIZER,
  CHECKOUT,
  SUCCESS,
  ADMIN
}

type Theme = 'light' | 'dark' | 'system';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.HOME);
  const [design, setDesign] = useState<DesignState | null>(null);
  const [aiInfo, setAiInfo] = useState<any>(null);
  const [theme, setTheme] = useState<Theme>('system');

  // Handle Theme
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = (t: 'light' | 'dark') => {
      root.classList.toggle('dark', t === 'dark');
      root.style.colorScheme = t;
    };

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      applyTheme(systemTheme);
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [theme]);

  // Sync hash with view
  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash;
      if (h === '#admin') setView(View.ADMIN);
      else if (h === '#customizer') setView(View.CUSTOMIZER);
      else if (!h) setView(View.HOME);
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleCustomizationComplete = (d: DesignState, info: any) => {
    setDesign(d);
    setAiInfo(info);
    setView(View.CHECKOUT);
  };

  const renderNav = () => (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          onClick={() => { window.location.hash = ''; setView(View.HOME); }}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-inkPink via-inkYellow to-inkBlue opacity-20" />
             <Shirt className="w-6 h-6 text-white dark:text-slate-900 relative z-10" />
          </div>
          <span className="font-black text-2xl tracking-tighter dark:text-white">
            <span className="rainbow-text">Ink</span>fluencia
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => { window.location.hash = 'customizer'; setView(View.CUSTOMIZER); }}
              className={`text-sm font-bold transition-colors ${view === View.CUSTOMIZER ? 'text-inkPink' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Diseñar
            </button>
            <button 
              onClick={() => { window.location.hash = 'admin'; setView(View.ADMIN); }}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${view === View.ADMIN ? 'text-inkPink' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Panel
            </button>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
            <button onClick={() => setTheme('light')} className={`p-1.5 rounded-full transition-all ${theme === 'light' ? 'bg-white shadow-sm text-inkYellow' : 'text-slate-400'}`} title="Modo Claro"><Sun size={14} /></button>
            <button onClick={() => setTheme('dark')} className={`p-1.5 rounded-full transition-all ${theme === 'dark' ? 'bg-slate-700 shadow-sm text-inkBlue' : 'text-slate-400'}`} title="Modo Oscuro"><Moon size={14} /></button>
            <button onClick={() => setTheme('system')} className={`p-1.5 rounded-full transition-all ${theme === 'system' ? 'bg-white dark:bg-slate-700 shadow-sm text-inkGreen' : 'text-slate-400'}`} title="Seguir Sistema"><Monitor size={14} /></button>
          </div>

          <div className="relative cursor-pointer hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6 text-slate-800 dark:text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-inkPink text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">0</span>
          </div>
        </div>
      </div>
    </nav>
  );

  const renderView = () => {
    switch (view) {
      case View.HOME:
        return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 space-y-12 animate-in fade-in duration-700">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.9] dark:text-white">
                Deja tu <br />
                <span className="rainbow-text">Marca.</span>
              </h1>
              <p className="max-w-xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Personaliza tu camiseta con tecnología 3D y deja que la Inteligencia Artificial analice tu arte.
              </p>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-inkPink via-inkYellow to-inkGreen rounded-3xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <button 
                onClick={() => { window.location.hash = 'customizer'; setView(View.CUSTOMIZER); }}
                className="relative px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-2xl shadow-2xl transition-all active:scale-95 flex items-center gap-3"
              >
                Comenzar a Diseñar
              </button>
            </div>

            <div className="pt-12 flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 dark:opacity-40 overflow-hidden">
              <span className="font-bold text-sm tracking-widest dark:text-white">ALTA FIDELIDAD</span>
              <span className="font-bold text-sm tracking-widest dark:text-white">ENVÍO PREMIUM</span>
              <span className="font-bold text-sm tracking-widest dark:text-white">3D INTERACTIVO</span>
              <span className="font-bold text-sm tracking-widest dark:text-white">AI ANALYSIS</span>
            </div>
          </div>
        );
      case View.CUSTOMIZER:
        return <Customizer onComplete={handleCustomizationComplete} />;
      case View.CHECKOUT:
        return design ? (
          <OrderForm 
            design={design} 
            aiInfo={aiInfo} 
            onBack={() => setView(View.CUSTOMIZER)} 
            onSuccess={() => setView(View.SUCCESS)} 
          />
        ) : null;
      case View.SUCCESS:
        return (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4 space-y-8 animate-in zoom-in duration-500">
            <div className="w-32 h-32 bg-inkGreen/10 rounded-full flex items-center justify-center text-inkGreen mb-4 relative">
              <div className="absolute inset-0 bg-inkGreen/5 animate-ping rounded-full" />
              <CheckCircle className="w-16 h-16 relative z-10" />
            </div>
            <h2 className="text-5xl font-black dark:text-white uppercase tracking-tighter leading-none">¡Arte en <br/>Camino!</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md text-lg font-medium">
              Tu diseño ha sido procesado con éxito. Pronto lucirás tu estilo único y personalizado.
            </p>
            <div className="flex flex-col gap-4 pt-6 w-full max-w-xs">
               <button 
                onClick={() => { window.location.hash = ''; setView(View.HOME); }}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform"
              >
                Volver al Inicio
              </button>
              <button 
                onClick={() => { window.location.hash = 'admin'; setView(View.ADMIN); }}
                className="font-black text-xs uppercase tracking-widest text-inkBlue hover:opacity-70 transition-opacity"
              >
                Ver Pedido en Panel Admin
              </button>
            </div>
          </div>
        );
      case View.ADMIN:
        return <AdminDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 selection:bg-inkPink/20">
      {renderNav()}
      <main className="py-8 md:py-12">
        {renderView()}
      </main>
      
      <footer className="mt-20 border-t border-slate-100 dark:border-slate-800 py-16 bg-white dark:bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white dark:text-slate-900" />
              </div>
              <span className="font-black text-xl tracking-tight dark:text-slate-300">Ink<span className="text-slate-400">fluencia</span></span>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest max-w-[200px] text-center md:text-left leading-relaxed">
              Tu lienzo personal para la moda del futuro.
            </p>
          </div>
          <div className="flex gap-12 text-sm font-bold">
            <div className="flex flex-col gap-3">
              <span className="text-slate-900 dark:text-white uppercase text-xs tracking-tighter">Tienda</span>
              <a href="#customizer" className="text-slate-400 hover:text-inkPink transition-colors">Diseñar</a>
              <a href="#" className="text-slate-400 hover:text-inkPink transition-colors">Catálogo</a>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-slate-900 dark:text-white uppercase text-xs tracking-tighter">Legal</span>
              <a href="#" className="text-slate-400 hover:text-inkBlue transition-colors">Privacidad</a>
              <a href="#" className="text-slate-400 hover:text-inkBlue transition-colors">Términos</a>
            </div>
          </div>
          <div className="text-center md:text-right space-y-2">
            <div className="text-[10px] text-slate-300 dark:text-slate-700 font-black uppercase tracking-[0.3em]">
              © 2024 Inkfluencia Studio
            </div>
            <div className="text-[10px] text-inkBlue/40 font-black tracking-widest uppercase">
              POWERED BY GEMINI AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
