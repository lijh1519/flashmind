
// 难度等级：简单、中等、困难
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface Card {
  id: string;
  front: string;
  back: string;
  difficulty?: DifficultyLevel; // 卡片难度
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  cards: Card[];
  lastStudied: string;
  cardCount: number;
  originalContent?: string; // 保存原始输入内容
  difficulty?: DifficultyLevel; // 卡组难度
}

export type AppView = 'library' | 'generate' | 'study';

export interface GenerateConfig {
  quantity: number;
  language: string;
  content: string;
  difficulty: DifficultyLevel; // 难度系数
}
