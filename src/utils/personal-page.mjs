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

const DIRECT_AVATAR_KEYS = [
  'avatar_url',
  'avatarUrl',
  'avatar_path',
  'avatarPath',
  'profile_image',
  'profileImage',
  'image_url',
  'imageUrl',
  'photo_url',
  'photoUrl',
  'picture',
  'picture_url',
  'pictureUrl'
]

const AVATAR_OBJECT_KEYS = [
  ...DIRECT_AVATAR_KEYS,
  'url',
  'path',
  'src'
]

const AVATAR_CONTAINER_KEYS = [
  'data',
  'user',
  'profile',
  'result',
  'payload'
]

function avatarCandidateFrom(value, keys, seen = new Set()) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return ''
  if (seen.has(value)) return ''
  seen.add(value)

  for (const key of keys) {
    const candidate = avatarCandidateFrom(value[key], AVATAR_OBJECT_KEYS, seen)
    if (candidate) return candidate
  }

  return ''
}

function avatarUrlCandidateOf(value, seen = new Set()) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value !== 'object') return ''
  if (seen.has(value)) return ''
  seen.add(value)

  for (const key of DIRECT_AVATAR_KEYS) {
    const direct = avatarCandidateFrom(value[key], AVATAR_OBJECT_KEYS, seen)
    if (direct) return direct
  }

  const avatar = avatarCandidateFrom(value.avatar, AVATAR_OBJECT_KEYS, seen)
  if (avatar) return avatar

  for (const key of AVATAR_CONTAINER_KEYS) {
    const candidate = avatarUrlCandidateOf(value[key], seen)
    if (candidate) return candidate
  }

  return ''
}

export function appendCacheBust(url, cacheBust) {
  const normalizedUrl = String(url || '').trim()
  if (!normalizedUrl || !cacheBust) return normalizedUrl
  if (/^(blob:|data:)/i.test(normalizedUrl)) return normalizedUrl
  const separator = normalizedUrl.includes('?') ? '&' : '?'
  return `${normalizedUrl}${separator}_t=${encodeURIComponent(cacheBust)}`
}

