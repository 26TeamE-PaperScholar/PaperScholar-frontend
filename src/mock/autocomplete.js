/**
 * Mock autocomplete suggestions.
 */
import { mockPapers } from './papers'
import { mockAuthors } from './authors'
import { mockInstitutions } from './institutions'
import { mockJournals } from './journals'
import { mockTags } from './tags'

const matches = (text, q) => text && text.toLowerCase().includes(q.toLowerCase())

export const autocompletePapers = (q) =>
  mockPapers
    .filter((p) => matches(p.title, q))
    .slice(0, 8)
    .map((p) => ({
      id: p.id,
      display_name: p.title,
      cited_by_count: p.cited_by_count,
      entity_type: 'work'
    }))

export const autocompleteAuthors = (q) =>
  mockAuthors
    .filter((a) => matches(a.display_name, q) || matches(a.display_name_alt, q))
    .slice(0, 8)
    .map((a) => ({
      id: a.id,
      display_name: a.display_name,
      works_count: a.works_count,
      entity_type: 'author'
    }))

export const autocompleteInstitutions = (q) =>
  mockInstitutions
    .filter((i) => matches(i.display_name, q) || matches(i.display_name_alt, q))
    .slice(0, 8)
    .map((i) => ({
      id: i.id,
      display_name: i.display_name,
      works_count: i.works_count,
      entity_type: 'institution'
    }))

export const autocompleteConcepts = (q) =>
  mockTags
    .filter((t) => matches(t.name, q) || matches(t.name_zh, q))
    .slice(0, 8)
    .map((t) => ({
      id: t.id,
      display_name: t.name,
      works_count: t.works_count,
      entity_type: 'concept'
    }))

export const autocompleteJournals = (q) =>
  mockJournals
    .filter((j) => matches(j.display_name, q) || matches(j.display_name_alt, q))
    .slice(0, 8)
    .map((j) => ({
      id: j.id,
      display_name: j.display_name,
      works_count: j.works_count,
      entity_type: 'source'
    }))

export const autocompleteAll = (q) => {
  const all = [
    ...autocompletePapers(q),
    ...autocompleteAuthors(q),
    ...autocompleteInstitutions(q),
    ...autocompleteConcepts(q),
    ...autocompleteJournals(q)
  ]
  return all.slice(0, 10)
}
