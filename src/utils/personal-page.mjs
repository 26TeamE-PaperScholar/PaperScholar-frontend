export function normalizeOpenAlexAuthorId(authorId) {
  return String(authorId || '')
    .trim()
    .replace(/^https?:\/\/(?:api\.)?openalex\.org\/(?:authors\/)?/i, '')
}

export function normalizeOpenAlexWorkId(workId) {
  return String(workId || '')
    .trim()
    .replace(/^https?:\/\/(?:api\.)?openalex\.org\/(?:works\/)?/i, '')
}

export function normalizeDoi(doi) {
  return String(doi || '')
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
}

export function normalizeTitleForMatch(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function buildFollowPayload(authorId) {
  return { openalex_id: normalizeOpenAlexAuthorId(authorId) }
}

export function authorIdOf(authorshipOrAuthor) {
  if (!authorshipOrAuthor || typeof authorshipOrAuthor !== 'object') return ''
  const author = authorshipOrAuthor.author && typeof authorshipOrAuthor.author === 'object'
    ? authorshipOrAuthor.author
    : authorshipOrAuthor
  return normalizeOpenAlexAuthorId(
    author.id ||
      author.openalex_id ||
      author.openalexId ||
      author.author_id ||
      author.authorId ||
      (author.ids && author.ids.openalex) ||
      authorshipOrAuthor.author_id ||
      authorshipOrAuthor.authorId ||
      authorshipOrAuthor.openalex_id ||
      authorshipOrAuthor.openalexId ||
      authorshipOrAuthor.id
  )
}

export function authorNameOf(authorshipOrAuthor) {
  if (!authorshipOrAuthor || typeof authorshipOrAuthor !== 'object') return ''
  const author = authorshipOrAuthor.author && typeof authorshipOrAuthor.author === 'object'
    ? authorshipOrAuthor.author
    : authorshipOrAuthor
  return author.display_name || author.name || authorshipOrAuthor.display_name || authorshipOrAuthor.name || ''
}

export function authorOrcidOf(authorshipOrAuthor) {
  if (!authorshipOrAuthor || typeof authorshipOrAuthor !== 'object') return ''
  const author = authorshipOrAuthor.author && typeof authorshipOrAuthor.author === 'object'
    ? authorshipOrAuthor.author
    : authorshipOrAuthor
  return String(author.orcid || authorshipOrAuthor.orcid || '').trim().toLowerCase()
}

export function workIdOf(work) {
  if (!work || typeof work !== 'object') return ''
  return normalizeOpenAlexWorkId(
    work.id ||
      work.openalex_id ||
      work.openalexId ||
      work.work_id ||
      work.workId ||
      work.paper_id ||
      work.paperId ||
      (work.ids && work.ids.openalex)
  )
}

export function workDoiOf(work) {
  if (!work || typeof work !== 'object') return ''
  return normalizeDoi(
    work.doi ||
      work.doi_url ||
      work.doiUrl ||
      (work.ids && work.ids.doi)
  )
}

export function authorWorksFilter(authorId) {
  const id = normalizeOpenAlexAuthorId(authorId)
  return id ? `author.id:${id}` : ''
}

export function workBelongsToAuthor(work, author) {
  const authorId = normalizeOpenAlexAuthorId(author && author.id)
  const authorName = String((author && (author.display_name || author.nickName || author.name)) || '')
    .trim()
    .toLowerCase()
  const authorOrcid = String((author && author.orcid) || '').trim().toLowerCase()
  const authorships = Array.isArray(work && work.authorships) ? work.authorships : []

  if (!authorships.length) return false
  return authorships.some((authorship) => {
    const id = authorIdOf(authorship)
    if (authorId && id === authorId) return true

    const orcid = authorOrcidOf(authorship)
    if (authorOrcid && orcid && orcid === authorOrcid) return true

    const name = authorNameOf(authorship).trim().toLowerCase()
    return Boolean(authorName && name && name === authorName)
  })
}

export function dedupeWorks(works = []) {
  const seen = new Set()
  const output = []

  ;(works || []).forEach((work) => {
    if (!work || typeof work !== 'object') return
    const keys = []
    const workId = workIdOf(work)
    const doi = workDoiOf(work)
    const title = normalizeTitleForMatch(work.title || work.display_name)

    if (workId) keys.push(`id:${workId}`)
    if (doi) keys.push(`doi:${doi}`)
    if (title && title.length >= 12) keys.push(`title:${title}`)

    if (keys.length && keys.some((key) => seen.has(key))) return
    keys.forEach((key) => seen.add(key))
    output.push(work)
  })

  return output
}

export function pickAuthorSearchResult(authorshipOrAuthor, results = []) {
  const name = authorNameOf(authorshipOrAuthor).trim().toLowerCase()
  const orcid = authorOrcidOf(authorshipOrAuthor)
  const items = (results || []).filter((item) => authorIdOf(item))
  if (!items.length) return null
  if (orcid) {
    const matchedOrcid = items.find((item) => authorOrcidOf(item) === orcid)
    if (matchedOrcid) return matchedOrcid
  }
  if (name) {
    const matchedName = items.find((item) => authorNameOf(item).trim().toLowerCase() === name)
    if (matchedName) return matchedName
  }
  return items[0]
}

export function scholarPortalPath(author) {
  const id = authorIdOf(author)
  return id ? `/scholar_portal/${encodeURIComponent(id)}` : ''
}

export function buildProfileUpdatePayload(personalInfo) {
  return {
    username: personalInfo.nickName,
    real_name: personalInfo.realName,
    gender: personalInfo.gender,
    institution: personalInfo.institution,
    email: personalInfo.email,
    websites: personalInfo.urls
  }
}

export function normalizeFavoriteChoices(items) {
  return (items || []).map((item) => ({
    id: item.id,
    name: item.name
  }))
}

export function shouldFetchOnShowChange(show, oldShow) {
  return !!show && show !== oldShow
}

export function normalizeFavoriteName(name) {
  return String(name || '').trim()
}

export function buildFavoriteCreatePayload(name) {
  return { name: normalizeFavoriteName(name) }
}

export function normalizeInterestName(name) {
  return String(name || '').trim().toLowerCase()
}

export function interestNameOf(interest) {
  if (!interest || typeof interest !== 'object') return ''
  return interest.name || interest.display_name || interest.label || interest.name_zh || ''
}

export function normalizeConceptId(conceptId) {
  const value = String(conceptId || '').trim()
  return value.replace(/^https?:\/\/openalex\.org\//, '')
}

export function conceptIdOf(interest) {
  if (!interest || typeof interest !== 'object') return ''
  return normalizeConceptId(
    interest.concept_id ||
      interest.conceptId ||
      interest.openalex_id ||
      interest.openalexId ||
      interest.external_id ||
      interest.externalId ||
      interest.id
  )
}

export function flattenInterestList(items) {
  const result = []
  ;(items || []).forEach((item) => {
    if (!item || typeof item !== 'object') return
    if (item.id != null && (item.name || item.display_name || item.label)) {
      result.push(item)
      return
    }
    Object.keys(item).forEach((categoryName) => {
      const children = item[categoryName]
      if (!Array.isArray(children)) return
      children.forEach((child) => {
        if (child && typeof child === 'object') {
          result.push({
            ...child,
            category: categoryName
          })
        }
      })
    })
  })
  return result
}

export function buildInterestLookup(interestList) {
  const byId = new Map()
  const byName = new Map()
  const byConceptId = new Map()
  flattenInterestList(interestList).forEach((item) => {
    const id = Number(item.id)
    if (!Number.isInteger(id)) return
    byId.set(id, id)
    ;[item.name, item.display_name, item.label, item.name_zh].forEach((name) => {
      const normalized = normalizeInterestName(name)
      if (normalized) byName.set(normalized, id)
    })
    ;[item.concept_id, item.conceptId, item.openalex_id, item.openalexId, item.external_id, item.externalId].forEach((conceptId) => {
      const normalized = normalizeConceptId(conceptId)
      if (normalized) byConceptId.set(normalized, id)
    })
  })
  return { byId, byName, byConceptId }
}

export function normalizeInterestId(interest, interestList = []) {
  const lookup = buildInterestLookup(interestList)
  const raw = interest && typeof interest === 'object'
    ? (interest.pk ?? interest.interest_id ?? interest.key ?? interest.value ?? interest.id)
    : interest
  const numeric = Number(raw)
  if (Number.isInteger(numeric) && (!interestList.length || lookup.byId.has(numeric))) {
    return numeric
  }
  if (interest && typeof interest === 'object') {
    const conceptId = conceptIdOf(interest)
    const matchedConceptId = lookup.byConceptId.get(conceptId)
    if (matchedConceptId != null) return matchedConceptId
    const names = [
      interestNameOf(interest),
      interest.name,
      interest.display_name,
      interest.label,
      interest.name_zh
    ]
    for (const name of names) {
      const matched = lookup.byName.get(normalizeInterestName(name))
      if (matched != null) return matched
    }
  }
  return null
}

export function buildInterestSelectPayload(interests, interestList = []) {
  const seen = new Set()
  const ids = []
  ;(interests || []).forEach((interest) => {
    const id = normalizeInterestId(interest, interestList)
    if (!Number.isInteger(id) || seen.has(id)) return
    seen.add(id)
    ids.push(id)
  })
  return {
    interests: ids
  }
}

export function buildInterestDeletePayload(interest, interestList = []) {
  const interestId = normalizeInterestId(interest, interestList)
  if (Number.isInteger(interestId)) return { interest_id: interestId }
  const conceptId = conceptIdOf(interest)
  return conceptId ? { concept_id: conceptId } : {}
}

export function extractCreatedFavorite(response, fallbackName, fallbackId = '') {
  const data = (response && response.data) || {}
  const item = data.favorite || data.item || data
  return {
    id: item.id || fallbackId,
    name: item.name || normalizeFavoriteName(fallbackName),
    paper_ids: item.paper_ids || [],
    showContextMenu: false
  }
}
