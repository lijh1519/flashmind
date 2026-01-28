
export const translations = {
  en: {
    nav: {
      library: "Library",
      generate: "Create",
    },
    hero: {
      tag: "Mobile-First Learning",
      titlePrefix: "Snap",
      titleItalic: " & ",
      titleSuffix: "Learn",
      subtitle: "Snap a photo of your notes and turn them into smart flashcards instantly.",
    },
    generator: {
      label: "What to learn?",
      samples: "Samples",
      placeholder: "Paste notes or capture photo...",
      upload: "Upload File",
      camera: "Open Camera",
      retake: "Retake",
      max: "Count",
      types: "Mode",
      langLabel: "Lang",
      generate: "Generate Cards",
      generating: "Creating...",
      footer: "FlashMind Mobile",
      sampleText: "Photosynthesis: Process used by plants to convert light into chemical energy.",
      sample1: "Biology: Mitochondria\n\nMitochondria are double-membrane-bound organelles found in most eukaryotic cells. They are often called the \"powerhouses\" of the cell because they generate adenosine triphosphate (ATP) through oxidative phosphorylation, serving as the primary source of chemical energy. Mitochondria have their own genome (mitochondrial DNA) and replicate independently of the cell nucleus. Their internal structure includes the outer membrane, inner membrane, cristae (folds of the inner membrane), and matrix.",
      sample2: "Programming: Python Decorators\n\nDecorators are a powerful design pattern in Python that allows users to add extra functionality to functions without modifying the original code. A decorator is essentially a closure that takes a function as an argument and returns a new function. The @decorator_name syntax sugar simplifies their usage. Common applications include: logging, permission validation, caching (memoization), and performance timing.",
      sample3: "History: Age of Discovery\n\nThe Age of Discovery refers to the period from the 15th to 17th centuries when European fleets appeared on oceans worldwide, seeking new trade routes and partners.\n\nChristopher Columbus: Crossed the Atlantic in 1492, initiating sustained contact between Europe and the Americas.\n\nVasco da Gama: The first navigator to reach India from Europe by sailing around Africa's Cape of Good Hope in the late 15th century.\n\nMagellan: His fleet completed the first circumnavigation of Earth, proving the planet is round.",
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
      library: "我的",
      generate: "开始创建",
    },
    hero: {
      tag: "移动端学习助手",
      titlePrefix: "拍照 ",
      titleItalic: "即",
      titleSuffix: " 学习",
      subtitle: "拍摄笔记照片,立即将其转化为智能记忆卡片。",
    },
    generator: {
      label: "学习内容",
      samples: "示例",
      placeholder: "粘贴内容或拍照取词...",
      upload: "上传文件",
      camera: "打开相机",
      retake: "重拍",
      max: "数量",
      types: "模式",
      langLabel: "语言",
      generate: "生成卡片",
      generating: "正在生成...",
      footer: "FlashMind 移动版",
      sampleText: "光合作用：植物利用光能将水和二氧化碳转化为葡萄糖的过程。",
      sample1: "生物学：线粒体 (Mitochondria)\n\n线粒体是一种存在于大多数真核细胞中的双层膜结合细胞器。它们通常被称为细胞的“动力工厂”，因为它们通过氧化磷酸化过程产生三磷酸腺苷 (ATP)，作为化学能量的来源。线粒体拥有自己的基因组（线粒体 DNA），并独立于细胞核进行复制。其内部结构包括外膜、内膜、脊（内膜向内折叠形成）和基质。",
      sample2: "编程：Python 装饰器 (Decorators)\n\n装饰器是 Python 中一种强大的设计模式，允许用户在不修改原函数代码的情况下，给函数添加额外的功能。装饰器本质上是一个接收函数作为参数并返回一个新函数的闭环。使用 @decorator_name 语法糖可以简化调用。常见用途包括：日志记录、权限校验、缓存 (Memoization) 和性能计时。",
      sample3: "历史：大航海时代 (Age of Discovery)\n\n大航海时代是指 15 世纪到 17 世纪这一时期，欧洲船队出现在世界各处的海洋上，寻找新的贸易路线和合作伙伴。\n\n克里斯托弗·哥伦布：1492 年横跨大西洋，开启了欧洲与美洲的持续接触。\n\n瓦斯科·达·伽马：15 世纪末首位从欧洲绕过非洲好望角直达印度的航海家。\n\n麦哲伦：其船队完成了人类历史上第一次环球航行，证明了地球是圆的。",
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
