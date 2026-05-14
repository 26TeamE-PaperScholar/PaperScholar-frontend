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
 * 对齐 docs/api-contract.md §1.2：
 * - GET    /api/chat/conversations/                — 列出会话
 * - POST   /api/chat/conversations/                — 新建
 * - GET    /api/chat/conversations/<id>/           — 详情
 * - PATCH  /api/chat/conversations/<id>/           — 重命名 / 改 context_papers
 * - DELETE /api/chat/conversations/<id>/           — 删除
 * - POST   /api/chat/completions/                  — 发送消息（同步响应模式 A）
 */
const url = {
  completions: '/chat/completions/',
  conversations: '/chat/conversations/'
}

export class Chat {
  /**
   * GET /api/chat/conversations/
   * @returns response.data.items + response.data.pagination
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
    return service(url.conversations, { method: 'post', data })
  }

  /**
   * GET /api/chat/conversations/<id>/
   * @returns {id, title, context_papers, messages[]}
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
    return service(url.conversations + id + '/', { method: 'patch', data })
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
   * 请求体：{ conversation_id, message, context_papers? }
   * 响应（模式 A 同步）：{ user_message, assistant_message }
   */
  static async createCompletion(data) {
    if (USE_MOCK) {
      const pair = mockCompletion(data || {})
      mockAppendMessages(data.conversation_id, pair.user_message, pair.assistant_message)
      return mockResponse(pair, { min: 600, max: 1200 })
    }
    return service(url.completions, { method: 'post', data })
  }
}
