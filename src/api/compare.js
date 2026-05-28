import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  mockCompareExtract,
  getCompareMeta
} from '../mock'

const url = {
  extract: '/compare/extract/'
}

export class Compare {
  /**
   * 横向对比抽取。
   * @param {string[]} paperIds
   * @returns {Promise<{data: {matrix, restricted_papers, comparability_warning, missing_papers}}>}
   */
  static async extract(paperIds) {
    if (!Array.isArray(paperIds) || paperIds.length < 2) {
      throw new Error('paperIds requires at least 2 items')
    }
    if (USE_MOCK) {
      return mockResponse(mockCompareExtract(paperIds), { min: 350, max: 750 })
    }
    return service(url.extract, { method: 'post', data: { paper_ids: paperIds } })
  }

  /**
   * 对比页 hero 展示所需的论文元信息。
   * 真接口阶段可批量调用 /api/papers/?ids=... 或退化为多次 GET。
   * 当前 mock 模式直接从本地数据返回。
   */
  static async getMeta(paperIds) {
    if (USE_MOCK) {
      return mockResponse(getCompareMeta(paperIds), { min: 120, max: 320 })
    }
    return service('/papers/', { method: 'get', params: { ids: paperIds.join(',') } })
  }
}
