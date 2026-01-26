
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

  return (
    <div 
      onClick={onStudy}
      className="group bg-gradient-to-br from-white to-mint-50/30 rounded-[28px] border border-mint-100/60 p-6 shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all duration-500 flex flex-col h-full mb-4 cursor-pointer relative overflow-hidden"
    >
      {/* 背景装饰 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/5 to-transparent rounded-full blur-2xl -ml-12 -mb-12 group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-accent/10 to-accent/5 rounded-[18px] flex items-center justify-center text-accent shadow-subtle group-hover:shadow-glow transition-all duration-300 group-hover:scale-110">
            <span className="material-symbols-outlined text-2xl">{deck.icon}</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-lg font-bold text-moss truncate leading-tight mb-1 group-hover:text-accent transition-colors duration-300">{deck.title}</h3>
            <p className="text-[10px] font-bold text-moss-pale uppercase tracking-widest">{deck.category}</p>
          </div>
        </div>
        
        <p className="text-xs text-moss-light/70 line-clamp-2 mb-6 leading-relaxed">
          {deck.description}
        </p>
        
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-mint-100/50">
          <div className="flex items-center gap-4 text-[9px] font-bold text-moss-pale uppercase tracking-widest">
            <span className="flex items-center gap-1.5 bg-mint-50/80 px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-xs">style</span> {deck.cardCount}
            </span>
            <span className="flex items-center gap-1.5 bg-rose-50/80 px-2 py-1 rounded-lg">
              <span className="material-symbols-outlined text-xs">history</span> {deck.lastStudied}
            </span>
          </div>
          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckCard;
