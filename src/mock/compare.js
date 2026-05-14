/**
 * 论文横向对比 mock。
 * - 从 mockPapers 取 comparison 字段拼装 matrix
 * - 缺失 comparison 字段 → 计入 restricted_papers
 * - 字段全部缺失或仅有摘要级抽取（confidence=low 且关键维度为 null）→ 也计入 restricted_papers
 */
import { mockPapers } from './papers'

const RESTRICTED_CONFIDENCE_THRESHOLD = 'low'

function isRestricted(comparison) {
  if (!comparison) return true
  const hasMethod = comparison.method && comparison.method.confidence !== RESTRICTED_CONFIDENCE_THRESHOLD
  const hasDataset = comparison.dataset && comparison.dataset.confidence !== RESTRICTED_CONFIDENCE_THRESHOLD
  return !hasMethod || !hasDataset
}

function emptyComparison() {
  return {
    method: null,
    dataset: null,
    metrics: [],
    contribution: null,
    limitation: null
  }
}

/**
 * @param {string[]} paperIds
 * @returns {{ matrix, restricted_papers, comparability_warning, missing_papers }}
 */
export function mockCompareExtract(paperIds) {
  const matrix = {}
  const restricted = []
  const missing = []

  for (const id of paperIds) {
    const paper = mockPapers.find((p) => p.id === id)
    if (!paper) {
      missing.push(id)
      matrix[id] = emptyComparison()
      restricted.push(id)
      continue
    }
    matrix[id] = paper.comparison ? paper.comparison : emptyComparison()
    if (isRestricted(paper.comparison)) {
      restricted.push(id)
    }
  }

  // 可比性提示：粗略实现 —— 若两篇所属领域 concept level-1 不同，给出提示
  let comparability_warning = null
  if (paperIds.length === 2) {
    const papers = paperIds.map((id) => mockPapers.find((p) => p.id === id)).filter(Boolean)
    if (papers.length === 2) {
      const conceptsA = (papers[0].concepts || []).map((c) => c.display_name)
      const conceptsB = (papers[1].concepts || []).map((c) => c.display_name)
      const overlap = conceptsA.filter((c) => conceptsB.includes(c))
      if (overlap.length === 0) {
        comparability_warning =
          '所选两篇论文的研究领域差异较大（概念无交集），对比结果可能仅供参考。'
      }
    }
  }

  return {
    matrix,
    restricted_papers: restricted,
    comparability_warning,
    missing_papers: missing
  }
}

/**
 * 按 id 顺序取出对应的论文元信息（标题/作者/年份/期刊/DOI/摘要），供对比页 hero 展示。
 */
export function getCompareMeta(paperIds) {
  return paperIds.map((id) => {
    const p = mockPapers.find((x) => x.id === id)
    if (!p) return { id, missing: true }
    return {
      id: p.id,
      title: p.title,
      abstract: p.abstract,
      publication_date: p.publication_date,
      publication_year: p.publication_year,
      cited_by_count: p.cited_by_count,
      doi: p.doi,
      language: p.language,
      authorships: p.authorships,
      primary_location: p.primary_location,
      concepts: p.concepts,
      keywords: p.keywords
    }
  })
}
