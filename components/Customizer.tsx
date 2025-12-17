
import React, { useState, useCallback } from 'react';
import { Upload, ShoppingCart, Info, Wand2, Loader2, Check } from 'lucide-react';
import { TShirtCanvas } from './TShirtCanvas';
import { TShirtColor, DesignState } from '../types';
import { analyzeDesign } from '../geminiService';

interface CustomizerProps {
  onComplete: (design: DesignState, aiInfo: any) => void;
}

const Customizer: React.FC<CustomizerProps> = ({ onComplete }) => {
  const [design, setDesign] = useState<DesignState>({
    color: TShirtColor.WHITE,
    overlayImage: null,
    scale: 0.5,
    position: { x: 0, y: 0 }
  });
  
  const [aiInfo, setAiInfo] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        setDesign(prev => ({ ...prev, overlayImage: base64 }));
        
        setIsAnalyzing(true);
        try {
          const info = await analyzeDesign(base64);
          setAiInfo(info);
        } catch (err) {
          console.error("AI Analysis failed", err);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12 items-start max-w-7xl mx-auto p-4 md:p-8">
      {/* 3D Preview Section */}
      <div className="w-full lg:w-3/5">
        <div className="relative rounded-[4rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border-4 border-white dark:border-slate-800">
          <TShirtCanvas 
            color={design.color} 
            designUrl={design.overlayImage} 
            designScale={design.scale}
          />
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full lg:w-2/5 space-y-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Personaliza tu <br/><span className="rainbow-text">Camiseta</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Exprésate sin límites con nuestro estudio creativo.</p>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Base Textil</label>
          <div className="flex gap-6">
            <button
              onClick={() => setDesign(prev => ({ ...prev, color: TShirtColor.WHITE }))}
              className={`group relative w-16 h-16 rounded-2xl transition-all flex items-center justify-center ${
                design.color === TShirtColor.WHITE 
                ? 'scale-110 shadow-xl' 
                : 'hover:scale-105'
              }`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-white border-2 ${design.color === TShirtColor.WHITE ? 'border-inkBlue' : 'border-slate-200 dark:border-slate-700'}`} />
              {design.color === TShirtColor.WHITE && <Check className="w-6 h-6 text-inkBlue relative z-10" />}
            </button>
            <button
              onClick={() => setDesign(prev => ({ ...prev, color: TShirtColor.BLACK }))}
              className={`group relative w-16 h-16 rounded-2xl transition-all flex items-center justify-center ${
                design.color === TShirtColor.BLACK 
                ? 'scale-110 shadow-xl' 
                : 'hover:scale-105'
              }`}
            >
              <div className={`absolute inset-0 rounded-2xl bg-slate-900 border-2 ${design.color === TShirtColor.BLACK ? 'border-inkPink' : 'border-slate-800'}`} />
              {design.color === TShirtColor.BLACK && <Check className="w-6 h-6 text-inkPink relative z-10" />}
            </button>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Subir Arte (Logo/Imagen)</label>
          <div className="relative group overflow-hidden rounded-[2rem]">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-[2rem] p-10 group-hover:border-inkBlue transition-all bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:text-inkBlue">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-inkBlue" />
              </div>
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Haz clic para cargar imagen</span>
              <span className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">PNG / JPG - MAX 5MB</span>
            </div>
          </div>
        </div>

        {/* AI Feedback Card */}
        {design.overlayImage && (
          <div className="bg-gradient-to-br from-inkPink/5 via-white to-inkBlue/5 dark:from-inkPink/10 dark:via-slate-800 dark:to-inkBlue/10 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-inkPink/10 rounded-lg">
                <Wand2 className="w-5 h-5 text-inkPink" />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">INK-ASSISTANT AI</h3>
            </div>
            
            {isAnalyzing ? (
              <div className="flex items-center gap-3 text-slate-400 py-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-sm font-bold animate-pulse">Analizando estética...</span>
              </div>
            ) : aiInfo ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="bg-white/50 dark:bg-slate-900/50 p-4 rounded-2xl">
                  <p className="text-xs font-black text-inkPink uppercase tracking-widest mb-1">Nombre Sugerido</p>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-100">{aiInfo.name}</p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {aiInfo.description}
                </p>
                <div className="flex items-start gap-2 bg-inkBlue/5 p-3 rounded-xl border border-inkBlue/10">
                  <Info className="w-4 h-4 text-inkBlue mt-0.5" />
                  <p className="text-[11px] font-bold text-inkBlue uppercase tracking-wide">Tip: {aiInfo.suggestion}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Scale Control */}
        {design.overlayImage && (
          <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Escala del Diseño</label>
              <span className="text-xs font-black text-slate-900 dark:text-white px-2 py-1 bg-white dark:bg-slate-700 rounded-md shadow-sm">{Math.round(design.scale * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.1" 
              max="1.2" 
              step="0.01" 
              value={design.scale}
              onChange={(e) => setDesign(prev => ({ ...prev, scale: parseFloat(e.target.value) }))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-inkPink"
            />
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={() => onComplete(design, aiInfo)}
          disabled={!design.overlayImage}
          className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all relative overflow-hidden ${
            design.overlayImage 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:scale-[1.02] active:scale-[0.98]' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
          }`}
        >
          {design.overlayImage && (
            <div className="absolute inset-0 bg-gradient-to-r from-inkPink via-inkYellow to-inkGreen opacity-0 hover:opacity-10 transition-opacity" />
          )}
          <ShoppingCart className="w-6 h-6" />
          Finalizar Diseño
        </button>
      </div>
    </div>
  );
};

export default Customizer;
