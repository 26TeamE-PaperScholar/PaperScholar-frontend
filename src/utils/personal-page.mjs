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

export function normalizeInterestId(interest) {
  const raw = interest && typeof interest === 'object'
    ? (interest.id ?? interest.key ?? interest.value ?? interest.interest_id ?? interest.pk)
    : interest
  const direct = Number(raw)
  if (Number.isInteger(direct)) return direct
  const matched = String(raw || '').match(/\d+/)
  return matched ? Number(matched[0]) : null
}

export function buildInterestSelectPayload(interests) {
  return {
    interests: (interests || [])
      .map(normalizeInterestId)
      .filter((id) => Number.isInteger(id))
  }
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
