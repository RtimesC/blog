/**
 * IELTS 学习区域核心配置与外部资源数据
 * 保持轻量纯静态，随时可手动增删维护
 */

export const IELTS_MODULES = [
  {
    id: 'listening',
    name: 'Listening',
    eyebrow: 'Section 1–4 & Question Types',
    description: '抓取信号词、克服拼写陷阱与高频题型解题逻辑。',
    categories: ['全部', '填空题', '选择题', '地图题', '拼写', '精听', '错题/总结'],
    quickTags: ['拼写', '地图题', '填空题', '精听'],
  },
  {
    id: 'reading',
    name: 'Reading',
    eyebrow: 'Passage 1–3 & Strategy',
    description: '聚焦定位技巧、同义替换敏感度与高失分题型突破。',
    categories: ['全部', 'Matching Headings', 'True / False / Not Given', 'Sentence Completion', '同义替换', '长难句', '错题/总结'],
    quickTags: ['Matching Headings', 'True / False / Not Given', '同义替换', '长难句'],
  },
  {
    id: 'writing',
    name: 'Writing',
    eyebrow: 'Task 1 & Task 2',
    description: '结构框架搭建、段落论证展开与高质量句式表达积累。',
    categories: ['全部', 'Task 1', 'Task 2', '文章结构', '论证', 'Vocabulary / Expressions', '范文拆解', '修改记录'],
    quickTags: ['Task 2', '论证', '文章结构', '范文拆解'],
  },
];

/**
 * 模块内部收录的精选优质外部资源
 */
export const EXTERNAL_RESOURCES = [
  // Listening
  {
    id: 'res-lis-1',
    module: 'listening',
    category: '精听',
    title: 'TED-Ed 5分钟短视频精听法',
    source: 'YouTube',
    url: 'https://www.youtube.com/@TEDEd',
    note: '语速适中、发音标准，适合做 1.25x 影子跟读与关键词听写。',
  },
  {
    id: 'res-lis-2',
    module: 'listening',
    category: '地图题',
    title: 'IELTS Liz: Listening Map Labeling Strategies',
    source: 'IELTS Liz',
    url: 'https://ieltsliz.com/ielts-listening-map-labelling/',
    note: '方位介词、路线跟踪与盲区预判的最清晰讲解。',
  },

  // Reading
  {
    id: 'res-read-1',
    module: 'reading',
    category: 'Matching Headings',
    title: 'IELTS Advantage: How to Solve Headings Efficiently',
    source: 'YouTube',
    url: 'https://www.youtube.com/c/Ieltsadvantage',
    note: '不读全段、抓主题句与排他法步骤，非常适合提速。',
  },
  {
    id: 'res-read-2',
    module: 'reading',
    category: 'True / False / Not Given',
    title: 'IELTS Simon: Reading T/F/NG Method',
    source: 'IELTS Simon',
    url: 'https://www.ielts-simon.com/',
    note: '经典的前考官解题思路，核心抓住“Contradiction vs No Mention”。',
  },

  // Writing
  {
    id: 'res-writ-1',
    module: 'writing',
    category: 'Task 2',
    title: 'Official IELTS Writing Band Descriptors (Task 2)',
    source: 'British Council (PDF)',
    url: 'https://takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf',
    note: '官方四项评分标准（TR, CC, LR, GRA）官方细则，写完作文对照自查。',
  },
  {
    id: 'res-writ-2',
    module: 'writing',
    category: '论证',
    title: 'IELTS Advantage: PEEL Paragraph Structure for Task 2',
    source: 'IELTS Advantage',
    url: 'https://ieltsadvantage.com/writing-task-2/',
    note: 'Point -> Explanation -> Example -> Link 结构化论证法。',
  },
];

/**
 * 首页常驻的高频备考工具与链接
 */
export const QUICK_TOOLS = [
  {
    title: 'Official Band Descriptors',
    desc: '官方写作与口语评分细则对照表',
    source: 'British Council',
    url: 'https://takeielts.britishcouncil.org/sites/default/files/ielts_writing_band_descriptors.pdf',
  },
  {
    title: 'IELTS Simon',
    desc: '前考官备考经验、解题思维与简明范文',
    source: 'Blog',
    url: 'https://www.ielts-simon.com/',
  },
  {
    title: 'IELTS Liz',
    desc: '题型技巧、解题步骤梳理与免费练习资料',
    source: 'Website',
    url: 'https://ieltsliz.com/',
  },
];
