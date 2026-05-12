import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  mockSearchHistory,
  mockViewHistory,
  mockRelationMap
} from '../mock'

const url = {
  searchHistory: '/history/search_history/',
  viewHistory: '/history/view_history/',
  relationMap: '/history/get_relation_map/'
}

export class History {
  static async getSearchHistory() {
    if (USE_MOCK) {
      return mockResponse(mockSearchHistory)
    }
    return service(url.searchHistory, { method: 'get' })
  }

  static async getViewHistory() {
    if (USE_MOCK) {
      return mockResponse(mockViewHistory)
    }
    return service(url.viewHistory, { method: 'get' })
  }

  static async getRelationMap(_id) {
    if (USE_MOCK) {
      return mockResponse(mockRelationMap)
    }
    return service(url.relationMap + _id + '/', { method: 'get' })
  }
}
