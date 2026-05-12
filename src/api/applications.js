import service from '../http'
import { USE_MOCK, mockResponse, mockAuditList, mockSubmittedApplications, paginate } from '../mock'

const url = {
  applications: '/applications/',
  audited: '/applications/audited/',
  submitted: '/applications/submitted/'
}

export class Application {
  static async applications(_data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.applications, { method: 'post', data: _data })
  }

  static async getAuditedList(_data) {
    if (USE_MOCK) {
      return mockResponse(paginate(mockAuditList, _data && _data.page, _data && _data.per_page))
    }
    return service(url.audited, { method: 'get', params: _data })
  }

  static async getAuditedById(_id) {
    if (USE_MOCK) {
      const app = mockAuditList.find((a) => a.id === _id) || null
      return mockResponse(app)
    }
    return service(url.audited + _id + '/', { method: 'get' })
  }

  static async approveAudited(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.audited + _id + '/approve/', { method: 'patch', data: _data })
  }

  static async failAudited(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.audited + _id + '/fail/', { method: 'patch', data: _data })
  }

  static async getSubmittedList() {
    if (USE_MOCK) {
      return mockResponse(JSON.parse(JSON.stringify(mockSubmittedApplications)))
    }
    return service(url.submitted, { method: 'get' })
  }

  static async getSubmittedById(_id) {
    if (USE_MOCK) {
      const app = mockSubmittedApplications.find((a) => a.id === _id) || null
      return mockResponse(app)
    }
    return service(url.submitted + _id + '/', { method: 'get' })
  }

  static async deleteSubmittedById(_id) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.submitted + _id + '/', { method: 'delete' })
  }
}
