
import React, { useState } from 'react';
import Library from './components/Library';
import Generator from './components/Generator';
import StudyView from './components/StudyView';
import { AppView, Deck } from './types';
import { Language, translations } from './i18n';

const INITIAL_DECKS: Deck[] = [];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('generate');
  const [lang, setLang] = useState<Language>('zh'); // 默认中文
  const [decks, setDecks] = useState<Deck[]>(INITIAL_DECKS);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);

  const t = translations[lang];

  const handleStudyDeck = (deck: Deck) => {
    setActiveDeck(deck);
    setView('study');
  };

  const handleAddDeck = (newDeck: Deck) => {
    setDecks(prev => [newDeck, ...prev]);
    setView('library');
  };

  const renderContent = () => {
    switch (view) {
      case 'library':
        return (
          <div className="pb-32 pt-10 px-4">
            <div className="max-w-md mx-auto mb-8">
              <h2 className="text-3xl font-bold text-moss tracking-tight">{t.library.title}</h2>
              <p className="text-moss-pale font-medium text-sm">{t.library.subtitle}</p>
            </div>
            <Library decks={decks} lang={lang} onStudy={handleStudyDeck} onNavigateToGenerate={() => setView('generate')} />
          </div>
        );
      case 'generate':
        return <Generator lang={lang} onDeckCreated={handleAddDeck} />;
      case 'study':
        return activeDeck ? (
          <StudyView deck={activeDeck} lang={lang} onExit={() => setView('library')} />
        ) : (
          <Generator lang={lang} onDeckCreated={handleAddDeck} />
        );
      default:
        return <Generator lang={lang} onDeckCreated={handleAddDeck} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-moss">
      <main className="relative pb-24">
        {renderContent()}
      </main>

      {/* 移动端底部导航栏 */}
      {view !== 'study' && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4 bg-gradient-to-t from-white via-white/95 to-white/80 backdrop-blur-2xl border-t border-mint-100/40 flex items-center justify-around">
          {/* 导航栏背景装饰 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -bottom-4 left-1/4 w-32 h-32 bg-accent/5 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-4 right-1/4 w-24 h-24 bg-violet-200/20 rounded-full blur-2xl"></div>
          </div>
          
          <button 
            onClick={() => setView('generate')}
            className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'generate' ? 'text-accent' : 'text-moss-pale hover:text-moss active:scale-95'}`}
          >
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              view === 'generate' 
                ? 'bg-gradient-to-br from-accent to-accent/80 shadow-[0_4px_20px_rgba(16,185,129,0.4)] scale-110' 
                : 'bg-mint-50/80 hover:bg-mint-100'
            }`}>
              <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${view === 'generate' ? 'text-white' : ''}`}>add_circle</span>
              {view === 'generate' && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-75"></div>
                </>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter transition-all ${view === 'generate' ? 'text-accent' : ''}`}>{t.nav.generate}</span>
          </button>

          <button 
            onClick={() => setView('library')}
            className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'library' ? 'text-accent' : 'text-moss-pale hover:text-moss active:scale-95'}`}
          >
            <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              view === 'library' 
                ? 'bg-gradient-to-br from-accent to-accent/80 shadow-[0_4px_20px_rgba(16,185,129,0.4)] scale-110' 
                : 'bg-mint-50/80 hover:bg-mint-100'
            }`}>
              <span className={`material-symbols-outlined text-2xl transition-all duration-300 ${view === 'library' ? 'text-white' : ''}`}>style</span>
              {view === 'library' && (
                <>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-75"></div>
                </>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-tighter transition-all ${view === 'library' ? 'text-accent' : ''}`}>{t.nav.library}</span>
          </button>
        </div>
      )}

      {/* 全局背景装饰 */}
      <div className="fixed top-0 left-0 w-full h-40 bg-gradient-to-b from-white via-white/80 to-transparent pointer-events-none z-10"></div>
      <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-to-bl from-accent/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed top-20 left-0 w-48 h-48 bg-gradient-to-br from-violet-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default App;