export function normalizeAvatarUrl(value) {
  const raw = String(avatarUrlCandidateOf(value) || '').trim()
  if (!raw || raw === 'null' || raw === 'undefined') return ''
  if (/^(blob:|data:image\/|https?:\/\/|\/\/)/i.test(raw)) return raw
  if (raw.startsWith('/')) return raw
  if (/^api\//i.test(raw)) return `/${raw}`
  return `/api/${raw.replace(/^\/+/, '')}`
}

export function avatarEndpointForUser(userId, cacheBust = '') {
  const id = String(userId || '').trim()
  if (!id) return ''
  return appendCacheBust(`/api/users/${encodeURIComponent(id)}/avatar/`, cacheBust)
}

export function resolveUserAvatarUrl(user, userId = '', options = {}) {
  const avatarUrl = normalizeAvatarUrl(user)
  if (avatarUrl) return appendCacheBust(avatarUrl, options.cacheBust)
  if (options.fallbackToEndpoint === false) return ''

  const resolvedId = userId || (user && typeof user === 'object' && (
    user.id ||
    user.user_id ||
    user.userId ||
    user.pk
  ))
  return avatarEndpointForUser(resolvedId, options.cacheBust)
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
  return normalizeFavoriteList(items).map((item) => ({
    id: item.id,
    name: item.name,
    pending: !!item.pending,
    paper_ids: [...(item.paper_ids || [])],
    paper_count: item.paper_count || 0,
    showContextMenu: !!item.showContextMenu
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

export function buildFavoriteCollectPayload(paperId) {
  return { paper_id: String(paperId || '').trim() }
}

export function unwrapApiPayload(response) {
  const raw = response && typeof response === 'object' && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : response
  if (!raw || Array.isArray(raw) || typeof raw !== 'object') return raw
  if (
    Object.prototype.hasOwnProperty.call(raw, 'data') &&
    (Object.prototype.hasOwnProperty.call(raw, 'code') ||
      Object.prototype.hasOwnProperty.call(raw, 'message') ||
      Array.isArray(raw.data) ||
      (raw.data && typeof raw.data === 'object'))
  ) {
    return raw.data
  }
  return raw
}

export function normalizeFavoriteId(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function favoriteIdOf(item) {
  if (!item || typeof item !== 'object') return ''
  return normalizeFavoriteId(
    item.id ??
      item.favorite_id ??
      item.favoriteId ??
      item.folder_id ??
      item.folderId ??
      item.pk ??
      item.uuid ??
      item.slug
  )
}

export function paperIdOf(item) {
  if (!item || typeof item !== 'object') return normalizeFavoriteId(item)
  return normalizeFavoriteId(
    item.paper_id ??
      item.paperId ??
      item.openalex_id ??
      item.openalexId ??
      item.work_id ??
      item.workId ??
      (item.ids && item.ids.openalex) ??
      item.id
  )
}

export function normalizePaperIds(item) {
  const raw = item && typeof item === 'object'
    ? (item.paper_ids || item.paperIds || item.paper_id_list || item.paperIdList || [])
    : []
  const ids = Array.isArray(raw) ? raw.map(paperIdOf) : []
  if (item && Array.isArray(item.papers)) ids.push(...item.papers.map(paperIdOf))
  const seen = new Set()
  return ids.filter((id) => {
    if (!id || seen.has(id)) return false
    seen.add(id)
    return true
  })
}

export function favoritePaperCountOf(item) {
  if (!item || typeof item !== 'object') return 0
  const ids = normalizePaperIds(item)
  const rawCount = item.paper_count ??
    item.paperCount ??
    item.papers_count ??
    item.papersCount ??
    item.work_count ??
    item.workCount ??
    item.works_count ??
    item.worksCount ??
    item.total_papers ??
    item.totalPapers
  const count = Number(rawCount)
  return Math.max(ids.length, Number.isFinite(count) && count > 0 ? count : 0)
}

function favoriteListFromPayload(payload) {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []
  const candidates = [
    payload.items,
    payload.results,
    payload.favorites,
    payload.favourites,
    payload.favorite_list,
    payload.favourite_list,
    payload.list,
    payload.data
  ]
  return candidates.find(Array.isArray) || []
}

export function normalizeFavoriteItem(item, fallback = {}) {
  const source = item && typeof item === 'object' ? item : {}
  const fallbackSource = fallback && typeof fallback === 'object' ? fallback : {}
  const id = favoriteIdOf(source) || favoriteIdOf(fallbackSource)
  const name = normalizeFavoriteName(
    source.name ??
      source.title ??
      source.folder_name ??
      source.folderName ??
      fallbackSource.name ??
      fallbackSource.title
  )
  return {
    ...source,
    id,
    name,
    paper_ids: normalizePaperIds(source).length ? normalizePaperIds(source) : normalizePaperIds(fallbackSource),
    paper_count: Math.max(favoritePaperCountOf(source), favoritePaperCountOf(fallbackSource)),
    showContextMenu: !!source.showContextMenu,
    pending: !!source.pending
  }
}

export function normalizeFavoriteList(items) {
  const seenIds = new Set()
  const seenAnonymous = new Set()
  return favoriteListFromPayload(items)
    .map((item) => normalizeFavoriteItem(item))
    .filter((item) => item.id || item.name)
    .filter((item) => {
      if (item.id) {
        if (seenIds.has(item.id)) return false
        seenIds.add(item.id)
        return true
      }
      const anonymousKey = item.name.toLowerCase()
      if (seenAnonymous.has(anonymousKey)) return false
      seenAnonymous.add(anonymousKey)
      return true
    })
}

export function normalizeFavoriteListResponse(response) {
  return normalizeFavoriteList(unwrapApiPayload(response))
}

export function upsertFavoriteInList(list, favorite) {
  const normalized = normalizeFavoriteItem(favorite)
  if (!normalized.id && !normalized.name) return normalizeFavoriteList(list)
  const items = normalizeFavoriteList(list)
  const index = normalized.id
    ? items.findIndex((item) => item.id === normalized.id)
    : items.findIndex((item) => !item.id && item.name.toLowerCase() === normalized.name.toLowerCase())
  if (index === -1) return [normalized, ...items]
  const next = [...items]
  next.splice(index, 1, {
      ...items[index],
      ...normalized,
      paper_ids: normalized.paper_ids.length ? normalized.paper_ids : items[index].paper_ids,
      paper_count: Math.max(normalized.paper_count || 0, items[index].paper_count || 0)
    })
  return normalizeFavoriteList(next)
}

export function replaceFavoriteInList(list, oldId, favorite) {
  const normalized = normalizeFavoriteItem(favorite)
  const targetId = normalizeFavoriteId(oldId)
  const items = normalizeFavoriteList(list).filter((item) => !targetId || item.id !== targetId)
  return upsertFavoriteInList(items, normalized)
}

export function removeFavoriteFromList(list, favoriteId) {
  const targetId = normalizeFavoriteId(favoriteId)
  return normalizeFavoriteList(list).filter((item) => item.id !== targetId)
}

export function setFavoritePaperMembership(list, favoriteId, paperId, shouldContain) {
  const targetId = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paperId)
  if (!targetId || !normalizedPaperId) return normalizeFavoriteList(list)
  return normalizeFavoriteList(list).map((item) => {
    if (item.id !== targetId) return item
    const paperIds = new Set(item.paper_ids || [])
    if (shouldContain) paperIds.add(normalizedPaperId)
    else paperIds.delete(normalizedPaperId)
    return {
      ...item,
      paper_ids: Array.from(paperIds),
      paper_count: paperIds.size
    }
  })
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
  const data = unwrapApiPayload(response) || {}
  const item = data.favorite || data.favourite || data.item || data.folder || data
  return normalizeFavoriteItem(item, {
    id: fallbackId,
    name: fallbackName,
    paper_ids: []
  })
}

export function extractFavoriteDetail(response, fallbackId = '', fallback = {}) {
  const payload = unwrapApiPayload(response) || {}
  const data = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {}
  const item = data.favorite || data.favourite || data.item || data.folder || data
  const fallbackFavorite = fallback && typeof fallback === 'object' ? fallback : {}
  const dataPaperIds = normalizePaperIds(data)
  const favorite = normalizeFavoriteItem(item, {
    ...fallbackFavorite,
    id: fallbackId || favoriteIdOf(fallbackFavorite),
    paper_ids: dataPaperIds.length ? dataPaperIds : normalizePaperIds(fallbackFavorite)
  })
  const candidates = [
    Array.isArray(payload) ? payload : null,
    item.papers,
    item.works,
    item.items,
    item.results,
    item.children,
    item.contents,
    data.papers,
    data.works,
    data.items,
    data.results,
    data.children,
    data.contents,
    data.favorite_papers,
    data.favourite_papers
  ].filter(Array.isArray)
  const papers = (candidates.find((list) => list.some((paper) => {
    if (!paper || typeof paper !== 'object') return Boolean(paperIdOf(paper))
    if (paper.is_paper === false) return false
    return Boolean(
      paperIdOf(paper) &&
        (paper.is_paper === true ||
          paper.paper_id ||
          paper.paperId ||
          paper.openalex_id ||
          paper.openalexId ||
          paper.work_id ||
          paper.workId ||
          paper.favorite_id ||
          paper.favoriteId ||
          paper.title ||
          paper.abstract ||
          paper.doi)
    )
  })) || [])
  return {
    favorite,
    papers: papers.map((paper) => {
      const source = paper && typeof paper === 'object' ? paper : { id: paper }
      const folderId = source.folder_id || source.folderId
      return {
        ...source,
        id: paperIdOf(source),
        favorite_id: source.favorite_id || source.favoriteId || favorite.id,
        ...(folderId ? { folder_id: folderId } : {})
      }
    }).filter((paper) => paper.id)
  }
}
