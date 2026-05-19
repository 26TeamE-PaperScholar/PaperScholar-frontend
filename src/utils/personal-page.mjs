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
