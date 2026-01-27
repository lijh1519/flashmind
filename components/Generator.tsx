
import React, { useState, useRef, useEffect } from 'react';
import { generateFlashcards } from '../services/geminiService';
import { Deck, GenerateConfig } from '../types';
import { Language, translations } from '../i18n';
import * as pdfjsLib from 'pdfjs-dist';

// 配置 PDF.js worker - 使用 jsDelivr CDN
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.530/build/pdf.worker.min.mjs';
}

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
  const [uploadedFile, setUploadedFile] = useState<{name: string, type: string} | null>(null);
  
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

  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      console.log('开始解析 PDF:', file.name, file.type, file.size);
      
      const arrayBuffer = await file.arrayBuffer();
      console.log('ArrayBuffer 大小:', arrayBuffer.byteLength);
      
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      console.log('PDF 加载成功,总页数:', pdf.numPages);
      
      let fullText = '';
      
      // 提取所有页面的文本
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
        console.log(`第 ${i} 页提取完成`);
      }
      
      const trimmedText = fullText.trim();
      console.log('提取的文本长度:', trimmedText.length);
      
      if (!trimmedText || trimmedText.length < 10) {
        throw new Error(lang === 'zh' ? 'PDF 文件为空或无法读取文本内容' : 'PDF is empty or contains no readable text');
      }
      
      return trimmedText;
    } catch (error: any) {
      console.error('PDF 解析错误:', error);
      
      // 更详细的错误信息
      if (error.name === 'InvalidPDFException') {
        throw new Error(lang === 'zh' ? '无效的 PDF 文件格式' : 'Invalid PDF file format');
      } else if (error.name === 'PasswordException') {
        throw new Error(lang === 'zh' ? 'PDF 文件加密,无法解析' : 'PDF is password protected');
      } else {
        throw new Error(error.message || (lang === 'zh' ? 'PDF 文件解析失败' : 'Failed to parse PDF file'));
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    console.log('文件上传:', file.name, file.type, file.size);
    
    if (file.type === 'application/pdf') {
      setLoading(true);
      setError(null);
      setUploadedFile({ name: file.name, type: 'pdf' });
      
      try {
        const text = await extractTextFromPDF(file);
        setContent(text);
        setCapturedImage(null);
        console.log('文本设置成功');
      } catch (err: any) {
        console.error('文件处理错误:', err);
        setError(err.message || (lang === 'zh' ? 'PDF 处理失败' : 'Failed to process PDF'));
        setUploadedFile(null);
      } finally {
        setLoading(false);
      }
    } else if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        setUploadedFile(null);
        setContent('');
      };
      reader.readAsDataURL(file);
    } else {
      setError(lang === 'zh' ? '仅支持 PDF 和图片文件' : 'Only PDF and image files are supported');
    }
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
          {t.hero.titlePrefix}<span className="text-accent">{t.hero.titleItalic}</span>{t.hero.titleSuffix}
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
              
              {/* 拍摄提示 */}
              <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none">
                <div className="bg-black/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
                  <p className="text-white text-sm font-bold tracking-wide">对准书籍或文章内容</p>
                </div>
              </div>
              
              {/* 扫描框 */}
              <div className="absolute top-1/4 left-0 right-0 flex justify-center pointer-events-none">
                 <div className="w-72 h-72 border-2 border-white/20 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent/60 shadow-[0_0_20px_#A67B8E] animate-[scan_2.5s_ease-in-out_infinite]"></div>
                 </div>
              </div>
              
              {/* 控制按钮 */}
              <div className="p-12 flex items-center justify-between bg-gradient-to-t from-black to-transparent">
                <button onClick={stopCamera} className="text-white/60 hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-4xl">close</span>
                </button>
                <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-8 border-white/10 active:scale-90 transition-transform shadow-glow">
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
          ) : uploadedFile ? (
            <div className="relative mb-6 rounded-3xl overflow-hidden bg-gradient-to-br from-mint-50 to-mint-100/50 border border-mint-200 p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/5 rounded-2xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-accent">description</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-moss mb-1 truncate">{uploadedFile.name}</h3>
                  <p className="text-xs text-moss-pale uppercase tracking-wider">PDF 文件</p>
                </div>
                {!loading && (
                  <button 
                    onClick={() => {
                      setUploadedFile(null);
                      setContent('');
                    }}
                    className="w-10 h-10 bg-moss/10 hover:bg-moss/20 text-moss rounded-full flex items-center justify-center transition-all active:scale-90"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
              {loading && (
                <div className="mt-4 flex items-center gap-3 text-moss-pale">
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold uppercase tracking-wider">解析中...</span>
                </div>
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
                <span className="text-[9px] text-white/70 tracking-wide relative z-10">拍摄书籍文章</span>
              </button>
              <label className="group flex-1 h-36 bg-gradient-to-br from-mint-50 to-mint-100/50 border border-mint-200/60 rounded-[28px] flex flex-col items-center justify-center gap-3 text-moss-pale hover:text-moss hover:border-mint-300 active:scale-[0.97] transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/50 transition-colors duration-300"></div>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }} 
                />
                <span className="material-symbols-outlined text-4xl relative z-10 group-hover:scale-110 transition-transform duration-300">upload_file</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">{t.generator.upload}</span>
                <span className="text-[9px] text-moss-pale/70 tracking-wide relative z-10">图片/PDF</span>
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
              <span className="text-xs font-bold text-moss uppercase tracking-wider">{t.generator.max}</span>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="bg-transparent border-none text-lg font-extrabold text-accent p-0 focus:ring-0 cursor-pointer">
                <option value={5}>5 张</option>
                <option value={10}>10 张</option>
                <option value={20}>20 张</option>
              </select>
            </div>
            <div className="flex-1 bg-gradient-to-br from-rose-50/80 to-rose-100/40 px-5 py-4 rounded-2xl border border-rose-200/50 flex items-center justify-between shadow-subtle hover:shadow-card transition-all duration-300">
              <span className="text-xs font-bold text-moss uppercase tracking-wider">{t.generator.langLabel}</span>
              <select value={genLanguage} onChange={e => setGenLanguage(e.target.value)} className="bg-transparent border-none text-lg font-extrabold text-accent p-0 focus:ring-0 cursor-pointer">
                <option value="Chinese">中文</option>
                <option value="English">English</option>
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
