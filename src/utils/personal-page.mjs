export function buildFollowPayload(userId) {
  return { user_id: userId }
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
