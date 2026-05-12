/**
 * Mock recommendation feeds.
 */
import { mockPapers } from './papers'
import { mockTags } from './tags'

export const mockHotspot = mockPapers
  .filter((p) => p.is_hot)
  .map((p) => ({
    id: p.id,
    title: p.title,
    abstract: p.abstract,
    cited_by_count: p.cited_by_count,
    authorships: p.authorships,
    publication_date: p.publication_date,
    concepts: p.concepts
  }))

export const mockInterestList = mockTags.map((t) => ({
  id: t.id,
  name: t.name,
  name_zh: t.name_zh,
  level: t.level,
  works_count: t.works_count
}))

export const mockInterestRecommend = mockPapers.slice(0, 6).map((p) => ({
  id: p.id,
  title: p.title,
  abstract: p.abstract,
  cited_by_count: p.cited_by_count,
  authorships: p.authorships,
  publication_date: p.publication_date,
  matched_interest: p.concepts && p.concepts[0] ? p.concepts[0].display_name : ''
}))
