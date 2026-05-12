import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  mockHotspot,
  mockInterestList,
  mockInterestRecommend
} from '../mock'

const url = {
  hotspotRecommend: '/article/hotspot/recommend/',
  interest: '/article/interest/'
}

export class Article {
  static async getHotspotRecommend() {
    if (USE_MOCK) {
      return mockResponse(mockHotspot)
    }
    return service(url.hotspotRecommend, { method: 'get' })
  }

  static async getInterestList() {
    if (USE_MOCK) {
      return mockResponse(mockInterestList)
    }
    return service(url.interest + 'list/', { method: 'get' })
  }

  static async getInterestRecommend() {
    if (USE_MOCK) {
      return mockResponse(mockInterestRecommend)
    }
    return service(url.interest + 'recommend/', { method: 'get' })
  }

  static async modifyInterest(data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.interest + 'select/', { method: 'post', data })
  }
}
