/**
 * AI 论文助手 Vuex 模块（命名空间 assistant）。
 *
 * 对齐 docs/api-contract.md §1：
 * - 会话列表、当前会话、消息流、上下文论文、发送态
 * - 同步响应模式 A：sendMessage 一次拿到 user_message + assistant_message
 */
import { Chat } from '../../api/chat'

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
    if (c) Object.assign(c, patch)
  },
  SET_CURRENT(state, { id, messages, context_papers }) {
    state.currentId = id
    state.messages = messages || []
    state.contextPapers = context_papers || []
  },
  CLEAR_CURRENT(state) {
    state.currentId = null
    state.messages = []
    state.contextPapers = []
  },
  APPEND_MESSAGE(state, msg) {
    state.messages.push(msg)
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
      const items = (res && res.data && res.data.items) || []
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
      commit('SET_CURRENT', {
        id: data.id,
        messages: data.messages || [],
        context_papers: data.context_papers || []
      })
      return data
    } catch (e) {
      commit('SET_ERROR', e)
      return null
    }
  },

  async newConversation({ commit }, { title = '新会话', context_papers = [] } = {}) {
    const res = await Chat.createConversation({ title, context_papers })
    const cv = res && res.data
    if (!cv) return null
    commit('PREPEND_CONVERSATION', {
      id: cv.id,
      title: cv.title,
      context_papers: cv.context_papers || [],
      last_message_at: cv.last_message_at,
      created_at: cv.created_at,
      message_count: 0
    })
    commit('SET_CURRENT', { id: cv.id, messages: [], context_papers: cv.context_papers || [] })
    return cv
  },

  async sendMessage({ state, commit, dispatch }, { message, context_papers } = {}) {
    if (!message || !String(message).trim()) return null
    if (state.pendingSend) return null

    let conversationId = state.currentId
    if (!conversationId) {
      const cv = await dispatch('newConversation', {
        context_papers: context_papers || state.contextPapers
      })
      conversationId = cv && cv.id
      if (!conversationId) return null
    }

    commit('SET_PENDING', true)
    try {
      const res = await Chat.createCompletion({
        conversation_id: conversationId,
        message,
        context_papers: context_papers || state.contextPapers
      })
      const data = res && res.data
      if (data && data.user_message) commit('APPEND_MESSAGE', data.user_message)
      if (data && data.assistant_message) commit('APPEND_MESSAGE', data.assistant_message)
      commit('PATCH_CONVERSATION', {
        id: conversationId,
        patch: {
          last_message_at: data && data.assistant_message ? data.assistant_message.created_at : new Date().toISOString(),
          message_count: state.messages.length,
          title: state.messages[0] && state.messages[0].role === 'user'
            ? state.messages[0].content.slice(0, 30) + (state.messages[0].content.length > 30 ? '…' : '')
            : undefined
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
