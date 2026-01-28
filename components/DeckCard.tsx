
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
    { bg: 'bg-rose-50', icon: 'text-rose-500', iconBg: 'bg-rose-100' },
    { bg: 'bg-sky-50', icon: 'text-sky-500', iconBg: 'bg-sky-100' },
    { bg: 'bg-violet-50', icon: 'text-violet-500', iconBg: 'bg-violet-100' },
    { bg: 'bg-amber-50', icon: 'text-amber-500', iconBg: 'bg-amber-100' },
    { bg: 'bg-emerald-50', icon: 'text-emerald-500', iconBg: 'bg-emerald-100' },
  ];
  const colorIndex = deck.id.charCodeAt(0) % colorSchemes.length;
  const colors = colorSchemes[colorIndex];

  return (
    <div 
      onClick={onStudy}
      className="bg-white rounded-2xl border border-gray-200 p-4 shadow-card hover:shadow-card-hover active:scale-[0.98] transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 ${colors.iconBg} rounded-xl flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-xl ${colors.icon}`}>{deck.icon}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-base font-semibold text-gray-900 truncate">{deck.title}</h3>
          <p className="text-xs text-gray-500">{deck.category}</p>
        </div>
        <div className="w-8 h-8 bg-gray-100 hover:bg-accent hover:text-white rounded-lg flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{deck.description}</p>
      
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">style</span> {deck.cardCount}
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-xs">history</span> {deck.lastStudied}
        </span>
      </div>
    </div>
  );
};

export default DeckCard;
