/**
 * Mock author dataset.
 * 与 papers.js 的 authorships[].author 共用 id。
 */

export const mockAuthors = [
  {
    id: 'A001',
    display_name: 'Ming Chen',
    display_name_alt: '陈鸣',
    orcid: '0000-0001-1234-0001',
    h_index: 38,
    i10_index: 92,
    works_count: 147,
    cited_by_count: 12480,
    last_known_institution: { id: 'I001', display_name: 'Tsinghua University', country_code: 'CN' },
    affiliations: [
      { institution: { id: 'I001', display_name: 'Tsinghua University' }, years: [2018, 2024] }
    ],
    research_interests: ['Information Retrieval', 'NLP', 'Retrieval-Augmented Generation', 'Scientific Knowledge Graphs'],
    counts_by_year: [
      { year: 2020, works_count: 14, cited_by_count: 980 },
      { year: 2021, works_count: 18, cited_by_count: 1620 },
      { year: 2022, works_count: 22, cited_by_count: 2410 },
      { year: 2023, works_count: 26, cited_by_count: 3280 },
      { year: 2024, works_count: 21, cited_by_count: 4190 }
    ]
  },
  {
    id: 'A002',
    display_name: 'Elena Park',
    orcid: '0000-0001-1234-0002',
    h_index: 41,
    i10_index: 102,
    works_count: 168,
    cited_by_count: 15920,
    last_known_institution: { id: 'I002', display_name: 'Stanford University', country_code: 'US' },
    affiliations: [{ institution: { id: 'I002', display_name: 'Stanford University' }, years: [2016, 2024] }],
    research_interests: ['Information Retrieval', 'Trustworthy AI', 'HCI'],
    counts_by_year: [
      { year: 2020, works_count: 18, cited_by_count: 1450 },
      { year: 2021, works_count: 20, cited_by_count: 2160 },
      { year: 2022, works_count: 24, cited_by_count: 3220 },
      { year: 2023, works_count: 27, cited_by_count: 4180 },
      { year: 2024, works_count: 25, cited_by_count: 4910 }
    ]
  },
  {
    id: 'A003',
    display_name: 'David Kumar',
    h_index: 24,
    i10_index: 51,
    works_count: 78,
    cited_by_count: 4380,
    last_known_institution: { id: 'I003', display_name: 'IIT Bombay', country_code: 'IN' },
    research_interests: ['Information Retrieval', 'Recommender Systems'],
    counts_by_year: [
      { year: 2021, works_count: 9, cited_by_count: 510 },
      { year: 2022, works_count: 12, cited_by_count: 790 },
      { year: 2023, works_count: 14, cited_by_count: 1120 },
      { year: 2024, works_count: 11, cited_by_count: 960 }
    ]
  },
  {
    id: 'A004',
    display_name: 'Sarah Williams',
    h_index: 33,
    i10_index: 78,
    works_count: 121,
    cited_by_count: 9870,
    last_known_institution: { id: 'I004', display_name: 'University of Cambridge', country_code: 'GB' },
    research_interests: ['NLP', 'LLM Evaluation'],
    counts_by_year: []
  },
  {
    id: 'A005',
    display_name: 'Jiahao Li',
    display_name_alt: '李家豪',
    h_index: 19,
    i10_index: 36,
    works_count: 54,
    cited_by_count: 2810,
    last_known_institution: { id: 'I001', display_name: 'Tsinghua University', country_code: 'CN' },
    research_interests: ['LLM', 'Reinforcement Learning'],
    counts_by_year: []
  },
  {
    id: 'A006',
    display_name: 'Ava Thompson',
    h_index: 27,
    i10_index: 62,
    works_count: 88,
    cited_by_count: 5610,
    last_known_institution: { id: 'I005', display_name: 'MIT', country_code: 'US' },
    research_interests: ['Recommender Systems', 'Graph Neural Networks'],
    counts_by_year: []
  },
  {
    id: 'A011',
    display_name: '王志远',
    display_name_alt: 'Zhiyuan Wang',
    h_index: 31,
    i10_index: 70,
    works_count: 109,
    cited_by_count: 7220,
    last_known_institution: { id: 'I009', display_name: '北京大学', country_code: 'CN' },
    research_interests: ['中文 NLP', '预训练模型', '知识图谱'],
    counts_by_year: [
      { year: 2020, works_count: 12, cited_by_count: 730 },
      { year: 2021, works_count: 14, cited_by_count: 1180 },
      { year: 2022, works_count: 16, cited_by_count: 1540 },
      { year: 2023, works_count: 19, cited_by_count: 1810 },
      { year: 2024, works_count: 18, cited_by_count: 1960 }
    ]
  },
  {
    id: 'A013',
    display_name: 'Daniel Rivera',
    h_index: 45,
    i10_index: 120,
    works_count: 198,
    cited_by_count: 21430,
    last_known_institution: { id: 'I010', display_name: 'UC Berkeley', country_code: 'US' },
    research_interests: ['Deep Learning', 'Foundation Models', 'Systems'],
    counts_by_year: []
  },
  {
    id: 'A018',
    display_name: 'Ryan O\'Brien',
    h_index: 28,
    i10_index: 62,
    works_count: 81,
    cited_by_count: 4810,
    last_known_institution: { id: 'I014', display_name: 'Google Quantum AI', country_code: 'US' },
    research_interests: ['Quantum Error Correction', 'Superconducting Qubits'],
    counts_by_year: []
  },
  {
    id: 'A020',
    display_name: 'Aisha Patel',
    h_index: 35,
    i10_index: 81,
    works_count: 132,
    cited_by_count: 10870,
    last_known_institution: { id: 'I015', display_name: 'Imperial College London', country_code: 'GB' },
    research_interests: ['Medical AI', 'Multimodal Learning'],
    counts_by_year: []
  },
  {
    id: 'A021',
    display_name: '张伟',
    display_name_alt: 'Wei Zhang',
    h_index: 22,
    i10_index: 47,
    works_count: 65,
    cited_by_count: 3120,
    last_known_institution: { id: 'I016', display_name: '同济大学', country_code: 'CN' },
    research_interests: ['图神经网络', '交通工程', '深度学习'],
    counts_by_year: []
  },
  {
    id: 'A024',
    display_name: 'Priya Iyer',
    h_index: 26,
    i10_index: 58,
    works_count: 79,
    cited_by_count: 4520,
    last_known_institution: { id: 'I018', display_name: 'NUS', country_code: 'SG' },
    research_interests: ['Causal Inference', 'Healthcare AI'],
    counts_by_year: []
  },
  {
    id: 'A026',
    display_name: 'Sophia Lee',
    h_index: 39,
    i10_index: 95,
    works_count: 144,
    cited_by_count: 18430,
    last_known_institution: { id: 'I020', display_name: 'DeepMind', country_code: 'GB' },
    research_interests: ['Geometric Deep Learning', 'Computational Biology'],
    counts_by_year: []
  },
  {
    id: 'A028',
    display_name: 'Camille Lefèvre',
    h_index: 21,
    i10_index: 44,
    works_count: 62,
    cited_by_count: 2680,
    last_known_institution: { id: 'I022', display_name: 'INRIA', country_code: 'FR' },
    research_interests: ['ML Reproducibility', 'Statistical Methods'],
    counts_by_year: []
  }
]

export const findAuthor = (id) => mockAuthors.find((a) => a.id === id) || null

export const searchAuthors = (params = {}) => {
  let list = [...mockAuthors]
  const q = (params.search || '').trim().toLowerCase()
  if (q) {
    list = list.filter((a) =>
      [a.display_name, a.display_name_alt, ...(a.research_interests || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    )
  }
  const sort = params.sort || ''
  if (sort.startsWith('cited_by_count')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.cited_by_count - a.cited_by_count : a.cited_by_count - b.cited_by_count
    )
  } else if (sort.startsWith('works_count')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.works_count - a.works_count : a.works_count - b.works_count
    )
  } else if (sort.startsWith('display_name')) {
    list.sort((a, b) =>
      sort.endsWith('desc') ? b.display_name.localeCompare(a.display_name) : a.display_name.localeCompare(b.display_name)
    )
  } else {
    list.sort((a, b) => b.h_index - a.h_index)
  }
  return list
}
