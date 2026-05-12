/**
 * 模拟网络耗时，结合 mock 数据形成骨架屏体验。
 */
export const mockDelay = (min = 220, max = 520) => {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const mockResponse = async (data, opts = {}) => {
  await mockDelay(opts.min, opts.max)
  return { data, status: 200, statusText: 'OK', headers: {}, config: {} }
}

export const paginate = (list, page = 1, perPage = 10) => {
  const p = Number(page) || 1
  const pp = Number(perPage) || 10
  const start = (p - 1) * pp
  const slice = list.slice(start, start + pp)
  return {
    results: slice,
    meta: {
      count: list.length,
      page: p,
      per_page: pp,
      total_pages: Math.max(1, Math.ceil(list.length / pp))
    }
  }
}
