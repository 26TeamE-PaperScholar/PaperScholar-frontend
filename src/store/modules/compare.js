/**
 * 论文横向对比 store module (用例 804)。
 * 上限 2 篇；通过 sessionStorage 持久化，刷新不丢。
 */

const STORAGE_KEY = 'ps:compareCart'
const MAX_COMPARE = 2

function readStorage() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : []
  } catch {
    return []
  }
}

function writeStorage(cart) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
  } catch {
    // sessionStorage 不可用时静默忽略
  }
}

const state = () => ({
  cart: [],
  hydrated: false
})

const getters = {
  cart: (s) => s.cart,
  count: (s) => s.cart.length,
  isFull: (s) => s.cart.length >= MAX_COMPARE,
  isEmpty: (s) => s.cart.length === 0,
  contains: (s) => (paperId) => s.cart.some((p) => p.id === paperId),
  maxCompare: () => MAX_COMPARE
}

const mutations = {
  ADD(state, paper) {
    if (state.cart.length >= MAX_COMPARE) return
    if (state.cart.some((p) => p.id === paper.id)) return
    state.cart.push({
      id: paper.id,
      title: paper.title,
      publication_year: paper.publication_year || null
    })
    writeStorage(state.cart)
  },
  REMOVE(state, paperId) {
    state.cart = state.cart.filter((p) => p.id !== paperId)
    writeStorage(state.cart)
  },
  CLEAR(state) {
    state.cart = []
    writeStorage(state.cart)
  },
  HYDRATE(state) {
    if (state.hydrated) return
    state.cart = readStorage()
    state.hydrated = true
  }
}

const actions = {
  addToCompare({ state, commit }, paper) {
    if (state.cart.length >= MAX_COMPARE) {
      return { ok: false, reason: 'full' }
    }
    if (state.cart.some((p) => p.id === paper.id)) {
      return { ok: false, reason: 'duplicate' }
    }
    commit('ADD', paper)
    return { ok: true }
  },
  removeFromCompare({ commit }, paperId) {
    commit('REMOVE', paperId)
  },
  clearCompare({ commit }) {
    commit('CLEAR')
  },
  hydrateCompare({ commit }) {
    commit('HYDRATE')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
