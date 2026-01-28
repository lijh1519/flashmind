
export interface Card {
  id: string;
  front: string;
  back: string;
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
}

export type AppView = 'library' | 'generate' | 'study';

export interface GenerateConfig {
  quantity: number;
  language: string;
  content: string;
}
