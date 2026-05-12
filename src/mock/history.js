/**
 * Mock search & view history.
 */
export const mockSearchHistory = [
  { id: 'H-1', keyword: 'retrieval-augmented generation', timestamp: '2024-12-01 10:38', type: 'works' },
  { id: 'H-2', keyword: 'graph neural network traffic', timestamp: '2024-11-30 21:12', type: 'works' },
  { id: 'H-3', keyword: 'Elena Park', timestamp: '2024-11-30 11:24', type: 'authors' },
  { id: 'H-4', keyword: 'Nature', timestamp: '2024-11-28 16:45', type: 'sources' },
  { id: 'H-5', keyword: 'CRISPR base editing', timestamp: '2024-11-27 22:01', type: 'works' }
]

export const mockViewHistory = [
  { id: 'V-1', paper_id: 'W2024-001', viewed_at: '2024-12-01 10:42' },
  { id: 'V-2', paper_id: 'W2024-002', viewed_at: '2024-11-30 14:08' },
  { id: 'V-3', paper_id: 'W2023-007', viewed_at: '2024-11-29 09:15' },
  { id: 'V-4', paper_id: 'W2024-010', viewed_at: '2024-11-28 23:42' }
]

/**
 * `RelationGraph` 期望 relationList 为扁平数组 [{ id, display_name }, ...]
 * 第一项作为根节点，其余作为从根节点辐射出去的子节点。
 */
export const mockRelationMap = [
  { id: 'A001', display_name: 'Ming Chen · 中心节点' },
  { id: 'A002', display_name: 'Elena Park' },
  { id: 'A004', display_name: 'Sarah Williams' },
  { id: 'A005', display_name: 'Jiahao Li' },
  { id: 'A013', display_name: 'Daniel Rivera' },
  { id: 'A024', display_name: 'Priya Iyer' },
  { id: 'A026', display_name: 'Sophia Lee' }
]
