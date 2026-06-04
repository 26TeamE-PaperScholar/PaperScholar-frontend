import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  mockUser,
  mockFavorites,
  mockFollowing,
  findPaper
} from '../mock'

const url = {
  users: '/users/',
  follow: '/users/follow/',
  settings: '/users/settings/'
}

const cloneUser = () => JSON.parse(JSON.stringify(mockUser))
let mockFollowingState = JSON.parse(JSON.stringify(mockFollowing))
let mockFavoriteCounter = 1
const MOCK_FAVORITES_STORAGE_KEY = 'ps-mock-favorites-state'
const MOCK_AVATAR_STORAGE_KEY = 'ps-mock-avatar'

// mock 模式下头像持久化：存 dataURL 到 localStorage，刷新后仍可回显
function readMockAvatar() {
  if (typeof window === 'undefined' || !window.localStorage) return ''
  try {
    return window.localStorage.getItem(MOCK_AVATAR_STORAGE_KEY) || ''
  } catch (e) {
    return ''
  }
}

function writeMockAvatar(dataUrl) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    if (dataUrl) window.localStorage.setItem(MOCK_AVATAR_STORAGE_KEY, dataUrl)
  } catch (e) {}
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    if (!file || typeof FileReader === 'undefined') return resolve('')
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result || '')
    reader.onerror = () => resolve('')
    reader.readAsDataURL(file)
  })
}

// 从 FormData 或普通对象中取出 avatar 字段
function extractAvatar(_data) {
  if (!_data) return null
  if (typeof FormData !== 'undefined' && _data instanceof FormData) {
    return _data.get('avatar')
  }
  return _data.avatar || null
}

function clone(data) {
  return JSON.parse(JSON.stringify(data))
}

function readMockFavoritesState() {
  if (typeof window === 'undefined' || !window.localStorage) return clone(mockFavorites)
  try {
    const raw = window.localStorage.getItem(MOCK_FAVORITES_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : clone(mockFavorites)
  } catch (e) {
    return clone(mockFavorites)
  }
}

function writeMockFavoritesState() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(MOCK_FAVORITES_STORAGE_KEY, JSON.stringify(mockFavoritesState))
  } catch (e) {}
}

let mockFavoritesState = readMockFavoritesState()

export class User {
  static async getUserList() {
    if (USE_MOCK) {
      return mockResponse([cloneUser()])
    }
    return service(url.users, { method: 'get' })
  }

  static async getUser(_id) {
    if (USE_MOCK) {
      const user = cloneUser()
      const avatar = readMockAvatar()
      if (avatar) user.avatar = avatar
      return mockResponse(user)
    }
    return service(url.users + _id + '/', { method: 'get' })
  }

