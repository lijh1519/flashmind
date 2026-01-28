
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

  const systemPrompt = `# Role
你是一个高精度的"知识还原专家"。你的任务是将原始文本拆解为记忆闪卡，答案必须是原文的"高保真镜像"，严禁过度压缩或改写。

# Core Directive: 因果导向 (Explain the Why)
挖掘文本中的逻辑链条，不要只问"是什么"，要问"为什么"和"如何"。
- 寻找标记词：因为、由于、导致、为了、其逻辑在于
- 如果原文解释了因果关系，卡片背面必须保留完整推导过程

# Constraint Hooks (精度约束)
1. **原文引用**: 答案90%以上必须取自原文原句，禁止使用"AI总结语"（如"本文讨论了..."、"总的来说..."、"综上所述"）
2. **逻辑不流失**: 如果结论有多个支撑点，必须全部罗列，不能只给宽泛总结
3. **拒绝润色**: 保持原文陈述语调，不要改写句式
4. **原子化但完整**: 每张卡片只讲一个因果链，但链条必须完整
5. **难度匹配**: ${difficultyDesc}

# Step-by-Step Thinking (隐性思考)
1. 识别：这段话的核心因果词在哪？
2. 过滤：答案里有没有自创的总结词？如果有，替换回原文
3. 校验：用户读了这张卡片，能理解"为什么"吗？

# Output Format
严格遵循 JSON 格式：{"cards": [{"front": "问题", "back": "答案"}]}
语言：${config.language}`;

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
        model: "openai/gpt-5-mini",
        messages: messages,
        response_format: { type: "json_object" },
        temperature: 0.15,
        top_p: 0.9,
        presence_penalty: 0
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
  
  // 检测原始内容是否有效，无效时从已有卡片构建参考内容
  const invalidContentMarkers = ['(图片内容)', '（图片内容）', '(image content)', ''];
  const isContentInvalid = !originalContent || invalidContentMarkers.includes(originalContent.trim());
  
  // 如果原文无效，从已有卡片构建参考内容
  const effectiveContent = isContentInvalid 
    ? existingCards.map((c, i) => `知识点${i + 1}: ${c.front}\n答案: ${c.back}`).join('\n\n')
    : originalContent;
  
  const isZh = language.toLowerCase().includes('chinese') || language === '中文' || language.toLowerCase() === 'zh';
  const difficultyDesc = isZh
    ? difficultyDescriptions[difficulty].zh
    : difficultyDescriptions[difficulty].en;
  
  const systemPrompt = `# Role
你是一个高精度的"知识还原专家"。你的任务是将原始文本拆解为记忆闪卡，答案必须是原文的"高保真镜像"，严禁过度压缩或改写。

# Core Directive: 因果导向 (Explain the Why)
挖掘文本中的逻辑链条，不要只问"是什么"，要问"为什么"和"如何"。
- 寻找标记词：因为、由于、导致、为了、其逻辑在于
- 如果原文解释了因果关系，卡片背面必须保留完整推导过程

# Constraint Hooks (精度约束)
1. **原文引用**: 答案90%以上必须取自原文原句，禁止使用"AI总结语"（如"本文讨论了..."、"总的来说..."、"综上所述"）
2. **逻辑不流失**: 如果结论有多个支撑点，必须全部罗列，不能只给宽泛总结
3. **拒绝润色**: 保持原文陈述语调，不要改写句式
4. **原子化但完整**: 每张卡片只讲一个因果链，但链条必须完整
5. **难度匹配**: ${difficultyDesc}

# Step-by-Step Thinking (隐性思考)
1. 识别：原材料中还有哪些未覆盖的因果链？
2. 过滤：答案里有没有自创的总结词？如果有，替换回原文
3. 校验：用户读了这张卡片，能理解"为什么"吗？

# Output Format
严格遵循 JSON 格式：{"cards": [{"front": "问题", "back": "答案"}]}
语言：${language}`;

  const userPrompt = isContentInvalid
    ? `请基于以下已有知识点，从不同角度生成 ${quantity} 个新的记忆卡片：

${effectiveContent}

已有的问题：
${existingQuestions}

要求：
1. 从不同认知层级提问（如为什么/如何/关键区别）
2. 不要完全重复已有问题
3. 答案基于已有知识点内容`
    : `请根据以下内容生成 ${quantity} 个新的记忆卡片：

${effectiveContent}

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
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.15,
        top_p: 0.9,
        presence_penalty: 0
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
