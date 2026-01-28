
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
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{name: string, type: string, content?: string}[]>([]);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [newImageIndex, setNewImageIndex] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const initialDistanceRef = useRef<number>(0);
  const currentStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setGenLanguage(lang === 'zh' ? 'Chinese' : 'English');
  }, [lang]);

  const startCamera = async () => {
    setShowCamera(true);
    setError(null);
    setZoomLevel(1);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      currentStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 获取视频轨道的缩放能力
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();
        console.log('Camera capabilities:', capabilities);
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
        // 快门闪烁效果
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 150);
        
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        
        // 设置新图片索引用于动画
        const newIndex = capturedImages.length;
        setCapturedImages(prev => [...prev, dataUrl]);
        setNewImageIndex(newIndex);
        
        // 延迟关闭相机，让用户看到闪烁效果
        setTimeout(() => {
          stopCamera();
          // 2秒后清除新图片标记
          setTimeout(() => setNewImageIndex(null), 2000);
        }, 200);
      }
    }
  };

  const removeImage = (index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      // 重置 transform
      videoRef.current.style.transform = 'scale(1)';
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => track.stop());
      currentStreamRef.current = null;
    }
    setShowCamera(false);
    setZoomLevel(1);
  };

  // 应用缩放 - 使用 CSS transform 作为后备方案
  const applyZoom = async (zoom: number) => {
    const clampedZoom = Math.max(1, Math.min(zoom, 5)); // 限制 1x-5x
    
    if (!currentStreamRef.current) return;
    
    try {
      const videoTrack = currentStreamRef.current.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities() as any;
      
      // 尝试使用硬件缩放
      if (capabilities.zoom) {
        const minZoom = capabilities.zoom.min || 1;
        const maxZoom = capabilities.zoom.max || 3;
        const hardwareZoom = Math.max(minZoom, Math.min(clampedZoom, maxZoom));
        
        await videoTrack.applyConstraints({
          advanced: [{ zoom: hardwareZoom } as any]
        });
        console.log('使用硬件缩放:', hardwareZoom);
      } else {
        console.log('硬件不支持缩放,使用 CSS transform');
      }
    } catch (err) {
      console.error('硬件缩放失败:', err);
    }
    
    // 无论硬件是否支持,都使用 CSS transform 提供视觉反馈
    setZoomLevel(clampedZoom);
    
    // 应用 CSS 缩放到视频元素
    if (videoRef.current) {
      videoRef.current.style.transform = `scale(${clampedZoom})`;
      videoRef.current.style.transformOrigin = 'center center';
    }
  };

  // 计算两指间距离
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      setIsPinching(true);
      initialDistanceRef.current = getDistance(e.touches[0], e.touches[1]);
    }
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistanceRef.current > 0) {
      e.preventDefault();
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistanceRef.current;
      const newZoom = zoomLevel * scale;
      
      applyZoom(newZoom);
      initialDistanceRef.current = currentDistance;
    }
  };

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      initialDistanceRef.current = 0;
      // 延迟重置 pinching 状态，防止误触发拍照
      setTimeout(() => setIsPinching(false), 100);
    }
  };

  // 处理拍照点击
  const handleCaptureClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (isPinching) {
      e.preventDefault();
      return;
    }
    capturePhoto();
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

  const handleFileUpload = async (files: FileList) => {
    setError(null);
    
    for (const file of Array.from(files)) {
      console.log('文件上传:', file.name, file.type, file.size);
      
      if (file.type === 'application/pdf') {
        setLoading(true);
        try {
          const text = await extractTextFromPDF(file);
          setUploadedFiles(prev => [...prev, { name: file.name, type: 'pdf', content: text }]);
          // 合并 PDF 内容到文本区
          setContent(prev => prev ? prev + '\n\n' + text : text);
          console.log('PDF 解析成功');
        } catch (err: any) {
          console.error('文件处理错误:', err);
          setError(err.message || (lang === 'zh' ? 'PDF 处理失败' : 'Failed to process PDF'));
        } finally {
          setLoading(false);
        }
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCapturedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setError(lang === 'zh' ? '仅支持 PDF 和图片文件' : 'Only PDF and image files are supported');
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!content.trim() && capturedImages.length === 0) return;
    setLoading(true);
    setError(null);
    
    try {
      const config: GenerateConfig = { content, quantity, language: genLanguage };
      // 支持多张图片
      const base64DataArray = capturedImages.length > 0 
        ? capturedImages.map(img => img.split(',')[1]) 
        : undefined;
      const cards = await generateFlashcards(config, base64DataArray);
      
      if (!cards || cards.length === 0) {
        throw new Error("No cards generated");
      }

      const newDeck: Deck = {
        id: Math.random().toString(36).substr(2, 9),
        title: capturedImages.length > 0 
          ? (lang === 'zh' ? '扫描生成的卡组' : 'Scanned Deck') 
          : content.split('\n')[0].substring(0, 30) || (lang === 'zh' ? '未命名卡组' : 'Untitled Deck'),
        description: lang === 'zh' ? `基于您提供的内容生成的 ${cards.length} 张记忆卡片。` : `AI-generated deck with ${cards.length} cards based on your content.`,
        icon: capturedImages.length > 0 ? 'photo_camera' : 'auto_awesome',
        category: 'Generated',
        cards,
        lastStudied: lang === 'zh' ? '刚刚' : 'Just now',
        cardCount: cards.length,
        originalContent: content || '（图片内容）',
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
      <div className="text-center mb-8 relative">
        {/* 浮动装饰 */}
        <div className="absolute -top-8 left-1/4 w-16 h-16 bg-gradient-to-br from-accent/20 to-accent/5 rounded-full blur-xl animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute -top-4 right-1/4 w-12 h-12 bg-gradient-to-br from-amber-200/30 to-transparent rounded-full blur-lg animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-16 -left-4 w-8 h-8 bg-gradient-to-br from-sky-200/30 to-transparent rounded-full blur-md animate-float" style={{animationDelay: '2s'}}></div>
        
        <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-accent/10 to-accent/5 rounded-full border border-accent/20 text-[10px] font-bold text-accent uppercase tracking-widest mb-5 animate-pulse-soft">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping"></span>
            {t.hero.tag}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-moss tracking-tight mb-3 relative">
          {t.hero.titlePrefix}<span className="text-accent relative">{t.hero.titleItalic}<span className="absolute -bottom-1 left-0 right-0 h-2 bg-accent/10 -skew-x-6 rounded"></span></span>{t.hero.titleSuffix}
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
            <div className="fixed inset-0 z-[100] bg-black flex flex-col">
              {/* 可点击拍照的视频区域 */}
              <div 
                className="flex-1 relative"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                
                {/* 快门闪烁效果 */}
                {showFlash && (
                  <div className="absolute inset-0 bg-white animate-pulse z-30 pointer-events-none" />
                )}
                
                {/* 缩放指示器 */}
                {zoomLevel > 1 && (
                  <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none z-10">
                    <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                      <p className="text-white text-xs font-bold">{zoomLevel.toFixed(1)}x</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 底部控制栏 */}
              <div className="absolute bottom-24 left-0 right-0 pb-6 z-20">
                <div className="flex items-center justify-center px-8">
                  <div className="flex-1"></div>
                  
                  {/* 中间拍照按钮 */}
                  <button 
                    onClick={handleCaptureClick}
                    className="relative w-20 h-20 flex items-center justify-center group"
                  >
                    {/* 外圈 - 脉动效果 */}
                    <div className="absolute inset-0 rounded-full border-4 border-white/30 group-active:scale-95 transition-transform"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-ping"></div>
                    
                    {/* 内圈 - 主按钮 */}
                    <div className="relative w-16 h-16 bg-white rounded-full shadow-glow-lg group-active:scale-90 transition-all duration-150 flex items-center justify-center">
                      <div className="w-14 h-14 bg-gradient-to-br from-accent via-accent to-accent/80 rounded-full shadow-inner"></div>
                    </div>
                  </button>
                  
                  <div className="flex-1"></div>
                </div>
              </div>
              
              {/* 关闭按钮 */}
              <button 
                onClick={stopCamera} 
                className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all active:scale-90 z-20"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>
          )}

          {capturedImages.length > 0 || uploadedFiles.length > 0 ? (
            <div className="mb-6 space-y-3">
              {/* 拍摄成功提示 */}
              {newImageIndex !== null && (
                <div className="flex items-center justify-center gap-2 py-2 animate-in fade-in zoom-in duration-300">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <span className="text-sm font-bold text-accent">{lang === 'zh' ? '拍摄成功！' : 'Got it!'}</span>
                  <span className="text-2xl animate-bounce" style={{animationDelay: '0.1s'}}>✨</span>
                </div>
              )}
              
              {/* 图片预览网格 */}
              {capturedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {capturedImages.map((img, index) => (
                    <div 
                      key={index} 
                      className={`relative aspect-square rounded-2xl overflow-hidden bg-mint-50 border-2 group transition-all duration-300 hover:scale-105 hover:-rotate-1 hover:shadow-lg ${
                        index === newImageIndex 
                          ? 'border-accent shadow-glow animate-in zoom-in-50 duration-500' 
                          : 'border-mint-200 hover:border-accent/50'
                      }`}
                      style={{ animationDelay: index === newImageIndex ? '0ms' : `${index * 50}ms` }}
                    >
                      <img src={img} alt={`Captured ${index + 1}`} className="w-full h-full object-cover" />
                      
                      {/* 新图片标记 */}
                      {index === newImageIndex && (
                        <div className="absolute top-1 left-1 px-2 py-0.5 bg-accent text-white text-[10px] font-bold rounded-full animate-pulse">
                          NEW
                        </div>
                      )}
                      
                      {/* 删除按钮 */}
                      {!loading && (
                        <button 
                          onClick={() => removeImage(index)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all active:scale-90 hover:bg-red-500"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      )}
                      
                      {/* 序号 */}
                      <div className="absolute bottom-1 right-1 w-5 h-5 bg-black/40 text-white text-[10px] font-bold rounded-full flex items-center justify-center backdrop-blur-sm">
                        {index + 1}
                      </div>
                    </div>
                  ))}
                  
                  {/* 添加更多按钮 */}
                  {!loading && (
                    <>
                      <button 
                        onClick={startCamera}
                        className="aspect-square rounded-2xl border-2 border-dashed border-mint-200/80 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-1 text-moss-pale hover:text-accent transition-all hover:scale-105 hover:rotate-1 active:scale-95"
                      >
                        <span className="material-symbols-outlined text-2xl">photo_camera</span>
                        <span className="text-[10px] font-bold">{lang === 'zh' ? '继续拍' : 'More'}</span>
                      </button>
                      <label className="aspect-square rounded-2xl border-2 border-dashed border-mint-200/80 hover:border-accent hover:bg-accent/5 flex flex-col items-center justify-center gap-1 text-moss-pale hover:text-accent transition-all cursor-pointer hover:scale-105 hover:-rotate-1 active:scale-95">
                        <input type="file" accept="image/*,application/pdf" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        <span className="text-[10px] font-bold">{lang === 'zh' ? '上传' : 'Upload'}</span>
                      </label>
                    </>
                  )}
                </div>
              )}
              
              {/* PDF 文件列表 */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-mint-50 to-mint-100/50 rounded-2xl border border-mint-200">
                      <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="material-symbols-outlined text-xl text-accent">description</span>
                      </div>
                      <span className="flex-1 text-sm font-bold text-moss truncate">{file.name}</span>
                      {!loading && (
                        <button onClick={() => removeFile(index)} className="w-8 h-8 text-moss-pale hover:text-moss rounded-full flex items-center justify-center transition-colors">
                          <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {loading && (
                <div className="flex items-center justify-center gap-3 py-4 text-moss-pale">
                  <div className="w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold uppercase tracking-wider">{t.generator.generating}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4 mb-6">
              <button 
                onClick={startCamera}
                className="group flex-1 h-40 bg-gradient-to-br from-accent via-accent to-accent/90 rounded-[28px] flex flex-col items-center justify-center gap-3 text-white shadow-glow hover:shadow-glow-lg hover:-translate-y-1 active:scale-[0.97] active:translate-y-0 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300"></div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <div className="relative z-10 text-center">
                  <span className="text-sm font-bold block">{t.generator.camera}</span>
                  <span className="text-[10px] text-white/60 tracking-wide">拍摄书籍文章</span>
                </div>
              </button>
              <label className="group flex-1 h-40 bg-gradient-to-br from-mint-50 via-white to-mint-100/50 border-2 border-dashed border-mint-200/80 hover:border-accent/40 rounded-[28px] flex flex-col items-center justify-center gap-3 text-moss-pale hover:text-accent hover:-translate-y-1 active:scale-[0.97] active:translate-y-0 transition-all duration-300 cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-colors duration-300"></div>
                <input 
                  type="file" 
                  accept="image/*,application/pdf" 
                  multiple
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files);
                    }
                  }} 
                />
                <div className="w-16 h-16 bg-gradient-to-br from-mint-100 to-mint-50 rounded-2xl flex items-center justify-center relative z-10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 border border-mint-200/60">
                  <span className="material-symbols-outlined text-3xl text-moss-pale group-hover:text-accent transition-colors">upload_file</span>
                </div>
                <div className="relative z-10 text-center">
                  <span className="text-sm font-bold block group-hover:text-accent transition-colors">{t.generator.upload}</span>
                  <span className="text-[10px] text-moss-pale/60 tracking-wide">图片/PDF</span>
                </div>
              </label>
            </div>
          )}

          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-moss">{t.generator.label}</h2>
            <button 
              onClick={() => setShowSamples(!showSamples)}
              className={`flex items-center gap-1.5 text-[11px] font-bold transition-all duration-300 px-3 py-1.5 rounded-full ${showSamples ? 'bg-accent/10 text-accent' : 'text-accent/70 hover:text-accent hover:bg-accent/5'}`}
            >
              <span className={`material-symbols-outlined text-base transition-transform duration-300 ${showSamples ? 'rotate-180' : ''}`}>auto_awesome</span>
              <span>{t.generator.samples}</span>
            </button>
          </div>

          {/* 示例列表 */}
          {showSamples && (
            <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <button 
                onClick={() => { setContent(t.generator.sample1); setShowSamples(false); }}
                className="w-full text-left p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-50 rounded-2xl border border-emerald-200/60 text-sm text-moss transition-all active:scale-[0.98] group flex items-center gap-3"
                style={{ animationDelay: '0ms' }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-200 to-emerald-300 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-lg">biotech</span>
                </div>
                <div>
                  <span className="font-bold block">{lang === 'zh' ? '生物学：线粒体' : 'Biology: Mitochondria'}</span>
                  <span className="text-xs text-moss-pale">{lang === 'zh' ? '细胞的动力工厂' : 'Cell powerhouse'}</span>
                </div>
              </button>
              <button 
                onClick={() => { setContent(t.generator.sample2); setShowSamples(false); }}
                className="w-full text-left p-4 bg-gradient-to-r from-violet-50 to-violet-100/50 hover:from-violet-100 hover:to-violet-50 rounded-2xl border border-violet-200/60 text-sm text-moss transition-all active:scale-[0.98] group flex items-center gap-3"
                style={{ animationDelay: '50ms' }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-violet-200 to-violet-300 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-lg">code</span>
                </div>
                <div>
                  <span className="font-bold block">{lang === 'zh' ? '编程：Python 装饰器' : 'Programming: Python Decorators'}</span>
                  <span className="text-xs text-moss-pale">{lang === 'zh' ? '设计模式精髓' : 'Design pattern essentials'}</span>
                </div>
              </button>
              <button 
                onClick={() => { setContent(t.generator.sample3); setShowSamples(false); }}
                className="w-full text-left p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-50 rounded-2xl border border-amber-200/60 text-sm text-moss transition-all active:scale-[0.98] group flex items-center gap-3"
                style={{ animationDelay: '100ms' }}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-amber-200 to-amber-300 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-white text-lg">sailing</span>
                </div>
                <div>
                  <span className="font-bold block">{lang === 'zh' ? '历史：大航海时代' : 'History: Age of Discovery'}</span>
                  <span className="text-xs text-moss-pale">{lang === 'zh' ? '探索世界的开端' : 'World exploration begins'}</span>
                </div>
              </button>
            </div>
          )}

          <div className="relative mb-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.generator.placeholder}
              className="w-full bg-white/80 border border-mint-100 rounded-3xl p-6 text-base text-moss placeholder:text-moss-pale/40 min-h-[140px] focus:ring-4 focus:ring-accent/10 focus:border-accent/30 focus:bg-white transition-all resize-none shadow-subtle"
            />
            {content && (
              <div className="absolute bottom-4 right-4 text-[10px] text-moss-pale font-bold">
                {content.length} {lang === 'zh' ? '字' : 'chars'}
              </div>
            )}
          </div>

          {/* Settings Group */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 bg-gradient-to-br from-mint-50/80 to-mint-100/40 px-5 py-4 rounded-2xl border border-mint-200/50 flex items-center justify-between shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-moss-pale group-hover:text-accent transition-colors">format_list_numbered</span>
                <span className="text-xs font-bold text-moss uppercase tracking-wider">{t.generator.max}</span>
              </div>
              <select value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="bg-transparent border-none text-lg font-extrabold text-accent p-0 pr-6 focus:ring-0 cursor-pointer -mr-3">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="flex-1 bg-gradient-to-br from-rose-50/80 to-rose-100/40 px-5 py-4 rounded-2xl border border-rose-200/50 flex items-center justify-between shadow-subtle hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-moss-pale group-hover:text-accent transition-colors">translate</span>
                <span className="text-xs font-bold text-moss uppercase tracking-wider">{t.generator.langLabel}</span>
              </div>
              <select value={genLanguage} onChange={e => setGenLanguage(e.target.value)} className="bg-transparent border-none text-lg font-extrabold text-accent p-0 pr-6 focus:ring-0 cursor-pointer -mr-3">
                <option value="Chinese">中</option>
                <option value="English">EN</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleCreate}
            disabled={loading || (!content.trim() && capturedImages.length === 0)}
            className="w-full py-5 bg-gradient-to-r from-moss via-moss to-moss/90 text-white rounded-3xl font-bold flex items-center justify-center gap-3 shadow-card hover:shadow-glow hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transition-all duration-300 disabled:opacity-40 disabled:grayscale disabled:cursor-not-allowed disabled:hover:translate-y-0 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute top-0 left-1/4 w-1 h-full bg-white/10 blur-sm"></div>
              <div className="absolute top-0 right-1/3 w-1 h-full bg-white/10 blur-sm"></div>
            </div>
            {loading ? (
               <div className="flex items-center gap-3 relative z-10">
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 <span className="text-sm tracking-widest uppercase">{t.generator.generating}</span>
               </div>
            ) : (
              <div className="flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-xl group-hover:rotate-12 transition-transform">auto_awesome</span>
                <span className="text-sm tracking-[0.15em] font-extrabold uppercase">{t.generator.generate}</span>
              </div>
            )}
          </button>
          
          {error && <p className="mt-4 text-center text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
        </div>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default Generator;
