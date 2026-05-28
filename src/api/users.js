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
let mockFavoritesState = JSON.parse(JSON.stringify(mockFavorites))

export class User {
  static async getUserList() {
    if (USE_MOCK) {
      return mockResponse([cloneUser()])
    }
    return service(url.users, { method: 'get' })
  }

  static async getUser(_id) {
    if (USE_MOCK) {
      return mockResponse(cloneUser())
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

  static async getFavorite(_id) {
    if (USE_MOCK) {
      const fav = mockFavoritesState.find((f) => f.id === _id) || mockFavoritesState[0]
      const papers = (fav.paper_ids || []).map((pid) => findPaper(pid)).filter(Boolean)
      return mockResponse({ ...fav, papers })
    }
    return service(url.users + 'favorite/' + _id + '/', { method: 'get' })
  }

  static async getFavoriteList(_id) {
    if (USE_MOCK) {
      return mockResponse(JSON.parse(JSON.stringify(mockFavoritesState)))
    }
    return service(url.users + 'favorite/list/' + _id + '/', { method: 'get' })
  }

  static async createFavorite(parentId, _data) {
    if (USE_MOCK) {
      const favorite = {
        id: 'F-mock-' + Date.now(),
        name: (_data && _data.name) || 'Untitled favorite',
        paper_ids: [],
        showContextMenu: false
      }
      mockFavoritesState.unshift(favorite)
      return mockResponse(favorite)
    }
    return service(url.users + 'favorite/create/' + parentId + '/', { method: 'post', data: _data })
  }

  static async collectFavorite(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/collect/' + _id + '/', { method: 'post', data: _data })
  }

  static async renameFavorite(_id, _data) {
    if (USE_MOCK) {
      const favorite = mockFavoritesState.find((item) => item.id === _id)
      if (favorite && _data && _data.name) favorite.name = _data.name
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/rename/' + _id + '/', { method: 'post', data: _data })
  }

  static async deleteFavorite(_id) {
    if (USE_MOCK) {
      mockFavoritesState = mockFavoritesState.filter((item) => item.id !== _id)
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/delete/' + _id + '/', { method: 'delete' })
  }
}
