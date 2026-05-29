function asArray(value) {
  return Array.isArray(value) ? value : []
}

function positiveInteger(value, fallback = 1) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.floor(n)
}

function timestampValueOf(item) {
  if (!item || typeof item !== 'object') return 0
  const raw = item.timestamp ?? item.searched_at ?? item.search_time ?? item.viewed_at ?? item.accessed_at ?? item.visited_at ?? item.created_at ?? item.updated_at ?? item.time ?? ''
  if (raw instanceof Date) return raw.getTime()
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw
  const value = String(raw || '').trim()
  if (!value) return 0

  const match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/)
  if (match) {
    const [, y, m, d, hh = '0', mm = '0', ss = '0'] = match
    return new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss)).getTime()
  }

  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function searchHistoryKeywordOf(item) {
  if (!item || typeof item !== 'object') return ''
  const raw = item.keyword ?? item.content ?? item.search ?? item.query ?? ''
  return String(raw).trim()
}

export function viewHistoryPaperIdOf(item) {
  if (!item || typeof item !== 'object') return ''
  const raw = item.paper_id ?? item.paperId ?? item.work_id ?? item.workId ?? item.paper?.id ?? item.work?.id ?? ''
  return String(raw).trim()
}

export function normalizeSearchHistory(items = []) {
  const byKeyword = new Map()

  asArray(items)
    .map((item, index) => {
      const keyword = searchHistoryKeywordOf(item)
      if (!keyword) return null
      return {
        ...item,
        id: item.id || item.pk || `search-history-${index}`,
        keyword,
        _historyIndex: index,
        _historyTime: timestampValueOf(item)
      }
    })
    .filter(Boolean)
    .forEach((item) => {
      const existing = byKeyword.get(item.keyword)
      if (!existing || item._historyTime > existing._historyTime) {
        byKeyword.set(item.keyword, item)
      }
    })

  return Array.from(byKeyword.values())
    .sort((a, b) => {
      if (a._historyTime !== b._historyTime) return b._historyTime - a._historyTime
      return a._historyIndex - b._historyIndex
    })
    .map(({ _historyIndex, _historyTime, ...item }) => item)
}

export function normalizeViewHistory(items = []) {
  const byPaper = new Map()

  asArray(items)
    .map((item, index) => {
      const paperId = viewHistoryPaperIdOf(item)
      if (!paperId) return null
      return {
        ...item,
        id: item.id || item.pk || `view-history-${index}`,
        paper_id: paperId,
        _historyIndex: index,
        _historyTime: timestampValueOf(item)
      }
    })
    .filter(Boolean)
    .forEach((item) => {
      const key = item.paper_id.toLowerCase()
      const existing = byPaper.get(key)
      if (!existing || item._historyTime > existing._historyTime) {
        byPaper.set(key, item)
      }
    })

  return Array.from(byPaper.values())
    .sort((a, b) => {
      if (a._historyTime !== b._historyTime) return b._historyTime - a._historyTime
      return a._historyIndex - b._historyIndex
    })
    .map(({ _historyIndex, _historyTime, ...item }) => item)
}

export function paginateList(items = [], page = 1, perPage = 5) {
  const list = asArray(items)
  const size = positiveInteger(perPage, 5)
  const total = list.length
  const totalPages = Math.max(1, Math.ceil(total / size))
  const currentPage = Math.min(positiveInteger(page, 1), totalPages)
  const start = (currentPage - 1) * size

  return {
    items: list.slice(start, start + size),
    currentPage,
    perPage: size,
    total,
    totalPages
  }
}
