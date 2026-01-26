
import React, { useState, useRef, useEffect } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { Deck, GenerateConfig } from '../types';
import { Language, translations } from '../i18n';

interface GeneratorProps {
  onDeckCreated: (deck: Deck) => void;
  lang: Language;
}

const Generator: React.FC<GeneratorProps> = ({ onDeckCreated, lang }) => {
  const t = translations[lang];
  const [content, setContent] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [genLanguage, setGenLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setGenLanguage(lang === 'zh' ? 'Chinese' : 'English');
  }, [lang]);

  const startCamera = async () => {
    setShowCamera(true);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(lang === 'zh' ? "无法访问相机，请确保已授予权限。" : "Cannot access camera. Please ensure permissions are granted.");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleCreate = async () => {
    if (!content.trim() && !capturedImage) return;
    setLoading(true);
    setError(null);
    
    try {
      const config: GenerateConfig = { content, quantity, language: genLanguage };
      const base64Data = capturedImage ? capturedImage.split(',')[1] : undefined;
      const cards = await generateFlashcards(config, base64Data);
      
      if (!cards || cards.length === 0) {
        throw new Error("No cards generated");
      }

      const newDeck: Deck = {
        id: Math.random().toString(36).substr(2, 9),
        title: capturedImage 
          ? (lang === 'zh' ? '扫描生成的卡组' : 'Scanned Deck') 
          : content.split('\n')[0].substring(0, 30) || (lang === 'zh' ? '未命名卡组' : 'Untitled Deck'),
        description: lang === 'zh' ? `基于您提供的内容生成的 ${cards.length} 张记忆卡片。` : `AI-generated deck with ${cards.length} cards based on your content.`,
        icon: capturedImage ? 'photo_camera' : 'auto_awesome',
        category: 'Generated',
        cards,
        lastStudied: lang === 'zh' ? '刚刚' : 'Just now',
        cardCount: cards.length,
      };
      
      onDeckCreated(newDeck);
    } catch (err) {
      console.error(err);
      setError(lang === 'zh' ? "生成失败，请尝试换一个内容或检查网络。" : "Generation failed. Try different content or check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 pt-16 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero */}
      <div className="text-center mb-8">
        <div className="inline-block px-3 py-1 bg-mint-50 rounded-full border border-mint-100 text-[10px] font-bold text-accent uppercase tracking-widest mb-4">
          {t.hero.tag}
        </div>
        <h1 className="text-4xl font-bold text-moss tracking-tight mb-3">
          {t.hero.titlePrefix}<span className="serif-text italic text-accent">{t.hero.titleItalic}</span>{t.hero.titleSuffix}
        </h1>
        <p className="text-sm text-moss-light leading-relaxed font-medium opacity-70">
          {t.hero.subtitle}
        </p>
      </div>

      {/* Creation Area */}
      <div className="bg-gradient-to-br from-white via-white to-mint-50/30 rounded-[36px] border border-mint-100/60 shadow-card overflow-hidden relative">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
        
        <div className="p-6 relative z-10">
          {/* Camera Overlay */}
          {showCamera && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover" />
              <div className="absolute top-1/4 left-0 right-0 flex justify-center pointer-events-none">
                 <div className="w-72 h-72 border-2 border-white/20 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent/60 shadow-[0_0_20px_#A67B8E] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                 </div>
              </div>
              <div className="p-12 flex items-center justify-between bg-gradient-to-t from-black to-transparent">
                <button onClick={stopCamera} className="text-white/60 hover:text-white">
                  <span className="material-symbols-outlined text-4xl">close</span>
                </button>
                <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/10 active:scale-90 transition-transform">
                  <div className="w-14 h-14 bg-accent rounded-full"></div>
                </button>
                <div className="w-10"></div>
              </div>
            </div>
          )}

          {capturedImage ? (
            <div className="relative mb-6 rounded-3xl overflow-hidden aspect-video bg-mint-50 border border-mint-200">
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
              {loading && (
                 <div className="absolute inset-0 bg-black/30 overflow-hidden flex flex-col items-center justify-center">
                   <div className="absolute top-0 left-0 w-full h-1 bg-accent/80 shadow-[0_0_20px_#A67B8E] animate-[scan_2s_linear_infinite]"></div>
                   <div className="text-white text-xs font-bold uppercase tracking-widest mt-4 bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
                     {t.generator.generating}
                   </div>
                 </div>
              )}
              {!loading && (
                <button 
                  onClick={() => setCapturedImage(null)}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-md active:scale-90"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex gap-4 mb-6">
              <button 
                onClick={startCamera}
                className="group flex-1 h-36 bg-gradient-to-br from-accent via-accent to-accent/90 rounded-[28px] flex flex-col items-center justify-center gap-3 text-white shadow-glow hover:shadow-glow-lg active:scale-[0.97] transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                <span className="material-symbols-outlined text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">photo_camera</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">{t.generator.camera}</span>
              </button>
              <label className="group flex-1 h-36 bg-gradient-to-br from-mint-50 to-mint-100/50 border border-mint-200/60 rounded-[28px] flex flex-col items-center justify-center gap-3 text-moss-pale hover:text-moss hover:border-mint-300 active:scale-[0.97] transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/50 transition-colors duration-300"></div>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setCapturedImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }} />
                <span className="material-symbols-outlined text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">upload_file</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">{t.generator.upload}</span>
              </label>
            </div>
          )}

          <div className="relative mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.generator.placeholder}
              className="w-full bg-mint-5/30 border-none rounded-3xl p-6 text-base text-moss placeholder:text-moss-pale/40 min-h-[140px] focus:ring-4 focus:ring-accent/5 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Settings Group */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-gradient-to-br from-mint-50/80 to-mint-100/40 px-5 py-4 rounded-2xl border border-mint-200/50 flex items-center justify-between shadow-subtle hover:shadow-card transition-all duration-300">
              <span className="text-[10px] font-bold text-moss-pale uppercase">{t.generator.max}</span>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="bg-transparent border-none text-sm font-bold text-accent p-0 focus:ring-0 cursor-pointer">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex-1 bg-gradient-to-br from-rose-50/80 to-rose-100/40 px-5 py-4 rounded-2xl border border-rose-200/50 flex items-center justify-between shadow-subtle hover:shadow-card transition-all duration-300">
              <span className="text-[10px] font-bold text-moss-pale uppercase">{t.generator.langLabel}</span>
              <select value={genLanguage} onChange={e => setGenLanguage(e.target.value)} className="bg-transparent border-none text-sm font-bold text-accent p-0 focus:ring-0 cursor-pointer">
                <option value="Chinese">中文</option>
                <option value="English">EN</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleCreate}
            disabled={loading || (!content.trim() && !capturedImage)}
            className="w-full py-5 bg-gradient-to-r from-moss via-moss to-moss/90 text-white rounded-3xl font-bold flex items-center justify-center gap-3 shadow-card hover:shadow-glow active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
            {loading ? (
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span className="text-xs tracking-widest uppercase">{t.generator.generating}</span>
               </div>
            ) : (
              <span className="text-sm tracking-[0.15em] font-extrabold uppercase relative z-10">{t.generator.generate}</span>
            )}
          </button>
          
          {error && <p className="mt-4 text-center text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Generator;
