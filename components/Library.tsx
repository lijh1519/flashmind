
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
    <div className="max-w-md mx-auto px-4 relative">
      {/* 页面背景装饰 */}
      <div className="absolute -top-20 right-0 w-40 h-40 bg-gradient-to-bl from-accent/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-40 -left-10 w-32 h-32 bg-gradient-to-br from-violet-200/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>
      
      {decks.length === 0 ? (
        /* 空状态 */
        <div className="flex flex-col items-center justify-center py-16 animate-in fade-in zoom-in-95 duration-700">
          <div className="relative mb-8">
            {/* 装饰光斑 */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-accent/20 to-transparent rounded-full blur-2xl animate-pulse"></div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-gradient-to-tl from-violet-200/30 to-transparent rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
            
            {/* 主图标 */}
            <div className="relative w-28 h-28 bg-gradient-to-br from-mint-50 to-white rounded-[32px] border-2 border-dashed border-mint-200 flex items-center justify-center shadow-xl">
              <div className="absolute inset-2 bg-gradient-to-br from-accent/5 to-transparent rounded-[24px]"></div>
              <span className="material-symbols-outlined text-5xl text-accent/60">library_books</span>
            </div>
            
            {/* 浮动小卡片 */}
            <div className="absolute -top-2 -right-6 w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-50 rounded-xl shadow-lg rotate-12 animate-float" style={{animationDelay: '0s'}}>
              <span className="material-symbols-outlined text-rose-400 text-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">lightbulb</span>
            </div>
            <div className="absolute -bottom-3 -left-4 w-8 h-8 bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg shadow-md -rotate-12 animate-float" style={{animationDelay: '0.5s'}}>
              <span className="material-symbols-outlined text-amber-400 text-sm absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">star</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-moss mb-2">{lang === 'zh' ? '还没有卡片' : 'No cards yet'}</h3>
          <p className="text-sm text-moss-pale text-center mb-8 max-w-[200px]">
            {lang === 'zh' ? '拍照或上传图片\n创建你的第一套学习卡片' : 'Take a photo or upload\nto create your first deck'}
          </p>
          
          <button 
            onClick={onNavigateToGenerate}
            className="group relative px-8 py-4 bg-gradient-to-r from-accent to-accent/90 text-white rounded-2xl font-bold shadow-[0_4px_20px_rgba(16,185,129,0.4)] hover:shadow-[0_6px_28px_rgba(16,185,129,0.5)] active:scale-95 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
              {t.library.newDeck}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
        </div>
      ) : (
        /* 卡片列表 */
        <div className="space-y-4">
          {decks.map((deck, index) => (
            <div 
              key={deck.id} 
              className="animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms`, animationDuration: '500ms', animationFillMode: 'both' }}
            >
              <DeckCard deck={deck} lang={lang} onStudy={() => onStudy(deck)} />
            </div>
          ))}
          
          {/* 添加新卡组按钮 */}
          <button 
            onClick={onNavigateToGenerate}
            className="group w-full bg-gradient-to-br from-mint-50/80 to-white rounded-[28px] border-2 border-dashed border-mint-200/80 p-8 flex flex-col items-center justify-center gap-3 text-moss-pale hover:border-accent/60 hover:bg-accent/5 active:scale-[0.98] transition-all duration-300 mb-10"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white to-mint-50 flex items-center justify-center shadow-lg border border-mint-100/60 group-hover:scale-110 group-hover:shadow-xl group-hover:border-accent/30 transition-all duration-300">
              <span className="material-symbols-outlined text-2xl text-moss-pale group-hover:text-accent group-hover:rotate-90 transition-all duration-300">add</span>
            </div>
            <span className="font-bold text-sm tracking-tight group-hover:text-accent transition-colors">{t.library.newDeck}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Library;
