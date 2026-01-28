
import React, { useState } from 'react';
import { Deck, Card } from '../types';
import { Language, translations } from '../i18n';
import { generateMoreCards } from '../services/geminiService';

type ViewMode = 'cards' | 'grid' | 'list';

interface StudyViewProps {
  deck: Deck;
  lang: Language;
  onExit: () => void;
}

const StudyView: React.FC<StudyViewProps> = ({ deck, lang, onExit }) => {
  const t = translations[lang];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [studyCards, setStudyCards] = useState<Card[]>(() => {
    return deck.cards.length > 0 ? deck.cards : [
      { id: '1', front: lang === 'zh' ? '概念：内分泌系统' : 'Concept: Endocrine System', back: lang === 'zh' ? '由直接向循环系统释放激素的反馈回路组成的信使系统。' : 'A messenger system comprising feedback loops of hormones released directly into the circulatory system.' }
    ];
  });

  const handleNext = () => {
    // 允许进入“添加新题”卡片（currentIndex === studyCards.length 时）
    if (currentIndex >= studyCards.length) {
      return;
    }
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 250);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1));
    }, 250);
  };

  const handleAddMoreCards = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const newCards = await generateMoreCards(
        deck.originalContent || deck.title,
        studyCards,
        lang === 'zh' ? '中文' : 'English',
        1,
        deck.difficulty || 'medium'
      );
      setStudyCards(prev => [...prev, ...newCards]);
      // 生成后自动跳转到新卡片
      setCurrentIndex(studyCards.length);
      setIsFlipped(false);
    } catch (error) {
      console.error('Failed to generate more cards:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 是否显示“添加新问题”卡片
  const isAddCardView = currentIndex >= studyCards.length;
  const currentCard = !isAddCardView ? studyCards[currentIndex] : null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-[100] flex flex-col safe-area-inset">
      <div className="p-4 flex items-center justify-between">
        <button onClick={onExit} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-gray-700 active:scale-90 transition-all">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-gray-200">
          <button onClick={() => setViewMode('cards')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'cards' ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:text-gray-700'}`}>
            <span className="material-symbols-outlined text-base">style</span>
          </button>
          <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'grid' ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:text-gray-700'}`}>
            <span className="material-symbols-outlined text-base">grid_view</span>
          </button>
          <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${viewMode === 'list' ? 'bg-accent/10 text-accent' : 'text-gray-500 hover:text-gray-700'}`}>
            <span className="material-symbols-outlined text-base">list</span>
          </button>
        </div>
        
        <div className="text-xs font-semibold text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200">
          {viewMode === 'cards' ? `${currentIndex + 1}/${studyCards.length}` : `${studyCards.length}`}
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="flex-1 flex flex-col px-4 py-4 justify-center">
          {isAddCardView ? (
            /* 添加新问题卡片 */
            <button 
              onClick={handleAddMoreCards}
              disabled={isGenerating}
              className="relative w-full aspect-[1/1.3] max-h-[480px] group"
            >
              <div className="absolute inset-0 bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-card flex flex-col items-center justify-center text-center hover:border-accent transition-all">
                <div className="flex flex-col items-center gap-4">
                  {isGenerating ? (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-3xl text-accent animate-spin">progress_activity</span>
                      </div>
                      <span className="text-base font-medium text-gray-500">{lang === 'zh' ? '生成中...' : 'Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                        <span className="material-symbols-outlined text-3xl text-gray-400 group-hover:text-accent transition-colors">add</span>
                      </div>
                      <div className="text-center">
                        <span className="text-base font-medium text-gray-500 group-hover:text-accent transition-colors">{lang === 'zh' ? '添加新问题' : 'Add New Question'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </button>
          ) : (
            /* 正常问题卡片 */
            <div onClick={() => setIsFlipped(!isFlipped)} className="relative w-full aspect-[1/1.3] perspective-1000 max-h-[480px]">
              <div className={`relative w-full h-full duration-500 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 bg-white rounded-3xl border border-gray-200 shadow-card [backface-visibility:hidden] p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-full">
                    <div className="inline-block px-3 py-1 bg-accent/10 rounded-full mb-6">
                      <span className="text-xs font-medium text-accent">{t.study.question}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center mb-6">
                      <h3 className="text-xl font-semibold text-gray-900 leading-relaxed">{currentCard?.front}</h3>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 justify-center">
                      <span className="material-symbols-outlined text-sm">touch_app</span>
                      {t.study.tapReveal}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-accent rounded-3xl shadow-glow rotate-y-180 [backface-visibility:hidden] p-8 flex flex-col items-center justify-center text-center text-white">
                  <div className="w-full">
                    <div className="inline-block px-3 py-1 bg-white/20 rounded-full mb-6">
                      <span className="text-xs font-medium text-white/90">{t.study.answer}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center mb-6 max-h-[280px] overflow-y-auto">
                      <div className="text-xl leading-relaxed text-white/95">{currentCard?.back}</div>
                    </div>
                    <div className="text-xs text-white/70 flex items-center gap-1.5 justify-center">
                      <span className="material-symbols-outlined text-sm">flip</span>
                      {t.study.tapFlip}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto pb-6">
            {studyCards.map((card, index) => (
              <div 
                key={card.id} 
                className="bg-white rounded-2xl p-4 border border-gray-200 shadow-subtle hover:shadow-card transition-all cursor-pointer"
                onClick={() => { setCurrentIndex(index); setViewMode('cards'); }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">{lang === 'zh' ? '问题' : 'Q'} {index + 1}</div>
                  <span className="material-symbols-outlined text-sm text-gray-400">open_in_full</span>
                </div>
                <div className="text-sm font-medium text-gray-900 mb-2 line-clamp-3">{card.front}</div>
                <div className="text-xs text-gray-500 line-clamp-2">{card.back}</div>
              </div>
            ))}
            
            {/* 添加新问题卡片 */}
            <button
              onClick={handleAddMoreCards}
              disabled={isGenerating}
              className="bg-white rounded-2xl p-4 border-2 border-dashed border-gray-200 hover:border-accent transition-all flex flex-col items-center justify-center gap-2 disabled:opacity-50 min-h-[120px]"
            >
              {isGenerating ? (
                <>
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-accent animate-spin">progress_activity</span>
                  </div>
                  <span className="text-xs text-gray-500">{lang === 'zh' ? '生成中...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl text-gray-400">add</span>
                  </div>
                  <span className="text-xs text-gray-500">{lang === 'zh' ? '添加新问题' : 'Add'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <div className="space-y-2 max-w-2xl mx-auto pb-6">
            {studyCards.map((card, index) => (
              <div 
                key={card.id} 
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <button onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)} className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-accent">{index + 1}</span>
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">{card.front}</div>
                  </div>
                  <span className={`material-symbols-outlined text-gray-400 text-lg transition-transform ${expandedCard === card.id ? 'rotate-180 text-accent' : ''}`}>expand_more</span>
                </button>
                <div className={`grid transition-all ${expandedCard === card.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <div className="px-3 pb-3 pt-2 bg-gray-50 border-t border-gray-100">
                      <div className="text-xs font-medium text-accent mb-1">{lang === 'zh' ? '答案' : 'Answer'}</div>
                      <div className="text-sm text-gray-600">{card.back}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 添加新问题 */}
            <button
              onClick={handleAddMoreCards}
              disabled={isGenerating}
              className="w-full bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-accent transition-all disabled:opacity-50"
            >
              <div className="p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {isGenerating ? (
                    <span className="material-symbols-outlined text-sm text-accent animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm text-gray-400">add</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm text-gray-500">
                    {isGenerating ? (lang === 'zh' ? '生成中...' : 'Generating...') : (lang === 'zh' ? '添加新问题' : 'Add New Question')}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="p-4 pb-8">
          {/* 轮播导航栏 */}
          <div className="flex items-center justify-center gap-3 bg-white rounded-full px-4 py-3 shadow-card border border-gray-100 max-w-xs mx-auto">
            {/* 左箭头 */}
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0} 
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            
            {/* 进度显示 */}
            <span className="text-sm font-medium text-gray-500 min-w-[40px] text-center">
              {isAddCardView ? '+' : `${currentIndex + 1}/${studyCards.length}`}
            </span>
            
            {/* 圆点指示器 */}
            <div className="flex items-center gap-1">
              {studyCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setIsFlipped(false); setCurrentIndex(index); }}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentIndex && !isAddCardView ? 'bg-accent scale-125' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
              
              {/* 添加新问题按钮 */}
              <button
                onClick={() => setCurrentIndex(studyCards.length)}
                className={`w-2 h-2 rounded-full border border-dashed transition-all ${isAddCardView ? 'border-accent bg-accent/20 scale-125' : 'border-gray-400 hover:border-accent'}`}
              />
            </div>
            
            {/* 右箭头 */}
            <button 
              onClick={handleNext}
              disabled={isAddCardView}
              className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent/90 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyView;
