/**
 * Mock concepts / interest tags.
 */
export const mockTags = [
  {
    id: 'C1',
    name: 'Information Retrieval',
    name_zh: '信息检索',
    level: 1,
    works_count: 38420,
    description: '信息检索研究如何从大规模非结构化数据中高效定位用户所需信息，是学术搜索的基础学科。',
    related_paper_ids: ['W2024-001', 'W2024-002', 'W2024-004', 'W2024-015'],
    top_author_ids: ['A001', 'A002', 'A003'],
    trend: [
      { year: 2019, score: 62 },
      { year: 2020, score: 70 },
      { year: 2021, score: 78 },
      { year: 2022, score: 84 },
      { year: 2023, score: 91 },
      { year: 2024, score: 96 }
    ]
  },
  {
    id: 'C2',
    name: 'Natural Language Processing',
    name_zh: '自然语言处理',
    level: 1,
    works_count: 218400,
    description: '研究计算机如何理解、生成、推理自然语言；近年来由预训练大模型主导。',
    related_paper_ids: ['W2024-002', 'W2024-005', 'W2024-017'],
    top_author_ids: ['A002', 'A004', 'A011'],
    trend: [
      { year: 2019, score: 70 },
      { year: 2020, score: 78 },
      { year: 2021, score: 86 },
      { year: 2022, score: 93 },
      { year: 2023, score: 99 },
      { year: 2024, score: 100 }
    ]
  },
  {
    id: 'C3',
    name: 'Artificial Intelligence',
    name_zh: '人工智能',
    level: 0,
    works_count: 412000,
    description: '关于让机器模拟、扩展人类智能的学科总称，覆盖学习、感知、推理、决策等。',
    related_paper_ids: ['W2024-002', 'W2023-006', 'W2024-011', 'W2024-017'],
    top_author_ids: ['A013', 'A026'],
    trend: [
      { year: 2019, score: 76 },
      { year: 2020, score: 84 },
      { year: 2021, score: 90 },
      { year: 2022, score: 96 },
      { year: 2023, score: 100 },
      { year: 2024, score: 100 }
    ]
  },
  {
    id: 'C5',
    name: 'Graph Neural Networks',
    name_zh: '图神经网络',
    level: 2,
    works_count: 28430,
    description: '将神经网络推广到图结构数据上，是科学计算与推荐系统的关键基础工具。',
    related_paper_ids: ['W2024-003', 'W2024-012', 'W2023-016'],
    top_author_ids: ['A006', 'A021', 'A026'],
    trend: [
      { year: 2019, score: 38 },
      { year: 2020, score: 51 },
      { year: 2021, score: 64 },
      { year: 2022, score: 74 },
      { year: 2023, score: 82 },
      { year: 2024, score: 89 }
    ]
  },
  {
    id: 'C14',
    name: 'Quantum Computing',
    name_zh: '量子计算',
    level: 1,
    works_count: 14380,
    description: '利用量子叠加与纠缠为基础进行计算的范式，处于工程化早期。',
    related_paper_ids: ['W2024-010'],
    top_author_ids: ['A018'],
    trend: [
      { year: 2019, score: 24 },
      { year: 2020, score: 34 },
      { year: 2021, score: 42 },
      { year: 2022, score: 56 },
      { year: 2023, score: 65 },
      { year: 2024, score: 78 }
    ]
  },
  {
    id: 'C20',
    name: 'Causal Inference',
    name_zh: '因果推断',
    level: 2,
    works_count: 11210,
    description: '在观察性数据中识别"因为 A 才有 B"，是医学、社科、互联网治理的重要方法学。',
    related_paper_ids: ['W2024-014'],
    top_author_ids: ['A024'],
    trend: [
      { year: 2019, score: 28 },
      { year: 2020, score: 33 },
      { year: 2021, score: 41 },
      { year: 2022, score: 49 },
      { year: 2023, score: 58 },
      { year: 2024, score: 66 }
    ]
  },
  {
    id: 'C21',
    name: 'Scientific Machine Learning',
    name_zh: '科学机器学习',
    level: 2,
    works_count: 18640,
    description: '将机器学习与物理、化学、生物等科学问题结合，用于建模、仿真与发现。',
    related_paper_ids: ['W2024-011', 'W2024-012'],
    top_author_ids: ['A013', 'A021'],
    trend: [
      { year: 2019, score: 32 },
      { year: 2020, score: 45 },
      { year: 2021, score: 59 },
      { year: 2022, score: 71 },
      { year: 2023, score: 84 },
      { year: 2024, score: 93 }
    ]
  },
  {
    id: 'C22',
    name: 'Medical Image Analysis',
    name_zh: '医学影像分析',
    level: 2,
    works_count: 76400,
    description: '面向医学影像的分割、检测、诊断辅助与多模态融合分析。',
    related_paper_ids: ['W2023-007'],
    top_author_ids: ['A011'],
    trend: [
      { year: 2019, score: 64 },
      { year: 2020, score: 70 },
      { year: 2021, score: 77 },
      { year: 2022, score: 83 },
      { year: 2023, score: 88 },
      { year: 2024, score: 91 }
    ]
  },
  {
    id: 'C23',
    name: 'Human-AI Interaction',
    name_zh: '人机协同',
    level: 2,
    works_count: 22450,
    description: '研究人在 AI 系统中的交互、信任、解释与协作流程设计。',
    related_paper_ids: ['W2024-005', 'W2024-017'],
    top_author_ids: ['A004', 'A011'],
    trend: [
      { year: 2019, score: 40 },
      { year: 2020, score: 48 },
      { year: 2021, score: 57 },
      { year: 2022, score: 69 },
      { year: 2023, score: 82 },
      { year: 2024, score: 94 }
    ]
  },
  {
    id: 'C24',
    name: 'Data-Centric AI',
    name_zh: '数据中心 AI',
    level: 2,
    works_count: 15920,
    description: '关注数据质量、标注、评测与数据治理对模型性能和可靠性的影响。',
    related_paper_ids: ['W2024-004', 'W2024-015'],
    top_author_ids: ['A001', 'A024'],
    trend: [
      { year: 2019, score: 25 },
      { year: 2020, score: 36 },
      { year: 2021, score: 49 },
      { year: 2022, score: 63 },
      { year: 2023, score: 78 },
      { year: 2024, score: 90 }
    ]
  }
]

export const findTag = (id) => mockTags.find((t) => t.id === id) || null
