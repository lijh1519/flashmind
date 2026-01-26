
import React, { useState } from 'react';
import Library from './components/Library';
import Generator from './components/Generator';
import StudyView from './components/StudyView';
import { AppView, Deck } from './types';
import { Language, translations } from './i18n';

const INITIAL_DECKS: Deck[] = [
  {
    id: '1',
    title: 'Startup Metrics 101',
    description: 'Fundamental KPIs for SaaS entrepreneurs: LTV, CAC, Churn, and Burn Rate dynamics.',
    icon: 'trending_up',
    category: 'Startups',
    cards: [],
    lastStudied: '5m ago',
    cardCount: 42,
  },
];

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
        <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4 bg-white/90 backdrop-blur-2xl border-t border-mint-100/60 flex items-center justify-around shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
          <button 
            onClick={() => setView('generate')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'generate' ? 'text-accent scale-110' : 'text-moss-pale hover:text-moss'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              view === 'generate' 
                ? 'bg-gradient-to-br from-accent/10 to-accent/5 shadow-glow' 
                : 'bg-transparent hover:bg-mint-50'
            }`}>
              <span className="material-symbols-outlined text-2xl font-variation-fill">add_circle</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{t.nav.generate}</span>
          </button>
          
          <button 
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="w-14 h-14 bg-gradient-to-br from-mint-50 to-mint-100/60 rounded-[18px] flex items-center justify-center border border-mint-200/60 text-accent font-bold text-xs shadow-subtle hover:shadow-card active:scale-90 transition-all duration-300"
          >
            {lang === 'zh' ? 'EN' : '中'}
          </button>

          <button 
            onClick={() => setView('library')}
            className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${view === 'library' ? 'text-accent scale-110' : 'text-moss-pale hover:text-moss'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
              view === 'library' 
                ? 'bg-gradient-to-br from-accent/10 to-accent/5 shadow-glow' 
                : 'bg-transparent hover:bg-mint-50'
            }`}>
              <span className="material-symbols-outlined text-2xl font-variation-fill">style</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tighter">{t.nav.library}</span>
          </button>
        </div>
      )}

      {/* 全局背景装饰 */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"></div>
    </div>
  );
};

export default App;
