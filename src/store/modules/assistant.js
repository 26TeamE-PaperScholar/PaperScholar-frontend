/**
 * AI 论文助手 Vuex 模块（命名空间 assistant）。
 *
 * 对齐 AI 论文助手页面状态，并兼容当前后端 Swagger：
 * - 会话列表、当前会话、消息流、上下文论文、发送态
 * - mock 支持同步响应；真实后端消息列表通过 chat_messages 刷新
 */
import { Chat } from '../../api/chat'

const listFromPayload = (payload) => {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.results)) return payload.results
  if (payload.data) return listFromPayload(payload.data)
  return []
}

const normalizeConversation = (cv = {}, fallback = {}) => {
  const hasContextPapers = Object.prototype.hasOwnProperty.call(cv, 'context_papers')
  return {
    id: cv.id,
    title: cv.title || fallback.title || '新会话',
    context_papers: hasContextPapers
      ? (Array.isArray(cv.context_papers) ? cv.context_papers : [])
      : (Array.isArray(fallback.context_papers) ? fallback.context_papers : []),
    created_at: cv.created_at,
    updated_at: cv.updated_at,
    last_message_at: cv.last_message_at || cv.updated_at || cv.created_at,
    message_count: cv.message_count != null
      ? cv.message_count
      : (Array.isArray(cv.messages) ? cv.messages.length : (fallback.message_count || 0))
  }
}