  static async updateUser(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.users + _id + '/', { method: 'put', data: _data })
  }

  static async changePersonalInfo(_id, _data) {
    if (USE_MOCK) {
      const avatar = extractAvatar(_data)
      if (avatar instanceof Blob) {
        const dataUrl = await fileToDataUrl(avatar)
        writeMockAvatar(dataUrl)
        return mockResponse({ ok: true, avatar: dataUrl })
      }
      if (typeof avatar === 'string' && avatar) {
        writeMockAvatar(avatar)
      }
      return mockResponse({ ok: true })
    }
    return service(url.users + _id + '/', { method: 'patch', data: _data })
  }

  static async getUserAvatar(_id, _data) {
    if (USE_MOCK) {
      return mockResponse('')
    }
    return service(url.users + _id + '/avatar/', { method: 'get', data: _data })
  }

  static async getUserFollowers(_id) {
    if (USE_MOCK) {
      return mockResponse([])
    }
    return service(url.users + _id + '/followers/', { method: 'get' })
  }

  static async getUserFollowing(_id) {
    if (USE_MOCK) {
      return mockResponse(JSON.parse(JSON.stringify(mockFollowingState)))
    }
    return service(url.users + _id + '/following/', { method: 'get' })
  }

  static async followUser(_data) {
    if (USE_MOCK) {
      const targetId = _data && (_data.openalex_id || _data.user_id)
      const existing = mockFollowingState.find((item) => item.id === targetId)
      if (existing) {
        existing.is_followed = true
      } else if (targetId) {
        mockFollowingState.unshift({
          id: targetId,
          display_name: targetId,
          institution: '',
          followed_at: new Date().toISOString().slice(0, 10),
          is_followed: true
        })
      }
      return mockResponse({ ok: true })
    }
    return service(url.follow, { method: 'post', data: _data })
  }

  static async cancelFollowUser(_data) {
    if (USE_MOCK) {
      const targetId = _data && (_data.openalex_id || _data.user_id)
      mockFollowingState = mockFollowingState.filter((item) => item.id !== targetId)
      return mockResponse({ ok: true })
    }
    return service(url.follow, { method: 'delete', data: _data })
  }

  static async getUserSettings() {
    if (USE_MOCK) {
      return mockResponse({ theme: 'light', locale: 'zh' })
    }
    return service(url.settings, { method: 'get' })
  }

  static async updateUserSettings(_data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.settings, { method: 'put', data: _data })
  }

  static async updateUserSettingsPartial(_data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.settings, { method: 'patch', data: _data })
  }

  static async getFavorite(_id, options = {}) {
    if (USE_MOCK) {
      const fav = mockFavoritesState.find((f) => String(f.id) === String(_id))
      if (!fav) return mockResponse({ id: _id, name: '', paper_ids: [], papers: [] })
      const papers = (fav.paper_ids || []).map((pid) => findPaper(pid)).filter(Boolean)
      return mockResponse({ ...fav, papers })
    }
    return service(url.users + 'favorite/' + _id + '/', {
      method: 'get',
      params: options.cacheBust ? { _t: Date.now() } : undefined
    })
  }

  static async getFavoriteList(_id, options = {}) {
    if (USE_MOCK) {
      const fav = mockFavoritesState.find((f) => String(f.id) === String(_id))
      if (fav) {
        const papers = (fav.paper_ids || []).map((pid) => {
          const paper = findPaper(pid) || { id: pid, title: pid }
          return {
            ...paper,
            id: pid,
            paper_id: pid,
            favorite_id: `${fav.id}:${pid}`,
            folder_id: fav.id,
            is_paper: true
          }
        })
        return mockResponse(papers)
      }
      return mockResponse(clone(mockFavoritesState))
    }
    return service(url.users + 'favorite/list/' + _id + '/', {
      method: 'get',
      params: options.cacheBust ? { _t: Date.now() } : undefined
    })
  }

  static async createFavorite(parentId, _data) {
    if (USE_MOCK) {
      const favorite = {
        id: 'F-mock-' + Date.now() + '-' + mockFavoriteCounter++,
        name: (_data && _data.name) || 'Untitled favorite',
        paper_ids: [],
        showContextMenu: false
      }
      mockFavoritesState.unshift(favorite)
      writeMockFavoritesState()
      return mockResponse(favorite)
    }
    return service(url.users + 'favorite/create/' + parentId + '/', { method: 'post', data: _data })
  }

  static async collectFavorite(_id, _data) {
    if (USE_MOCK) {
      const favorite = mockFavoritesState.find((item) => String(item.id) === String(_id))
      const paperId = _data && (_data.paper_id || _data.paperId || _data.id)
      if (favorite && paperId) {
        favorite.paper_ids = Array.from(new Set([...(favorite.paper_ids || []), String(paperId)]))
        writeMockFavoritesState()
      }
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/collect/' + _id + '/', { method: 'post', data: _data })
  }

  static async uncollectFavorite(_id, _data) {
    if (USE_MOCK) {
      const favorite = mockFavoritesState.find((item) => String(item.id) === String(_id))
      const paperId = _data && (_data.paper_id || _data.paperId || _data.id)
      if (favorite && paperId) {
        favorite.paper_ids = (favorite.paper_ids || []).filter((id) => String(id) !== String(paperId))
        writeMockFavoritesState()
      }
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/collect/' + _id + '/', { method: 'delete', data: _data })
  }

  static async renameFavorite(_id, _data) {
    if (USE_MOCK) {
      const favorite = mockFavoritesState.find((item) => String(item.id) === String(_id))
      if (favorite && _data && _data.name) {
        favorite.name = _data.name
        writeMockFavoritesState()
      }
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/rename/' + _id + '/', { method: 'post', data: _data })
  }

  static async deleteFavorite(_id, _data = {}) {
    if (USE_MOCK) {
      const paperId = _data && (_data.paper_id || _data.paperId || _data.id)
      const folderId = _data && (_data.folder_id || _data.folderId || _data.favorite_folder_id || _data.favoriteFolderId)
      if (paperId) {
        const favorite = mockFavoritesState.find((item) =>
          String(item.id) === String(folderId) ||
            String(_id).startsWith(String(item.id) + ':')
        )
        if (favorite) {
          favorite.paper_ids = (favorite.paper_ids || []).filter((id) => String(id) !== String(paperId))
        }
      } else {
        mockFavoritesState = mockFavoritesState.filter((item) => String(item.id) !== String(_id))
      }
      writeMockFavoritesState()
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/delete/' + _id + '/', {
      method: 'delete',
      data: _data
    })
  }
}
