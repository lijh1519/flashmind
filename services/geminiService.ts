
import { GenerateConfig, Card, DifficultyLevel } from "../types";

// 难度等级描述映射
const difficultyDescriptions: Record<DifficultyLevel, { zh: string; en: string }> = {
  easy: {
    zh: '简单级别：基础概念和定义，直接答案，适合初学者',
    en: 'Easy level: Basic concepts and definitions, straightforward answers, suitable for beginners'
  },
  medium: {
    zh: '中等级别：需要理解和应用，涉及原理和联系，适合有一定基础的学习者',
    en: 'Medium level: Requires understanding and application, involves principles and connections'
  },
  hard: {
    zh: '困难级别：深入分析和综合运用，复杂问题或边界情况，适合高级学习者',
    en: 'Hard level: Deep analysis and comprehensive application, complex problems or edge cases'
  }
};

export const generateFlashcards = async (config: GenerateConfig, imageBase64Array?: string[]): Promise<Card[]> => {
  const difficultyDesc = config.language.toLowerCase().includes('chinese') || config.language === '中文'
    ? difficultyDescriptions[config.difficulty].zh
    : difficultyDescriptions[config.difficulty].en;

  const systemPrompt = `你是一个专业的助学助手。请将用户提供的文本或图片内容拆解为一组记忆卡片。
难度要求：${difficultyDesc}
必须遵循以下 JSON 格式： {"cards": [{"front": "问题/概念", "back": "简短答案/解释"}]}
注意：每张卡片只包含一个原子化知识点，语言必须使用 ${config.language}。`;

  const messages: any[] = [
    {
      role: "system",
      content: systemPrompt
    }
  ];

  const userContent: any[] = [];
  
  if (imageBase64Array && imageBase64Array.length > 0) {
    userContent.push({
      type: "text",
      text: `请提取这${imageBase64Array.length > 1 ? imageBase64Array.length + '张图片' : '张图片'}中的关键知识点并生成正好 ${config.quantity} 张卡片。${config.content ? '\n\n补充说明：' + config.content : ''}`
    });
    // 添加所有图片
    for (const imgBase64 of imageBase64Array) {
      userContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imgBase64}`
        }
      });
    }
  } else {
    userContent.push({
      type: "text",
      text: `请根据以下内容生成正好 ${config.quantity} 张卡片：\n\n${config.content}`
    });
  }

  messages.push({
    role: "user",
    content: userContent
  });

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "HTTP-Referer": "https://flashmind.ai", // Optional, for OpenRouter analytics
        "X-Title": "FlashMind AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini", // Cost-effective and vision-capable
        messages: messages,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter API request failed");
    }

    const data = await response.json();
    const contentStr = data.choices[0].message.content;
    const result = JSON.parse(contentStr);
    
    // Support both array return or object return wrapping the array
    const rawCards = result.cards || result;
    
    if (!Array.isArray(rawCards)) {
      throw new Error("Invalid response format from AI");
    }

    return rawCards.map((c: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      front: c.front || c.question || "N/A",
      back: c.back || c.answer || "N/A",
    }));
  } catch (error) {
    console.error("Error in AI generation:", error);
    throw error;
  }
};

// 生成更多不重复的卡片
export const generateMoreCards = async (
  originalContent: string,
  existingCards: Card[],
  language: string,
  quantity: number = 1,
  difficulty: DifficultyLevel = 'medium'
): Promise<Card[]> => {
  const existingQuestions = existingCards.map((c, i) => `${i + 1}. ${c.front}`).join('\n');
  
  const isZh = language.toLowerCase().includes('chinese') || language === '中文' || language.toLowerCase() === 'zh';
  const difficultyDesc = isZh
    ? difficultyDescriptions[difficulty].zh
    : difficultyDescriptions[difficulty].en;
  
  const systemPrompt = `你是一个专业的助学助手。请将用户提供的文本内容拆解为记忆卡片。
难度要求：${difficultyDesc}
必须遵循以下 JSON 格式： {"cards": [{"front": "问题/概念", "back": "简短答案/解释"}]}
注意：每张卡片只包含一个原子化知识点，语言必须使用 ${language}。`;

  const userPrompt = `请根据以下内容生成 ${quantity} 个新的记忆卡片：

${originalContent}

已有的问题：
${existingQuestions}

要求（按优先级）：
1. 优先生成原文中其他未覆盖的知识点
2. 如果原文知识点已基本覆盖，再考虑从不同角度提问已有知识点
3. 不要完全重复已有问题`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.API_KEY}`,
        "HTTP-Referer": "https://flashmind.ai",
        "X-Title": "FlashMind AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "OpenRouter API request failed");
    }

    const data = await response.json();
    const contentStr = data.choices[0].message.content;
    const result = JSON.parse(contentStr);
    
    const rawCards = result.cards || result;
    
    if (!Array.isArray(rawCards)) {
      throw new Error("Invalid response format from AI");
    }

    return rawCards.map((c: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      front: c.front || c.question || "N/A",
      back: c.back || c.answer || "N/A",
    }));
  } catch (error) {
    console.error("Error generating more cards:", error);
    throw error;
  }
};
