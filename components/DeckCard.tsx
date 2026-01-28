
import React from 'react';
import { Deck } from '../types';
import { Language, translations } from '../i18n';

interface DeckCardProps {
  deck: Deck;
  lang: Language;
  onStudy: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, lang, onStudy }) => {
  const t = translations[lang];

  // 为不同卡组分配不同颜色
  const colorSchemes = [
    { bg: 'from-white to-rose-50/30', accent: 'from-rose-100 to-rose-200', icon: 'text-rose-500', badge: 'bg-rose-50/80', glow: 'from-rose-200/30' },
    { bg: 'from-white to-sky-50/30', accent: 'from-sky-100 to-sky-200', icon: 'text-sky-500', badge: 'bg-sky-50/80', glow: 'from-sky-200/30' },
    { bg: 'from-white to-violet-50/30', accent: 'from-violet-100 to-violet-200', icon: 'text-violet-500', badge: 'bg-violet-50/80', glow: 'from-violet-200/30' },
    { bg: 'from-white to-amber-50/30', accent: 'from-amber-100 to-amber-200', icon: 'text-amber-500', badge: 'bg-amber-50/80', glow: 'from-amber-200/30' },
    { bg: 'from-white to-mint-50/30', accent: 'from-emerald-100 to-emerald-200', icon: 'text-emerald-500', badge: 'bg-emerald-50/80', glow: 'from-emerald-200/30' },
  ];
  const colorIndex = deck.id.charCodeAt(0) % colorSchemes.length;
  const colors = colorSchemes[colorIndex];

  return (
    <div 
      onClick={onStudy}
      className={`group bg-gradient-to-br ${colors.bg} rounded-[28px] border border-white/60 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-1 active:scale-[0.98] transition-all duration-500 flex flex-col h-full cursor-pointer relative overflow-hidden`}
    >
      {/* 背景装饰 */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.glow} to-transparent rounded-full blur-3xl -mr-20 -mt-20 opacity-60 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700`}></div>
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-accent/5 to-transparent rounded-full blur-2xl -ml-14 -mb-14 group-hover:scale-150 transition-transform duration-700"></div>
      
      {/* 右上角装饰点 */}
      <div className="absolute top-4 right-4 flex gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-accent/40 group-hover:bg-accent group-hover:animate-ping transition-colors"></div>
        <div className="w-1.5 h-1.5 rounded-full bg-accent/20 group-hover:bg-accent/60 transition-colors"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className={`relative w-14 h-14 bg-gradient-to-br ${colors.accent} rounded-[18px] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
            <span className={`material-symbols-outlined text-2xl ${colors.icon}`}>{deck.icon}</span>
            {/* 图标光晕 */}
            <div className="absolute inset-0 rounded-[18px] bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-bold text-moss truncate leading-tight mb-1 group-hover:text-accent transition-colors duration-300">{deck.title}</h3>
            <p className="text-[10px] font-bold text-moss-pale uppercase tracking-widest flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-accent/60"></span>
              {deck.category}
            </p>
          </div>
        </div>
        
        <p className="text-xs text-moss-light/70 line-clamp-2 mb-6 leading-relaxed group-hover:text-moss-light transition-colors">
          {deck.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-mint-100/50">
          <div className="flex items-center gap-3 text-[9px] font-bold text-moss-pale uppercase tracking-widest">
            <span className={`flex items-center gap-1.5 ${colors.badge} px-2.5 py-1.5 rounded-xl border border-white/60 shadow-sm`}>
              <span className="material-symbols-outlined text-xs">style</span> {deck.cardCount}
            </span>
            <span className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1.5 rounded-xl border border-mint-100/60 shadow-sm">
              <span className="material-symbols-outlined text-xs">history</span> {deck.lastStudied}
            </span>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-accent group-hover:to-accent/80 group-hover:shadow-lg transition-all duration-300">
            <span className="material-symbols-outlined text-sm text-accent group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckCard;
