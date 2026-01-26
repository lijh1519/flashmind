
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-md mx-auto px-4">
      {decks.map((deck) => (
        <DeckCard key={deck.id} deck={deck} lang={lang} onStudy={() => onStudy(deck)} />
      ))}
      
      <button 
        onClick={onNavigateToGenerate}
        className="w-full bg-mint-50/50 rounded-[32px] border-2 border-dashed border-mint-200 p-8 flex flex-col items-center justify-center gap-3 text-moss-pale active:bg-white active:border-accent active:text-accent transition-all mb-10"
      >
        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-subtle">
          <span className="material-symbols-outlined text-2xl">add</span>
        </div>
        <span className="font-bold text-sm tracking-tight">{t.library.newDeck}</span>
      </button>
    </div>
  );
};

export default Library;