const normalizeMessage = (msg = {}, conversationId) => ({
  ...msg,
  id: msg.id || `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  conversation_id: msg.conversation_id || msg.conversation || conversationId,
  created_at: msg.created_at || msg.timestamp || new Date().toISOString(),
  evidences: msg.evidences || [],
  sources: msg.sources || []
})

const makeLocalMessage = (conversationId, role, content) => normalizeMessage({
  id: `local-${role}-${Date.now()}`,
  conversation_id: conversationId,
  role,
  content,
  created_at: new Date().toISOString()
}, conversationId)

const makeConversationTitle = (content) => {
  const text = String(content || '').trim()
  return text ? text.slice(0, 30) + (text.length > 30 ? '…' : '') : '新会话'
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const state = () => ({
  conversations: [],
  conversationsLoaded: false,
  currentId: null,
  messages: [],
  contextPapers: [],
  pendingSend: false,
  error: null
})

const getters = {
  conversations: (s) => s.conversations,
  currentId: (s) => s.currentId,
  currentConversation: (s) => s.conversations.find((c) => c.id === s.currentId) || null,
  messages: (s) => s.messages,
  contextPapers: (s) => s.contextPapers,
  pendingSend: (s) => s.pendingSend,
  isCurrentRestricted: (s) =>
    s.messages.some((m) => m.role === 'assistant' && m.mode === 'restricted')
}

const mutations = {
  SET_CONVERSATIONS(state, list) {
    state.conversations = list
    state.conversationsLoaded = true
  },
  PREPEND_CONVERSATION(state, cv) {
    state.conversations = [cv, ...state.conversations.filter((c) => c.id !== cv.id)]
  },
  REMOVE_CONVERSATION(state, id) {
    state.conversations = state.conversations.filter((c) => c.id !== id)
    if (state.currentId === id) {
      state.currentId = null
      state.messages = []
      state.contextPapers = []
    }
  },
  PATCH_CONVERSATION(state, { id, patch }) {
    const c = state.conversations.find((x) => x.id === id)
    if (c) {
      Object.keys(patch || {}).forEach((key) => {
        if (patch[key] !== undefined) c[key] = patch[key]
      })
    }
  },
  SET_CURRENT(state, { id, messages, context_papers }) {
    state.currentId = id
    state.messages = messages || []
    state.contextPapers = context_papers || []
  },
  SET_MESSAGES(state, messages) {
    state.messages = messages || []
  },
  CLEAR_CURRENT(state) {
    state.currentId = null
    state.messages = []
    state.contextPapers = []
  },
  APPEND_MESSAGE(state, msg) {
    if (!msg) return
    if (msg.id && state.messages.some((m) => m.id === msg.id)) return
    state.messages.push(msg)
  },
  REMOVE_MESSAGE(state, id) {
    state.messages = state.messages.filter((m) => m.id !== id)
  },
  SET_PENDING(state, v) {
    state.pendingSend = v
  },
  SET_ERROR(state, err) {
    state.error = err
  },
  SET_CONTEXT_PAPERS(state, ids) {
    state.contextPapers = Array.isArray(ids) ? ids.slice() : []
  }
}

const actions = {
  async loadConversations({ commit, state }, { force = false } = {}) {
    if (!force && state.conversationsLoaded) return state.conversations
    try {
      const res = await Chat.getAllConversations()
      const items = listFromPayload(res && res.data).map((cv) => normalizeConversation(cv))
      commit('SET_CONVERSATIONS', items)
      return items
    } catch (e) {
      commit('SET_ERROR', e)
      return []
    }
  },

  async openConversation({ commit, dispatch }, id) {
    if (!id) {
      commit('CLEAR_CURRENT')
      return null
    }
    try {
      const res = await Chat.getConversationById(id)
      const data = res && res.data
      if (!data) {
        commit('CLEAR_CURRENT')
        return null
      }
      let cv = normalizeConversation(data)
      const messages = Array.isArray(data.messages)
        ? data.messages.map((m) => normalizeMessage(m, cv.id))
        : await dispatch('loadConversationMessages', { id: cv.id, apply: false })
      const firstUserMessage = messages.find((m) => m.role === 'user' && m.content)
      const repairedTitle = cv.title === '新会话' && firstUserMessage
        ? makeConversationTitle(firstUserMessage.content)
        : ''
      if (repairedTitle && repairedTitle !== cv.title) {
        cv = { ...cv, title: repairedTitle }
      }
      commit('PATCH_CONVERSATION', { id: cv.id, patch: cv })
      commit('SET_CURRENT', {
        id: cv.id,
        messages,
        context_papers: cv.context_papers || []
      })
      if (repairedTitle) {
        try {
          await Chat.updateConversationPartial(cv.id, { title: repairedTitle })
        } catch (e) {
          commit('SET_ERROR', e)
        }
      }
      return data
    } catch (e) {
      commit('SET_ERROR', e)
      return null
    }
  },

  async newConversation({ commit }, { title = '新会话', context_papers = [] } = {}) {
    const res = await Chat.createConversation({ title, context_papers })
    const cv = normalizeConversation(res && res.data, { title, context_papers })
    if (!cv.id) return null
    commit('PREPEND_CONVERSATION', cv)
    commit('SET_CURRENT', { id: cv.id, messages: [], context_papers: cv.context_papers || [] })
    return cv
  },

  async loadConversationMessages({ commit }, { id, apply = true } = {}) {
    if (!id) return []
    const res = await Chat.getConversationMessages(id)
    const messages = listFromPayload(res && res.data).map((m) => normalizeMessage(m, id))
    if (apply) commit('SET_MESSAGES', messages)
    return messages
  },

  async waitForAssistantMessage({ dispatch }, { id, previousCount = 0, attempts = 10, interval = 800 } = {}) {
    let latest = []
    for (let i = 0; i < attempts; i += 1) {
      latest = await dispatch('loadConversationMessages', { id, apply: true })
      const newMessages = latest.slice(previousCount)
      if (newMessages.some((m) => m.role === 'assistant')) return latest
      if (i < attempts - 1) await sleep(interval)
    }
    return latest
  },

  async sendMessage({ state, commit, dispatch }, { message, context_papers } = {}) {
    const content = String(message || '').trim()
    if (!content) return null
    if (state.pendingSend) return null

    let conversationId = state.currentId
    const firstMessageTitle = makeConversationTitle(content)
    const requestContextPapers = context_papers || state.contextPapers
    if (!conversationId) {
      const cv = await dispatch('newConversation', {
        title: firstMessageTitle,
        context_papers: requestContextPapers
      })
      conversationId = cv && cv.id
      if (!conversationId) return null
    }

    const previousCount = state.messages.length
    const shouldPersistFirstTitle = previousCount === 0
    const localUser = makeLocalMessage(conversationId, 'user', content)
    commit('APPEND_MESSAGE', localUser)
    commit('PATCH_CONVERSATION', {
      id: conversationId,
      patch: {
        title: shouldPersistFirstTitle ? firstMessageTitle : undefined,
        last_message_at: localUser.created_at,
        message_count: state.messages.length
      }
    })
    if (shouldPersistFirstTitle) {
      try {
        await Chat.updateConversationPartial(conversationId, { title: firstMessageTitle })
      } catch (e) {
        commit('SET_ERROR', e)
      }
    }

    commit('SET_PENDING', true)
    try {
      const res = await Chat.createCompletion({
        conversation_id: conversationId,
        message: content,
        context_papers: requestContextPapers
      })
      const data = res && res.data
      if (data && (data.user_message || data.assistant_message)) {
        commit('REMOVE_MESSAGE', localUser.id)
        if (data.user_message) commit('APPEND_MESSAGE', normalizeMessage(data.user_message, conversationId))
        if (data.assistant_message) commit('APPEND_MESSAGE', normalizeMessage(data.assistant_message, conversationId))
      } else {
        const messages = await dispatch('waitForAssistantMessage', { id: conversationId, previousCount })
        if (!messages.length) commit('APPEND_MESSAGE', localUser)
      }
      const last = state.messages[state.messages.length - 1]
      commit('PATCH_CONVERSATION', {
        id: conversationId,
        patch: {
          last_message_at: last ? last.created_at : new Date().toISOString(),
          message_count: state.messages.length,
          title: shouldPersistFirstTitle ? firstMessageTitle : undefined
        }
      })
      return data
    } catch (e) {
      commit('SET_ERROR', e)
      return null
    } finally {
      commit('SET_PENDING', false)
    }
  },

  async renameConversation({ commit }, { id, title }) {
    await Chat.updateConversationPartial(id, { title })
    commit('PATCH_CONVERSATION', { id, patch: { title } })
  },

  async updateContextPapers({ state, commit }, { id, paperIds }) {
    const target = id || state.currentId
    if (!target) return
    await Chat.updateConversationPartial(target, { context_papers: paperIds })
    commit('PATCH_CONVERSATION', { id: target, patch: { context_papers: paperIds } })
    if (target === state.currentId) commit('SET_CONTEXT_PAPERS', paperIds)
  },

  async deleteConversation({ commit }, id) {
    await Chat.deleteConversation(id)
    commit('REMOVE_CONVERSATION', id)
  },

  startDraftConversation({ commit }, { context_papers = [] } = {}) {
    commit('CLEAR_CURRENT')
    commit('SET_CONTEXT_PAPERS', context_papers)
  },

  setContextPapersLocal({ commit }, ids) {
    commit('SET_CONTEXT_PAPERS', ids)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
