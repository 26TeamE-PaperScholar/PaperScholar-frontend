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
      return mockResponse(mockFollowing)
    }
    return service(url.users + _id + '/following/', { method: 'get' })
  }

  static async followUser(_data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.follow, { method: 'post', data: _data })
  }

  static async cancelFollowUser(_data) {
    if (USE_MOCK) {
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
      const fav = mockFavorites.find((f) => f.id === _id) || mockFavorites[0]
      const papers = (fav.paper_ids || []).map((pid) => findPaper(pid)).filter(Boolean)
      return mockResponse({ ...fav, papers })
    }
    return service(url.users + 'favorite/' + _id + '/', { method: 'get' })
  }

  static async getFavoriteList(_id) {
    if (USE_MOCK) {
      return mockResponse(JSON.parse(JSON.stringify(mockFavorites)))
    }
    return service(url.users + 'favorite/list/' + _id + '/', { method: 'get' })
  }

  static async createFavorite(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ id: 'F-mock-' + Date.now(), ..._data })
    }
    return service(url.users + 'favorite/create/' + _id + '/', { method: 'post', data: _data })
  }

  static async collectFavorite(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/collect/' + _id + '/', { method: 'post', data: _data })
  }

  static async renameFavorite(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/rename/' + _id + '/', { method: 'post', data: _data })
  }

  static async deleteFavorite(_id) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.users + 'favorite/delete/' + _id + '/', { method: 'delete' })
  }
}
