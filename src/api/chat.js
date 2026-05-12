import service from '../http'
import { USE_MOCK, mockResponse, mockConversations } from '../mock'

const url = {
  completions: '/chat/completions/',
  conversations: '/chat/conversations/'
}

const MOCK_REPLY = `这是 PaperScholar 内置的 AI 学术助手 (mock 模式)。
我可以帮您：
1. 提炼论文核心贡献与方法。
2. 比较相关工作的差异。
3. 生成 BibTeX 引用与中英文摘要。
4. 推荐进一步阅读路径。

后端 LLM 接入后此处会切换为真实流式回答。`

export class Chat {
  static async createCompletion(data) {
    if (USE_MOCK) {
      return mockResponse({
        id: 'cmpl-mock-' + Date.now(),
        choices: [{ message: { role: 'assistant', content: MOCK_REPLY }, finish_reason: 'stop' }],
        prompt: data
      }, { min: 600, max: 1200 })
    }
    return service(url.completions, { method: 'post', responseType: 'stream', data })
  }

  static async getAllConversations() {
    if (USE_MOCK) {
      return mockResponse(mockConversations.map((c) => ({ id: c.id, title: c.title, last_message_at: c.last_message_at })))
    }
    return service(url.conversations, { method: 'get' })
  }

  static async createConversation(_data) {
    if (USE_MOCK) {
      return mockResponse({ id: 'CV-mock-' + Date.now(), title: '新会话' })
    }
    return service(url.conversations, { method: 'post', data: _data })
  }

  static async getConversationById(_id) {
    if (USE_MOCK) {
      const c = mockConversations.find((x) => x.id === _id) || mockConversations[0]
      return mockResponse(c)
    }
    return service(url.conversations + _id + '/', { method: 'get' })
  }

  static async updateConversation(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.conversations + _id + '/', { method: 'put', data: _data })
  }

  static async updateConversationPartial(_id, _data) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.conversations + _id + '/', { method: 'patch', data: _data })
  }

  static async deleteConversation(_id) {
    if (USE_MOCK) {
      return mockResponse({ ok: true })
    }
    return service(url.conversations + _id + '/', { method: 'delete' })
  }

  static async getChatMessagesList(_id) {
    if (USE_MOCK) {
      const c = mockConversations.find((x) => x.id === _id) || mockConversations[0]
      return mockResponse(c.messages || [])
    }
    return service(url.conversations + _id + '/chat_messages/', { method: 'get' })
  }
}
