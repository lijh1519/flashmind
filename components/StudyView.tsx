
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
        1
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
    <div className="fixed inset-0 bg-[#FBFDFB] z-[100] flex flex-col safe-area-inset animate-in slide-in-from-right duration-500">
      <div className="p-6 flex items-center justify-between">
        <button onClick={onExit} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-mint-100 text-moss-pale hover:text-moss hover:border-mint-200 hover:shadow-card active:scale-90 transition-all duration-300 shadow-subtle">
          <span className="material-symbols-outlined">close</span>
        </button>
        
        <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 border border-mint-100 shadow-subtle">
          <button onClick={() => setViewMode('cards')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'cards' ? 'bg-gradient-to-r from-accent/10 to-accent/5 text-accent shadow-sm' : 'text-moss-pale hover:text-moss hover:bg-mint-50'}`}>
            <span className="material-symbols-outlined text-base">style</span>
            <span className="hidden sm:inline">{lang === 'zh' ? '卡片' : 'Cards'}</span>
          </button>
          <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-gradient-to-r from-accent/10 to-accent/5 text-accent shadow-sm' : 'text-moss-pale hover:text-moss hover:bg-mint-50'}`}>
            <span className="material-symbols-outlined text-base">grid_view</span>
            <span className="hidden sm:inline">{lang === 'zh' ? '网格' : 'Grid'}</span>
          </button>
          <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-gradient-to-r from-accent/10 to-accent/5 text-accent shadow-sm' : 'text-moss-pale hover:text-moss hover:bg-mint-50'}`}>
            <span className="material-symbols-outlined text-base">list</span>
            <span className="hidden sm:inline">{lang === 'zh' ? '列表' : 'List'}</span>
          </button>
        </div>
        
        <div className="text-[11px] font-extrabold text-moss-pale tracking-widest bg-white px-3 py-2 rounded-xl border border-mint-100 shadow-subtle">
          {viewMode === 'cards' ? `${currentIndex + 1}/${studyCards.length}` : `${studyCards.length}`}
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="flex-1 flex flex-col px-6 py-4 justify-center animate-in fade-in zoom-in-95 duration-300">
          {isAddCardView ? (
            /* 添加新问题卡片 */
            <button 
              onClick={handleAddMoreCards}
              disabled={isGenerating}
              className="relative w-full aspect-[1/1.3] max-h-[520px] group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-mint-50/80 via-white to-mint-100/40 rounded-[40px] border-2 border-dashed border-mint-200/80 shadow-card flex flex-col items-center justify-center text-center overflow-hidden hover:border-accent/60 hover:shadow-card-hover transition-all duration-300">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl -ml-16 -mb-16"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-6">
                  {isGenerating ? (
                    <>
                      <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-4xl text-accent animate-spin">progress_activity</span>
                      </div>
                      <span className="text-lg font-bold text-moss-pale">{lang === 'zh' ? '生成中...' : 'Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-3xl bg-mint-100/80 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                        <span className="material-symbols-outlined text-4xl text-moss-pale group-hover:text-accent transition-colors">add</span>
                      </div>
                      <div className="text-center">
                        <span className="text-lg font-bold text-moss-pale group-hover:text-accent transition-colors block">{lang === 'zh' ? '添加新问题' : 'Add New Question'}</span>
                        <span className="text-xs text-moss-pale/60 mt-1">{lang === 'zh' ? '点击生成' : 'Tap to generate'}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </button>
          ) : (
            /* 正常问题卡片 */
            <div onClick={() => setIsFlipped(!isFlipped)} className="relative w-full aspect-[1/1.3] perspective-1000 max-h-[520px]">
              <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-mint-50/40 rounded-[40px] border-2 border-mint-200/60 shadow-card-hover backface-hidden p-12 flex flex-col items-center justify-center text-center overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-accent/8 to-transparent rounded-full blur-3xl -mr-20 -mt-20 animate-pulse-soft"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-primary/8 to-transparent rounded-full blur-3xl -ml-16 -mb-16 animate-pulse-soft" style={{animationDelay: '1.5s'}}></div>
                  
                  <div className="relative z-10 w-full">
                    <div className="inline-block px-4 py-1.5 bg-accent/5 border border-accent/10 rounded-full mb-8">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">{t.study.question}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center mb-8">
                      <h3 className="text-2xl md:text-3xl font-bold text-moss leading-snug px-4">{currentCard?.front}</h3>
                    </div>
                    <div className="mt-auto text-[10px] font-bold text-moss-pale uppercase tracking-widest flex items-center gap-2 bg-gradient-to-r from-mint-100/60 to-mint-50/60 backdrop-blur-sm px-5 py-2.5 rounded-full border border-mint-200/40 shadow-subtle mx-auto inline-flex">
                      <span className="material-symbols-outlined text-base animate-pulse">touch_app</span>
                      {t.study.tapReveal}
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent to-accent/90 rounded-[40px] shadow-glow-lg rotate-y-180 backface-hidden p-12 flex flex-col items-center justify-center text-center text-white overflow-hidden">
                  <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -ml-24 -mt-24 animate-float"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mb-20 animate-float" style={{animationDelay: '3s'}}></div>
                  <div className="absolute top-1/2 right-0 w-2 h-32 bg-white/5 blur-xl -mr-1"></div>
                  
                  <div className="relative z-10 w-full">
                    <div className="inline-block px-4 py-1.5 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full mb-8">
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-[0.4em]">{t.study.answer}</span>
                    </div>
                    <div className="flex-1 flex items-center justify-center overflow-y-auto w-full px-2 mb-8 max-h-[300px]">
                      <div className="text-2xl md:text-3xl leading-relaxed text-white/95">{currentCard?.back}</div>
                    </div>
                    <div className="mt-auto text-[10px] font-bold text-white/70 uppercase tracking-widest flex items-center gap-2 border border-white/30 backdrop-blur-md px-5 py-2.5 rounded-full bg-white/5 shadow-subtle mx-auto inline-flex">
                      <span className="material-symbols-outlined text-base">flip</span>
                      {t.study.tapFlip}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="flex-1 overflow-y-auto px-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto pb-6">
            {studyCards.map((card, index) => {
              const colors = [
                'from-rose-50/80 to-rose-100/40 border-rose-200/60',
                'from-sky-50/80 to-sky-100/40 border-sky-200/60',
                'from-mint-50/80 to-mint-100/40 border-mint-200/60',
                'from-violet-50/80 to-violet-100/40 border-violet-200/60',
                'from-amber-50/80 to-amber-100/40 border-amber-200/60',
              ];
              const colorClass = colors[index % colors.length];
              return (
                <div 
                  key={card.id} 
                  className={`bg-gradient-to-br ${colorClass} rounded-3xl p-5 border shadow-subtle hover:shadow-card hover:-translate-y-1 transition-all duration-300 cursor-pointer group animate-in fade-in zoom-in-95`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => { setCurrentIndex(index); setViewMode('cards'); }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-bold text-accent bg-white/60 px-2.5 py-1 rounded-full">{lang === 'zh' ? '问题' : 'Q'} {index + 1}</div>
                    <span className="material-symbols-outlined text-sm text-moss-pale/50 group-hover:text-accent transition-colors">open_in_full</span>
                  </div>
                  <div className="text-sm font-bold text-moss mb-3 line-clamp-3 group-hover:text-moss-light transition-colors">{card.front}</div>
                  <div className="text-[11px] text-moss-pale line-clamp-2 opacity-70">{card.back}</div>
                </div>
              );
            })}
            
            {/* 添加新问题卡片 - 和普通卡片一样大小 */}
            <button
              onClick={handleAddMoreCards}
              disabled={isGenerating}
              className="bg-gradient-to-br from-mint-50/50 to-white rounded-3xl p-5 border-2 border-dashed border-mint-200/80 hover:border-accent/60 hover:bg-accent/5 transition-all duration-300 flex flex-col items-center justify-center gap-2 group disabled:opacity-50 min-h-[140px] animate-in fade-in zoom-in-95"
              style={{ animationDelay: `${studyCards.length * 50}ms` }}
            >
              {isGenerating ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-accent animate-spin">progress_activity</span>
                  </div>
                  <span className="text-xs font-bold text-moss-pale">{lang === 'zh' ? '生成中...' : 'Generating...'}</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-mint-100/80 flex items-center justify-center group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                    <span className="material-symbols-outlined text-2xl text-moss-pale group-hover:text-accent transition-colors">add</span>
                  </div>
                  <span className="text-xs font-bold text-moss-pale group-hover:text-accent transition-colors">{lang === 'zh' ? '添加新问题' : 'Add'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="space-y-3 max-w-2xl mx-auto pb-6">
            {studyCards.map((card, index) => {
              const colors = [
                'from-rose-100/60 to-rose-50/30',
                'from-sky-100/60 to-sky-50/30',
                'from-emerald-100/60 to-emerald-50/30',
                'from-violet-100/60 to-violet-50/30',
                'from-amber-100/60 to-amber-50/30',
              ];
              const dotColors = [
                'from-rose-200 to-rose-300',
                'from-sky-200 to-sky-300',
                'from-emerald-200 to-emerald-300',
                'from-violet-200 to-violet-300',
                'from-amber-200 to-amber-300',
              ];
              const colorClass = colors[index % colors.length];
              const dotColor = dotColors[index % dotColors.length];
              return (
                <div 
                  key={card.id} 
                  className={`bg-gradient-to-r ${colorClass} rounded-2xl border border-white/60 shadow-subtle overflow-hidden animate-in fade-in slide-in-from-left-4`}
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <button onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)} className="w-full p-4 flex items-center gap-4 hover:bg-white/30 transition-all active:scale-[0.99]">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${dotColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold text-moss line-clamp-2">{card.front}</div>
                    </div>
                    <span className={`material-symbols-outlined text-moss-pale text-xl transition-all duration-300 ${expandedCard === card.id ? 'rotate-180 text-accent' : ''}`}>expand_more</span>
                  </button>
                  <div className={`grid transition-all duration-300 ${expandedCard === card.id ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <div className="px-4 pb-4 pt-2 bg-white/40 border-t border-white/60">
                        <div className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">{lang === 'zh' ? '答案' : 'Answer'}</div>
                        <div className="text-sm text-moss-light leading-relaxed">{card.back}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* 添加新问题 - 列表项样式 */}
            <button
              onClick={handleAddMoreCards}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-mint-50/50 to-white rounded-2xl border-2 border-dashed border-mint-200/80 hover:border-accent/60 hover:bg-accent/5 transition-all duration-300 overflow-hidden group disabled:opacity-50 animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${studyCards.length * 60}ms` }}
            >
              <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-mint-100/80 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  {isGenerating ? (
                    <span className="material-symbols-outlined text-lg text-accent animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-lg text-moss-pale group-hover:text-accent transition-colors">add</span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-bold text-moss-pale group-hover:text-accent transition-colors">
                    {isGenerating ? (lang === 'zh' ? '生成中...' : 'Generating...') : (lang === 'zh' ? '添加新问题' : 'Add New Question')}
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="p-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* 轮播导航栏 */}
          <div className="flex items-center justify-center gap-4 bg-white/80 backdrop-blur-xl rounded-full px-6 py-4 shadow-card border border-mint-100/60 max-w-sm mx-auto">
            {/* 左箭头 */}
            <button 
              onClick={handlePrev} 
              disabled={currentIndex === 0} 
              className="w-10 h-10 rounded-full bg-mint-50 flex items-center justify-center text-moss-pale hover:text-moss hover:bg-mint-100 active:scale-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            
            {/* 进度显示 */}
            <span className="text-sm font-bold text-moss-pale tabular-nums min-w-[40px] text-center">
              {isAddCardView ? '+' : `${currentIndex + 1} / ${studyCards.length}`}
            </span>
            
            {/* 圆点指示器 */}
            <div className="flex items-center gap-1.5">
              {studyCards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => { setIsFlipped(false); setCurrentIndex(index); }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex && !isAddCardView
                      ? 'bg-accent scale-125' 
                      : 'bg-mint-200 hover:bg-mint-300'
                  }`}
                />
              ))}
              
              {/* 添加新问题按钮 - 虚线圆圈 */}
              <button
                onClick={() => setCurrentIndex(studyCards.length)}
                className={`w-2.5 h-2.5 rounded-full border border-dashed transition-all duration-300 flex items-center justify-center ${
                  isAddCardView 
                    ? 'border-accent bg-accent/20 scale-125' 
                    : 'border-accent/60 hover:border-accent hover:bg-accent/10'
                }`}
                title={lang === 'zh' ? '添加新问题' : 'Add new question'}
              >
                {isGenerating && (
                  <span className="w-1 h-1 bg-accent rounded-full animate-ping"></span>
                )}
              </button>
            </div>
            
            {/* 右箭头 */}
            <button 
              onClick={handleNext}
              disabled={isAddCardView}
              className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white hover:bg-accent/90 active:scale-90 transition-all shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyView;
