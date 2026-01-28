
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);

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
        return <Generator lang={lang} onDeckCreated={handleAddDeck} onCameraStateChange={setIsCameraOpen} />;
      case 'study':
        return activeDeck ? (
          <StudyView deck={activeDeck} lang={lang} onExit={() => setView('library')} />
        ) : (
          <Generator lang={lang} onDeckCreated={handleAddDeck} onCameraStateChange={setIsCameraOpen} />
        );
      default:
        return <Generator lang={lang} onDeckCreated={handleAddDeck} onCameraStateChange={setIsCameraOpen} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-moss">
      <main className="relative pb-24">
        {renderContent()}
      </main>

      {/* 移动端底部导航栏 */}
      {view !== 'study' && !isCameraOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4 bg-white border-t border-gray-100 flex items-center justify-around">
          <button 
            onClick={() => setView('generate')}
            className={`relative flex flex-col items-center gap-1.5 transition-all duration-200 ${view === 'generate' ? 'text-accent' : 'text-gray-400 hover:text-gray-600 active:scale-95'}`}
          >
            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              view === 'generate' 
                ? 'bg-accent text-white shadow-glow' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}>
              <span className={`material-symbols-outlined text-xl ${view === 'generate' ? 'text-white' : 'text-gray-500'}`}>add_circle</span>
            </div>
            <span className={`text-[10px] font-semibold ${view === 'generate' ? 'text-accent' : 'text-gray-500'}`}>{t.nav.generate}</span>
          </button>

          <button 
            onClick={() => setView('library')}
            className={`relative flex flex-col items-center gap-1.5 transition-all duration-200 ${view === 'library' ? 'text-accent' : 'text-gray-400 hover:text-gray-600 active:scale-95'}`}
          >
            <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              view === 'library' 
                ? 'bg-accent text-white shadow-glow' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}>
              <span className={`material-symbols-outlined text-xl ${view === 'library' ? 'text-white' : 'text-gray-500'}`}>style</span>
            </div>
            <span className={`text-[10px] font-semibold ${view === 'library' ? 'text-accent' : 'text-gray-500'}`}>{t.nav.library}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
