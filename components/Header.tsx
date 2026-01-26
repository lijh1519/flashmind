
import React from 'react';
import { AppView } from '../types';
import { Language, translations } from '../i18n';

interface HeaderProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  lang: Language;
  setLang: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, lang, setLang }) => {
  const t = translations[lang];

  return (
    <nav className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={() => setView('generate')}
      >
        <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white shadow-glow group-hover:scale-105 transition-transform duration-300">
          <span className="material-symbols-outlined text-2xl">psychology</span>
        </div>
        <span className="text-2xl font-bold tracking-tight text-moss group-hover:text-accent transition-colors">FlashMind.ai</span>
      </div>
      
      <div className="flex items-center gap-8">
        <button 
          onClick={() => setView('library')}
          className={`flex items-center gap-2 text-sm font-bold tracking-tight transition-all ${
            currentView === 'library' ? 'text-accent' : 'text-moss-pale hover:text-moss'
          }`}
        >
          <span className="material-symbols-outlined">menu_book</span>
          {t.nav.library}
        </button>

        <div className="flex items-center bg-mint-50 p-1 rounded-xl border border-mint-100">
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-white text-accent shadow-subtle' : 'text-moss-pale hover:text-moss'}`}
          >
            EN
          </button>
          <button 
            onClick={() => setLang('zh')}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${lang === 'zh' ? 'bg-white text-accent shadow-subtle' : 'text-moss-pale hover:text-moss'}`}
          >
            中
          </button>
        </div>
        
        <div className="flex items-center gap-4 pl-8 border-l border-mint-200">
          <div className="w-10 h-10 rounded-full bg-mint-100 flex items-center justify-center text-accent font-bold text-sm shadow-subtle border border-white">
            {lang === 'zh' ? '用户' : 'JD'}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
