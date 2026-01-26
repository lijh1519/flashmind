
import React, { useState } from 'react';
import { Deck, Card } from '../types';
import { Language, translations } from '../i18n';

interface StudyViewProps {
  deck: Deck;
  lang: Language;
  onExit: () => void;
}

const StudyView: React.FC<StudyViewProps> = ({ deck, lang, onExit }) => {
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const studyCards: Card[] = deck.cards.length > 0 ? deck.cards : [
    { id: '1', front: lang === 'zh' ? '概念：内分泌系统' : 'Concept: Endocrine System', back: lang === 'zh' ? '由直接向循环系统释放激素的反馈回路组成的信使系统。' : 'A messenger system comprising feedback loops of hormones released directly into the circulatory system.' }
  ];

  const currentCard = studyCards[currentIndex];
  const progress = ((currentIndex + (isFinished ? 1 : 0)) / studyCards.length) * 100;

  const handleNext = () => {
    if (currentIndex === studyCards.length - 1) {
      setIsFinished(true);
      return;
    }
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1));
    }, 250);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1));
    }, 250);
  };

  if (isFinished) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-mint-50 via-white to-rose-50/30 z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl -mr-48 -mt-48 animate-pulse-soft"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl -ml-40 -mb-40 animate-pulse-soft" style={{animationDelay: '1.5s'}}></div>
        
        <div className="relative z-10">
          <div className="w-28 h-28 bg-gradient-to-br from-accent/15 to-accent/5 rounded-[32px] flex items-center justify-center text-accent mb-8 shadow-glow-lg animate-float">
            <span className="material-symbols-outlined text-6xl">auto_awesome</span>
          </div>
          <h2 className="text-4xl font-bold text-moss mb-4 animate-in slide-in-from-bottom-4 duration-700">
            {lang === 'zh' ? '太棒了！' : 'Excellent!'}
          </h2>
          <p className="text-moss-light font-medium mb-12 max-w-xs mx-auto leading-relaxed animate-in slide-in-from-bottom-4 duration-700" style={{animationDelay: '100ms'}}>
            {lang === 'zh' ? `你已经完成了 ${deck.title} 的全部学习。` : `You've completed all cards in ${deck.title}.`}
          </p>
          <button 
            onClick={onExit}
            className="w-full max-w-xs py-5 bg-gradient-to-r from-moss via-moss to-moss/90 text-white rounded-[28px] font-bold shadow-card hover:shadow-glow active:scale-95 transition-all duration-300 animate-in slide-in-from-bottom-4" style={{animationDelay: '200ms'}}
          >
            {lang === 'zh' ? '返回馆藏' : 'Back to Library'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#FBFDFB] z-[100] flex flex-col safe-area-inset animate-in slide-in-from-right duration-500">
      {/* Top Navigation */}
      <div className="p-6 flex items-center justify-between">
        <button onClick={onExit} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-mint-100 text-moss-pale active:scale-90 transition-transform shadow-subtle">
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex-1 px-8">
           <div className="h-2 w-full bg-mint-100 rounded-full overflow-hidden">
             <div 
               className="h-full bg-accent shadow-glow transition-all duration-700 ease-out" 
               style={{ width: `${progress}%` }} 
             />
           </div>
        </div>
        <div className="text-[11px] font-extrabold text-moss-pale tracking-widest bg-white px-3 py-1.5 rounded-full border border-mint-100 shadow-subtle">
          {currentIndex + 1} / {studyCards.length}
        </div>
      </div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col px-6 py-4 justify-center">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="relative w-full aspect-[1/1.3] perspective-1000 max-h-[520px]"
        >
          <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
            {/* Front */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-mint-50/40 rounded-[40px] border-2 border-mint-200/60 shadow-card-hover backface-hidden p-12 flex flex-col items-center justify-center text-center overflow-hidden">
              {/* 装饰元素 */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/8 to-transparent rounded-full blur-3xl -mr-20 -mt-20 animate-pulse-soft"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl -ml-16 -mb-16 animate-pulse-soft" style={{animationDelay: '1.5s'}}></div>
              
              <div className="relative z-10 w-full">
                <div className="inline-block px-4 py-1.5 bg-accent/5 border border-accent/10 rounded-full mb-8">
                  <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">{t.study.question}</span>
                </div>
                <div className="flex-1 flex items-center justify-center mb-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-moss leading-snug px-4">{currentCard.front}</h3>
                </div>
                <div className="mt-auto text-[10px] font-bold text-moss-pale uppercase tracking-widest flex items-center gap-2 bg-gradient-to-r from-mint-100/60 to-mint-50/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-mint-200/40 shadow-subtle mx-auto inline-flex">
                  <span className="material-symbols-outlined text-base animate-pulse">touch_app</span>
                  {t.study.tapReveal}
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-accent/90 rounded-[40px] shadow-glow-lg rotate-y-180 backface-hidden p-12 flex flex-col items-center justify-center text-center text-white overflow-hidden">
              {/* 装饰元素 */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mt-24 animate-float"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mb-20 animate-float" style={{animationDelay: '3s'}}></div>
              <div className="absolute top-1/2 right-0 w-2 h-32 bg-white/5 blur-xl -mr-1"></div>
              
              <div className="relative z-10 w-full">
                <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full mb-8">
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.4em]">{t.study.answer}</span>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-y-auto w-full px-2 mb-8 max-h-[300px]">
                  <div className="serif-text italic text-2xl md:text-3xl leading-relaxed text-white/95">{currentCard.back}</div>
                </div>
                <div className="mt-auto text-[10px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 border border-white/30 backdrop-blur-md px-5 py-2.5 rounded-full bg-white/5 shadow-subtle mx-auto inline-flex">
                  <span className="material-symbols-outlined text-base">flip</span>
                  {t.study.tapFlip}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="p-8 pb-14 grid grid-cols-2 gap-4">
         <button 
           onClick={handlePrev} 
           disabled={currentIndex === 0}
           className="h-20 rounded-[28px] bg-gradient-to-br from-white to-mint-50/50 border border-mint-200/60 text-moss-light hover:text-moss font-bold text-sm hover:shadow-card active:scale-[0.97] transition-all duration-300 flex flex-col items-center justify-center gap-1.5 shadow-subtle disabled:opacity-30 disabled:cursor-not-allowed"
         >
           <span className="material-symbols-outlined text-xl">arrow_back</span>
           <span className="text-xs">{t.study.review}</span>
         </button>
         <button 
           onClick={handleNext} 
           className="h-20 rounded-[28px] bg-gradient-to-r from-moss via-moss to-moss/90 shadow-card hover:shadow-glow text-white font-bold text-sm active:scale-[0.97] transition-all duration-300 flex flex-col items-center justify-center gap-1.5 relative overflow-hidden group"
         >
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
           <span className="material-symbols-outlined text-xl relative z-10">check</span>
           <span className="text-xs relative z-10">{t.study.gotIt}</span>
         </button>
      </div>
    </div>
  );
};

export default StudyView;
