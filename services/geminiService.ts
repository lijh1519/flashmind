
import { GenerateConfig, Card } from "../types";

export const generateFlashcards = async (config: GenerateConfig, imageBase64Array?: string[]): Promise<Card[]> => {
  const systemPrompt = `你是一个专业的助学助手。请将用户提供的文本或图片内容拆解为一组记忆卡片。
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
  quantity: number = 2
): Promise<Card[]> => {
  const existingQuestions = existingCards.map(c => c.front).join('\n- ');
  
  const systemPrompt = `你是一个专业的助学助手。请根据用户提供的原始学习材料生成新的记忆卡片。
重要规则：
1. 必须严格围绕原始材料内容，不能跑题或引入无关知识
2. 必须避免与已有问题重复
3. 可以从不同角度、不同深度提问（如定义、原理、应用、对比等）
4. 问题要有层次，从基础到进阶，帮助用户更全面理解材料
5. 语言使用: ${language}

返回 JSON 格式：{"cards": [{"front": "问题", "back": "答案"}]}`;

  const userPrompt = `原始学习材料：
${originalContent}

已有的问题（请避免重复）：
- ${existingQuestions}

请基于上述原始材料，生成 ${quantity} 个新的、不重复的问题。务必确保问题来源于原始材料，不要超出材料范围。`;

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
