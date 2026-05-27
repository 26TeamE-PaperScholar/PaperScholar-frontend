import service from '../http'
import {
  USE_MOCK,
  mockResponse,
  mockConversations,
  mockCompletion,
  mockCreateConversation,
  mockConversationDetail,
  mockAppendMessages
} from '../mock'

/**
 * AI 论文助手前端调用层。
 *
 * 兼容当前后端 Swagger：
 * - GET    /api/chat/conversations/                — 列出会话
 * - POST   /api/chat/conversations/                — 新建
 * - GET    /api/chat/conversations/<id>/           — 详情
 * - GET    /api/chat/conversations/<id>/chat_messages/ — 消息列表
 * - PATCH  /api/chat/conversations/<id>/           — 重命名
 * - DELETE /api/chat/conversations/<id>/           — 删除
 * - POST   /api/chat/completions/                  — 发送消息
 */
const url = {
  completions: '/chat/completions/',
  conversations: '/chat/conversations/'
}

const normalizeContextPapers = (data = {}) => {
  if (Array.isArray(data.context_papers)) return data.context_papers
  if (Array.isArray(data.contextPapers)) return data.contextPapers
  return undefined
}

const toCompletionPayload = (data = {}) => ({
  conversation_id: data.conversation_id !== undefined
    ? data.conversation_id
    : (data.conversation !== undefined ? data.conversation : null),
  conversation: data.conversation !== undefined
    ? data.conversation
    : (data.conversation_id !== undefined ? data.conversation_id : null),
  message: data.message !== undefined ? data.message : data.content,
  content: data.content !== undefined ? data.content : data.message
})

const toCompletionRequest = (data = {}) => {
  const payload = toCompletionPayload(data)
  const contextPapers = normalizeContextPapers(data)
  if (contextPapers !== undefined) payload.context_papers = contextPapers
  return payload
}

export class Chat {
  /**
   * GET /api/chat/conversations/
   * @returns mock: response.data.items；backend: response.data.results
   */
  static async getAllConversations(params = {}) {
    if (USE_MOCK) {
      const items = mockConversations.map((c) => ({
        id: c.id,
        title: c.title,
        context_papers: c.context_papers || [],
        last_message_at: c.last_message_at,
        created_at: c.created_at,
        message_count: c.message_count || (c.messages || []).length
      }))
      return mockResponse({
        items,
        pagination: { page: 1, per_page: 20, total: items.length }
      })
    }
    return service(url.conversations, { method: 'get', params })
  }

  /**
   * POST /api/chat/conversations/
   * @param {{title?:string, context_papers?:string[]}} data
   */
  static async createConversation(data = {}) {
    if (USE_MOCK) {
      const cv = mockCreateConversation(data)
      return mockResponse(cv)
    }
    const payload = {}
    if (data.title != null) payload.title = data.title
    const contextPapers = normalizeContextPapers(data)
    if (contextPapers !== undefined) payload.context_papers = contextPapers
    return service(url.conversations, { method: 'post', data: payload })
  }

  /**
   * GET /api/chat/conversations/<id>/
   * 当前后端只返回会话元信息，消息需另取 chat_messages。
   */
  static async getConversationById(id) {
    if (USE_MOCK) {
      const detail = mockConversationDetail(id)
      if (!detail) return mockResponse(null)
      return mockResponse(detail)
    }
    return service(url.conversations + id + '/', { method: 'get' })
  }

  /**
   * PATCH /api/chat/conversations/<id>/
   * @param {{title?:string, context_papers?:string[]}} data
   */
  static async updateConversationPartial(id, data) {
    if (USE_MOCK) {
      const c = mockConversations.find((x) => x.id === id)
      if (c) {
        if (data.title != null) c.title = data.title
        if (Array.isArray(data.context_papers)) c.context_papers = data.context_papers
      }
      return mockResponse({ ok: true })
    }
    const payload = {}
    if (data.title != null) payload.title = data.title
    const contextPapers = normalizeContextPapers(data)
    if (contextPapers !== undefined) payload.context_papers = contextPapers
    return service(url.conversations + id + '/', { method: 'patch', data: payload })
  }

  /**
   * DELETE /api/chat/conversations/<id>/
   */
  static async deleteConversation(id) {
    if (USE_MOCK) {
      const idx = mockConversations.findIndex((x) => x.id === id)
      if (idx >= 0) mockConversations.splice(idx, 1)
      return mockResponse({ ok: true })
    }
    return service(url.conversations + id + '/', { method: 'delete' })
  }

  /**
   * POST /api/chat/completions/
   * 兼容新旧请求体字段：{ conversation_id, message, context_papers }
   * 与旧版 { conversation, content }，避免联调期间字段变更导致上下文丢失。
   * mock 响应为 { user_message, assistant_message }，后端响应由接口实现决定。
   */
  static async createCompletion(data) {
    if (USE_MOCK) {
      const payload = data || {}
      const pair = mockCompletion(payload)
      mockAppendMessages(payload.conversation_id, pair.user_message, pair.assistant_message)
      return mockResponse(pair, { min: 600, max: 1200 })
    }
    return service(url.completions, { method: 'post', data: toCompletionRequest(data) })
  }

  /**
   * GET /api/chat/conversations/<id>/chat_messages/
   * 当前后端将会话详情和消息列表拆成两个接口。
   */
  static async getConversationMessages(id, params = {}) {
    if (USE_MOCK) {
      const detail = mockConversationDetail(id)
      return mockResponse({
        count: detail && detail.messages ? detail.messages.length : 0,
        results: detail && detail.messages ? detail.messages : []
      })
    }
    return service(url.conversations + id + '/chat_messages/', { method: 'get', params })
  }

  static async getChatMessagesList(id, params = {}) {
    return Chat.getConversationMessages(id, params)
  }
}
