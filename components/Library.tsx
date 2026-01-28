
import React from 'react';
import { Deck } from '../types';
import DeckCard from './DeckCard';
import { Language, translations } from '../i18n';

interface LibraryProps {
  decks: Deck[];
  lang: Language;
  onStudy: (deck: Deck) => void;
  onNavigateToGenerate: () => void;
}

const Library: React.FC<LibraryProps> = ({ decks, lang, onStudy, onNavigateToGenerate }) => {
  const t = translations[lang];

  return (
    <div className="max-w-md mx-auto px-4">
      {decks.length === 0 ? (
        /* 空状态 */
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-gray-400">library_books</span>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{lang === 'zh' ? '还没有卡片' : 'No cards yet'}</h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            {lang === 'zh' ? '创建你的第一套学习卡片' : 'Create your first deck'}
          </p>
          
          <button 
            onClick={onNavigateToGenerate}
            className="px-6 py-3 bg-accent text-white rounded-xl font-semibold shadow-glow hover:shadow-glow-lg active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            {t.library.newDeck}
          </button>
        </div>
      ) : (
        /* 卡片列表 */
        <div className="space-y-3">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} lang={lang} onStudy={() => onStudy(deck)} />
          ))}
          
          {/* 添加新卡组按钮 */}
          <button 
            onClick={onNavigateToGenerate}
            className="w-full bg-gray-50 hover:bg-accent/5 rounded-2xl border-2 border-dashed border-gray-200 hover:border-accent p-6 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-accent active:scale-[0.98] transition-all mb-10"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-200">
              <span className="material-symbols-outlined text-xl">add</span>
            </div>
            <span className="font-medium text-sm">{t.library.newDeck}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
