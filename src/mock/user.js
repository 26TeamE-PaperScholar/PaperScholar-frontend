/**
 * Mock current user profile.
 */
export const mockUser = {
  id: 'U-DEMO-01',
  username: 'demo_scholar',
  real_name: '张同学',
  email: 'demo@paperscholar.dev',
  region: '上海, 中国',
  gender: 'gender_male',
  institution: '同济大学 · 软件学院',
  major: '计算机科学与技术',
  bio: '本科生 · 研究方向：学术信息检索与推荐系统',
  websites: ['https://paperscholar.dev/demo_scholar', 'https://github.com/demo_scholar'],
  interests: [
    { id: 'C1', name: 'Information Retrieval' },
    { id: 'C2', name: 'Natural Language Processing' },
    { id: 'C5', name: 'Graph Neural Networks' }
  ],
  avatar_gradient: ['#2D1B69', '#D4AF37']
}

export const mockFavorites = [
  {
    id: 'F-001',
    name: '毕业设计参考',
    description: '与 RAG、学术检索相关的核心文献',
    paper_ids: ['W2024-001', 'W2024-002', 'W2024-004'],
    created_at: '2024-09-12',
    color: '#2D1B69'
  },
  {
    id: 'F-002',
    name: '组会讨论 · 图神经网络',
    description: 'GNN 在交通/分子/科学发现的最新工作',
    paper_ids: ['W2024-003', 'W2024-012', 'W2023-016'],
    created_at: '2024-10-04',
    color: '#D4AF37'
  },
  {
    id: 'F-003',
    name: '前沿追踪',
    description: '量子、基因编辑、气候、医学影像的明星工作',
    paper_ids: ['W2024-010', 'W2023-008', 'W2023-007', 'W2024-011'],
    created_at: '2024-11-19',
    color: '#15803D'
  }
]

export const mockFollowing = [
  { id: 'A001', display_name: 'Ming Chen', institution: 'Tsinghua University', followed_at: '2024-10-12', is_followed: true },
  { id: 'A002', display_name: 'Elena Park', institution: 'Stanford University', followed_at: '2024-08-30', is_followed: true },
  { id: 'A026', display_name: 'Sophia Lee', institution: 'DeepMind', followed_at: '2024-11-02', is_followed: true }
]
