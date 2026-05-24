export function normalizeOpenAlexAuthorId(authorId) {
  return String(authorId || '').replace(/^https?:\/\/openalex\.org\//, '')
}

export function buildFollowPayload(authorId) {
  return { openalex_id: normalizeOpenAlexAuthorId(authorId) }
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
