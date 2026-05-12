import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  autocompleteAll,
  autocompletePapers,
  autocompleteAuthors,
  autocompleteInstitutions,
  autocompleteConcepts
} from '../mock'

const url = {
  autoComplete: '/autocomplete/'
}

export class AutoComplete {
  static async getAutoAllInfo(data) {
    if (USE_MOCK) {
      return mockResponse({ results: autocompleteAll((data && data.q) || '') }, { min: 80, max: 220 })
    }
    return service(url.autoComplete, { method: 'get', params: data })
  }

  static async getAutoAuthor(data) {
    if (USE_MOCK) {
      return mockResponse({ results: autocompleteAuthors((data && data.q) || '') }, { min: 80, max: 220 })
    }
    return service(url.autoComplete + 'authors/', { method: 'get', params: data })
  }

  static async getAutoConcepts(data) {
    if (USE_MOCK) {
      return mockResponse({ results: autocompleteConcepts((data && data.q) || '') }, { min: 80, max: 220 })
    }
    return service(url.autoComplete + 'concepts/', { method: 'get', params: data })
  }

  static async getAutoInstitutions(data) {
    if (USE_MOCK) {
      return mockResponse({ results: autocompleteInstitutions((data && data.q) || '') }, { min: 80, max: 220 })
    }
    return service(url.autoComplete + 'institutions/', { method: 'get', params: data })
  }

  static async getAutoWorks(data) {
    if (USE_MOCK) {
      return mockResponse({ results: autocompletePapers((data && data.q) || '') }, { min: 80, max: 220 })
    }
    return service(url.autoComplete + 'works/', { method: 'get', params: data })
  }
}
