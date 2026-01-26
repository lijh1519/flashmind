
import React from 'react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const links = [
    { id: 'library', label: 'My Library', icon: 'dashboard' },
    { id: 'generate', label: 'AI Generator', icon: 'auto_awesome' },
    { id: 'collections', label: 'Collections', icon: 'folder' },
    { id: 'history', label: 'Recent Study', icon: 'history' },
    { id: 'stats', label: 'Statistics', icon: 'analytics' },
  ];

  return (
    <aside className="w-64 bg-mint-100 border-r border-mint-200/50 h-full flex flex-col shrink-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => setView('library')}>
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white shadow-glow">
            <span className="material-symbols-outlined text-xl">psychology</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-moss">FlashMind.ai</span>
        </div>
        
        <nav className="space-y-1 -mx-6">
          {links.map((link) => (
            <button
              key={link.id}
              onClick={() => setView(link.id as AppView)}
              className={`w-full flex items-center gap-3 px-6 py-3.5 transition-all duration-300 ${
                currentView === link.id
                  ? 'bg-primary/5 text-moss border-r-2 border-primary/40'
                  : 'text-moss-pale hover:text-moss hover:bg-white/40'
              }`}
            >
              <span className={`material-symbols-outlined ${currentView === link.id ? 'text-primary' : ''}`}>
                {link.icon}
              </span>
              <span className="font-semibold text-sm tracking-tight">{link.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6">
        <div className="bg-white/40 rounded-2xl p-4 mb-6 border border-mint-200">
          <p className="text-[10px] font-bold text-moss-light uppercase tracking-widest mb-2">Usage</p>
          <div className="h-1.5 w-full bg-mint-200 rounded-full mb-2">
            <div className="h-full bg-primary rounded-full w-3/4 shadow-glow"></div>
          </div>
          <p className="text-[11px] text-moss-pale font-medium">750 / 1000 Cards generated</p>
        </div>
        
        <button className="flex items-center gap-3 px-2 text-moss-pale hover:text-moss transition-colors text-sm font-semibold">
          <span className="material-symbols-outlined text-xl">settings</span>
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
