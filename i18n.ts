
export const translations = {
  en: {
    nav: {
      library: "Library",
      generate: "Create",
    },
    hero: {
      tag: "Mobile-First AI Learning",
      titlePrefix: "Snap",
      titleItalic: " & ",
      titleSuffix: "Learn",
      subtitle: "Snap a photo of your notes and turn them into smart flashcards instantly.",
    },
    generator: {
      label: "What to learn?",
      samples: "Samples",
      placeholder: "Paste notes or capture photo...",
      upload: "Upload Photo",
      camera: "Open Camera",
      retake: "Retake",
      max: "Count",
      types: "Mode",
      langLabel: "Lang",
      generate: "Generate Cards",
      generating: "Scanning & Creating...",
      footer: "FlashMind AI Mobile",
      sampleText: "Photosynthesis: Process used by plants to convert light into chemical energy.",
    },
    library: {
      title: "My Decks",
      subtitle: "Your knowledge garden.",
      newDeck: "New Deck",
      cards: "Cards",
      lastStudied: "Last",
      studyBtn: "Study",
    },
    study: {
      exit: "Close",
      question: "Front",
      answer: "Back",
      tapReveal: "Tap to flip",
      tapFlip: "Tap to flip back",
      review: "Again",
      gotIt: "Known",
    }
  },
  zh: {
    nav: {
      library: "我的馆藏",
      generate: "开始创建",
    },
    hero: {
      tag: "移动端 AI 学习助手",
      titlePrefix: "拍照",
      titleItalic: " 即 ",
      titleSuffix: "学习",
      subtitle: "拍摄笔记照片，立即将其转化为智能记忆卡片。",
    },
    generator: {
      label: "学习内容",
      samples: "示例",
      placeholder: "粘贴内容或拍照取词...",
      upload: "上传图片",
      camera: "打开相机",
      retake: "重拍",
      max: "数量",
      types: "模式",
      langLabel: "语言",
      generate: "生成卡片",
      generating: "正在扫描并生成...",
      footer: "FlashMind AI 移动版",
      sampleText: "光合作用：植物利用光能将水和二氧化碳转化为葡萄糖的过程。",
    },
    library: {
      title: "我的卡包",
      subtitle: "您的知识资产库。",
      newDeck: "新建卡组",
      cards: "张卡片",
      lastStudied: "上次",
      studyBtn: "复习",
    },
    study: {
      exit: "退出",
      question: "正面",
      answer: "背面",
      tapReveal: "点击翻面",
      tapFlip: "点击返回",
      review: "再来一次",
      gotIt: "掌握了",
    }
  }
};

export type Language = 'en' | 'zh';
