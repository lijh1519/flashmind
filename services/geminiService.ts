
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
你是一位拥有 20 年教学经验的"主动回忆 (Active Recall)"专家，擅长将复杂知识点拆解为最适合大脑记忆的原子化闪卡。

# Objective
深度分析用户提供的内容，提取核心概念，转化为记忆卡片。

# Card Generation Principles
1. **原子化**: 每张卡片只含一个独立知识点
2. **问题导向**: 正面必须是具体问题，使用"为什么"、"如何"、"...的关键区别是？"
3. **布鲁姆分级**: 包含"理解"和"应用"层面，不只是定义背诵
4. **拒绝废话**: 答案直接、简洁，剔除修饰词
5. **难度匹配**: ${difficultyDesc}

# Internal Workflow (先思考)
- 核心信息点是什么？
- 逻辑链条是否完整？
- 答案能否在 5 秒内读完？

# Output Format
严格遵循 JSON 格式：{"cards": [{"front": "问题", "back": "答案"}]}
语言：${config.language}

# High-Quality Examples (优质示例)
示例 1:
{
  "front": "为什么线粒体被称为细胞的'能量工厂'？",
  "back": "因为它通过氧化磷酸化将营养物质转化为 ATP（三磷酸腺苷），为细胞提供能量。"
}

示例 2:
{
  "front": "如何快速判断一个数是否能被 3 整除？",
  "back": "将该数所有位上的数字相加，如果和能被 3 整除，则原数也能被 3 整除。"
}

示例 3:
{
  "front": "HTTP 和 HTTPS 的关键区别是什么？",
  "back": "HTTPS 在 HTTP 基础上加入 SSL/TLS 加密层，确保数据传输安全，防止窃听和篡改。"
}`;

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
        temperature: 0.35
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
  
  const systemPrompt = `# Role
你是一位拥有 20 年教学经验的"主动回忆 (Active Recall)"专家，擅长将复杂知识点拆解为最适合大脑记忆的原子化闪卡。

# Objective
基于原始材料生成新的记忆卡片，确保不重复已有问题。

# Card Generation Principles
1. **原子化**: 每张卡片只含一个独立知识点
2. **问题导向**: 正面必须是具体问题，使用"为什么"、"如何"、"...的关键区别是？"
3. **布鲁姆分级**: 包含"理解"和"应用"层面，不只是定义背诵
4. **拒绝废话**: 答案直接、简洁，剔除修饰词
5. **难度匹配**: ${difficultyDesc}

# Internal Workflow (先思考)
- 原材料中还有哪些未覆盖的知识点？
- 已有问题是否可以从不同认知层级提问？
- 答案能否在 5 秒内读完？

# Output Format
严格遵循 JSON 格式：{"cards": [{"front": "问题", "back": "答案"}]}
语言：${language}

# High-Quality Examples (优质示例)
示例 1:
{
  "front": "为什么线粒体被称为细胞的'能量工厂'？",
  "back": "因为它通过氧化磷酸化将营养物质转化为 ATP（三磷酸腺苷），为细胞提供能量。"
}

示例 2:
{
  "front": "如何快速判断一个数是否能被 3 整除？",
  "back": "将该数所有位上的数字相加，如果和能被 3 整除，则原数也能被 3 整除。"
}

示例 3:
{
  "front": "HTTP 和 HTTPS 的关键区别是什么？",
  "back": "HTTPS 在 HTTP 基础上加入 SSL/TLS 加密层，确保数据传输安全，防止窃听和篡改。"
}`;

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
        model: "openai/gpt-5-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.4
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
