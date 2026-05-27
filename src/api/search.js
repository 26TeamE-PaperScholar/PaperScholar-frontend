import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  paginate,
  searchPapers,
  searchAuthors,
  searchInstitutions,
  searchJournals,
  findPaper,
  findInstitution,
  findAuthor,
  mockTags
} from '../mock'
import { normalizeOpenAlexAuthorId } from '../utils/personal-page.mjs'

const url = {
  searchAuthors: '/search/authors/',
  searchConcepts: '/search/concepts/',
  searchInstitutions: '/search/institutions/',
  searchWorks: '/search/works/',
  searchSources: '/search/sources'
}

export class Search {
  static async searchAuthor(data) {
    if (USE_MOCK) {
      const list = searchAuthors(data || {})
      return mockResponse(paginate(list, data && data.page, data && data.per_page))
    }
    return service(url.searchAuthors, { method: 'get', params: data })
  }

  static async searchAuthorInfo(id) {
    const authorId = normalizeOpenAlexAuthorId(id)
    if (USE_MOCK) {
      const author = findAuthor(authorId)
      return mockResponse(author || {})
    }
    return service(url.searchAuthors + encodeURIComponent(authorId) + '/', { method: 'get' })
  }

  static async searchConcepts() {
    if (USE_MOCK) {
      return mockResponse({ results: mockTags })
    }
    return service(url.searchConcepts, { method: 'get' })
  }

  static async searchInstitutions(data) {
    if (USE_MOCK) {
      const list = searchInstitutions(data || {})
      return mockResponse(paginate(list, data && data.page, data && data.per_page))
    }
    return service(url.searchInstitutions, { method: 'get', params: data })
  }

  static async searchWorks(data) {
    if (USE_MOCK) {
      const list = searchPapers(data || {})
      return mockResponse(paginate(list, data && data.page, data && data.per_page))
    }
    return service(url.searchWorks, { method: 'get', params: data })
  }

  static async searchSources(data) {
    if (USE_MOCK) {
      const list = searchJournals(data || {})
      return mockResponse(paginate(list, data && data.page, data && data.per_page))
    }
    return service(url.searchSources, { method: 'get', params: data })
  }

  static async workRetrieve(id) {
    if (USE_MOCK) {
      const paper = findPaper(id)
      if (paper) {
        return mockResponse({
          ...paper,
          authorships: paper.authorships,
          related_works_api_url: paper.id ? '/mock/related/' + paper.id : ''
        })
      }
      return mockResponse({})
    }
    return service(url.searchWorks + id + '/', { method: 'get' })
  }

  static async institutionRetrieve(id) {
    if (USE_MOCK) {
      return mockResponse(findInstitution(id) || {})
    }
    return service(url.searchInstitutions + id + '/', { method: 'get' })
  }

  static async conceptRetrieve(id) {
    if (USE_MOCK) {
      const tag = mockTags.find((t) => t.id === id)
      return mockResponse(tag || {})
    }
    return service(url.searchConcepts + id + '/', { method: 'get' })
  }

  static async getEntities(_url) {
    if (USE_MOCK) {
      return mockResponse({ results: searchPapers({}).slice(0, 6) })
    }
    return service(_url, { method: 'get' })
  }

  static async getPagnationEntities(_url, data) {
    if (USE_MOCK) {
      const list = searchPapers(data || {})
      return mockResponse(paginate(list, data && data.page, data && data.per_page))
    }
    return service(_url, { method: 'get', params: data })
  }
}
