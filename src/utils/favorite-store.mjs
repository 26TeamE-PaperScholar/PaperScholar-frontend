import { User } from '../api/users'
import {
  buildFavoriteCollectPayload,
  buildFavoriteCreatePayload,
  extractCreatedFavorite,
  extractFavoriteDetail,
  favoritePaperCountOf,
  normalizeFavoriteId,
  normalizeFavoriteItem,
  normalizeFavoriteList,
  normalizeFavoriteListResponse,
  normalizeFavoriteName,
  paperIdOf,
  removeFavoriteFromList,
  replaceFavoriteInList,
  setFavoritePaperMembership,
  upsertFavoriteInList
} from './personal-page.mjs'

const ROOT_FAVORITE_PARENT_ID = 0
const FAVORITE_CACHE_PREFIX = 'ps-favorite-folders:'
const FAVORITE_CACHE_MAX_AGE_MS = 10 * 60 * 1000
const entries = new Map()
let storageSyncReady = false

function userKeyOf(userId) {
  return String(userId || '').trim()
}

function entryFor(userId) {
  const key = userKeyOf(userId)
  ensureStorageSync()
  if (!entries.has(key)) {
    entries.set(key, {
      items: mergePersistentFavorites(key, []),
      generation: 0,
      requestId: 0,
      loadingPromise: null,
      subscribers: new Set()
    })
  }
  return entries.get(key)
}

function ensureStorageSync() {
  if (storageSyncReady || typeof window === 'undefined' || !window.addEventListener) return
  storageSyncReady = true
  window.addEventListener('storage', (event) => {
    if (!event.key || !event.key.startsWith(FAVORITE_CACHE_PREFIX)) return
    const userId = event.key.slice(FAVORITE_CACHE_PREFIX.length)
    const key = userKeyOf(userId)
    if (!entries.has(key)) return
    const state = readPersistentState(key)
    setItems(key, state.folders, { bump: false })
  })
}

function storageAvailable() {
  return typeof window !== 'undefined' && !!window.localStorage
}

function favoriteCacheKey(userId) {
  return FAVORITE_CACHE_PREFIX + userKeyOf(userId)
}

function emptyPersistentState() {
  return {
    version: 1,
    folders: [],
    deletedIds: [],
    updatedAt: ''
  }
}

function readPersistentState(userId) {
  if (!storageAvailable()) return emptyPersistentState()
  try {
    const raw = window.localStorage.getItem(favoriteCacheKey(userId))
    if (!raw) return emptyPersistentState()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return {
        ...emptyPersistentState(),
        folders: normalizeFavoriteList(parsed)
      }
    }
    return {
      ...emptyPersistentState(),
      ...parsed,
      folders: normalizeFavoriteList(parsed && parsed.folders),
      deletedIds: Array.isArray(parsed && parsed.deletedIds)
        ? parsed.deletedIds.map(normalizeFavoriteId).filter(Boolean)
        : []
    }
  } catch (e) {
    return emptyPersistentState()
  }
}

function writePersistentState(userId, state) {
  if (!storageAvailable()) return
  try {
    window.localStorage.setItem(favoriteCacheKey(userId), JSON.stringify({
      version: 1,
      folders: normalizeFavoriteList(state.folders),
      deletedIds: Array.from(new Set((state.deletedIds || []).map(normalizeFavoriteId).filter(Boolean))),
      updatedAt: new Date().toISOString()
    }))
  } catch (e) {}
}

function isTemporaryFavoriteId(id) {
  return normalizeFavoriteId(id).startsWith('F-pending-')
}

function isFreshPersistentState(state) {
  const timestamp = Date.parse((state && state.updatedAt) || '')
  return Number.isFinite(timestamp) && Date.now() - timestamp < FAVORITE_CACHE_MAX_AGE_MS
}

function sameFavoriteName(left, right) {
  return normalizeFavoriteName(left && left.name).toLowerCase() === normalizeFavoriteName(right && right.name).toLowerCase()
}

function mergePersistentFavorites(userId, serverItems) {
  const cache = readPersistentState(userId)
  if (!isFreshPersistentState(cache)) return normalizeFavoriteList(serverItems)
  const deletedIds = new Set(cache.deletedIds)
  let items = normalizeFavoriteList(serverItems).filter((item) => !deletedIds.has(item.id))

  cache.folders.forEach((cached) => {
    if (cached.id && deletedIds.has(cached.id)) return
    if (isTemporaryFavoriteId(cached.id) && items.some((item) => sameFavoriteName(item, cached))) return
    items = upsertFavoriteInList(items, cached)
  })

  return normalizeFavoriteList(items)
}

function rememberFavorite(userId, favorite) {
  const normalized = normalizeFavoriteItem(favorite)
  if (!normalized.id && !normalized.name) return
  const cache = readPersistentState(userId)
  const deletedIds = cache.deletedIds.filter((id) => id !== normalized.id)
  writePersistentState(userId, {
    ...cache,
    deletedIds,
    folders: upsertFavoriteInList(cache.folders, {
      ...normalized,
      pending: false,
      showContextMenu: false
    })
  })
}

function errorText(error) {
  const data = error && error.response && error.response.data
  let serializedData = ''
  if (typeof data === 'string') serializedData = data
  else if (data) {
    try {
      serializedData = JSON.stringify(data)
    } catch (e) {
      serializedData = ''
    }
  }
  const parts = [
    error && error.message,
    serializedData,
    data && data.message,
    data && data.detail,
    data && data.error,
    data && data.msg
  ]
  return parts.filter(Boolean).join(' ')
}

function isDuplicateFavoritePaperError(error) {
  const status = (error && error.response && error.response.status) || (error && error.status)
  const text = errorText(error)
  return (status === 400 || status === 409) &&
    /(文件已存在|已存在|already\s+exists|already\s+exist|duplicate|duplicated|exists)/i.test(text)
}

function rememberFavoriteById(userId, favoriteId) {
  const id = normalizeFavoriteId(favoriteId)
  const updated = getFavoriteFoldersSnapshot(userId).find((item) => item.id === id)
  if (updated) rememberFavorite(userId, updated)
}

function finalizeFavoriteMembership(userId, favoriteId, paperId, shouldContain) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paperId)
  setItems(key, setFavoritePaperMembership(getFavoriteFoldersSnapshot(key), id, normalizedPaperId, shouldContain))
  rememberFavoriteById(key, id)
  return refreshFavoriteFolders(key, { force: true }).then(
    () => {
      setItems(key, setFavoritePaperMembership(getFavoriteFoldersSnapshot(key), id, normalizedPaperId, shouldContain))
      rememberFavoriteById(key, id)
      return true
    },
    () => true
  )
}

function forgetFavorite(userId, favoriteId) {
  const id = normalizeFavoriteId(favoriteId)
  const cache = readPersistentState(userId)
  writePersistentState(userId, {
    ...cache,
    folders: removeFavoriteFromList(cache.folders, id),
    deletedIds: id ? Array.from(new Set([...cache.deletedIds, id])) : cache.deletedIds
  })
}

function cloneItems(items) {
  return normalizeFavoriteList(items).map((item) => ({ ...item, paper_ids: [...(item.paper_ids || [])] }))
}

function notify(userId) {
  const entry = entryFor(userId)
  const snapshot = cloneItems(entry.items)
  entry.subscribers.forEach((callback) => callback(snapshot))
}

function setItems(userId, items, options = {}) {
  const entry = entryFor(userId)
  entry.items = cloneItems(items)
  if (options.bump !== false) entry.generation += 1
  notify(userId)
  return cloneItems(entry.items)
}

export function getFavoriteFoldersSnapshot(userId) {
  return cloneItems(entryFor(userId).items)
}

export function subscribeFavoriteFolders(userId, callback) {
  const key = userKeyOf(userId)
  if (!key || typeof callback !== 'function') return () => {}
  const entry = entryFor(key)
  entry.subscribers.add(callback)
  callback(cloneItems(entry.items))
  return () => {
    entry.subscribers.delete(callback)
  }
}

export function setFavoriteFoldersFromResponse(userId, response) {
  return setItems(userId, mergePersistentFavorites(userId, normalizeFavoriteListResponse(response)), { bump: false })
}

export function refreshFavoriteFolders(userId, options = {}) {
  const key = userKeyOf(userId)
  if (!key) return Promise.resolve([])
  const entry = entryFor(key)
  if (entry.loadingPromise && !options.force) return entry.loadingPromise

  const requestGeneration = entry.generation
  const requestId = entry.requestId + 1
  entry.requestId = requestId
  const promise = User.getFavoriteList(key, { cacheBust: true }).then((response) => {
    const items = mergePersistentFavorites(key, normalizeFavoriteListResponse(response))
    if (requestGeneration === entry.generation && requestId === entry.requestId) {
      setItems(key, items, { bump: false })
    }
    return getFavoriteFoldersSnapshot(key)
  }).finally(() => {
    if (entry.loadingPromise === promise) entry.loadingPromise = null
  })

  entry.loadingPromise = promise
  return promise
}

export function createFavoriteFolder(userId, name) {
  const key = userKeyOf(userId)
  const normalizedName = normalizeFavoriteName(name)
  if (!key || !normalizedName) return Promise.reject(new Error('favorite-name-required'))

  const optimisticId = `F-pending-${Date.now()}-${Math.random().toString(36).slice(2)}`
  const optimisticFavorite = normalizeFavoriteItem({
    id: optimisticId,
    name: normalizedName,
    paper_ids: [],
    pending: true
  })
  setItems(key, upsertFavoriteInList(getFavoriteFoldersSnapshot(key), optimisticFavorite))

  return User.createFavorite(ROOT_FAVORITE_PARENT_ID, buildFavoriteCreatePayload(normalizedName)).then(
    (response) => {
      const created = extractCreatedFavorite(response, normalizedName, optimisticId)
      const committed = {
        ...created,
        pending: false,
        showContextMenu: false
      }
      rememberFavorite(key, committed)
      setItems(key, replaceFavoriteInList(getFavoriteFoldersSnapshot(key), optimisticId, committed))
      return refreshFavoriteFolders(key, { force: true }).then(
        () => {
          const latest = getFavoriteFoldersSnapshot(key)
          if (committed.id && !latest.some((item) => item.id === committed.id)) {
            setItems(key, upsertFavoriteInList(latest, committed))
            rememberFavorite(key, committed)
          }
          return committed
        },
        () => committed
      )
    },
    (error) => {
      setItems(key, removeFavoriteFromList(getFavoriteFoldersSnapshot(key), optimisticId))
      throw error
    }
  )
}

export function deleteFavoriteFolder(userId, favoriteId, options = {}) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  if (!key || !id) return Promise.reject(new Error('favorite-id-required'))

  const previous = getFavoriteFoldersSnapshot(key)
  setItems(key, removeFavoriteFromList(previous, id))
  return User.deleteFavorite(id, { force: !!options.force }).then(
    () => {
      forgetFavorite(key, id)
      return refreshFavoriteFolders(key, { force: true }).then(
        () => {
          const latest = getFavoriteFoldersSnapshot(key)
          if (latest.some((item) => item.id === id)) setItems(key, removeFavoriteFromList(latest, id))
          return true
        },
        () => true
      )
    },
    (error) => {
      setItems(key, previous)
      throw error
    }
  )
}

export function renameFavoriteFolder(userId, favoriteId, name) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  const normalizedName = normalizeFavoriteName(name)
  if (!key || !id || !normalizedName) return Promise.reject(new Error('favorite-rename-invalid'))

  const previous = getFavoriteFoldersSnapshot(key)
  const target = previous.find((item) => item.id === id)
  if (!target) return Promise.reject(new Error('favorite-not-found'))
  const renamed = { ...target, name: normalizedName }
  setItems(key, upsertFavoriteInList(previous, renamed))

  return User.renameFavorite(id, { name: normalizedName }).then(
    () => {
      rememberFavorite(key, renamed)
      return refreshFavoriteFolders(key, { force: true }).then(
        () => {
          setItems(key, upsertFavoriteInList(getFavoriteFoldersSnapshot(key), renamed))
          return true
        },
        () => true
      )
    },
    (error) => {
      setItems(key, previous)
      throw error
    }
  )
}

export function resolveFavoriteFolderPaperCount(favorite) {
  const id = normalizeFavoriteId(favorite && favorite.id)
  const fallbackCount = favoritePaperCountOf(favorite)
  if (!id || fallbackCount > 0) return Promise.resolve(fallbackCount)

  return User.getFavorite(id, { cacheBust: true }).then(
    (response) => {
      const detail = extractFavoriteDetail(response, id)
      return Math.max(fallbackCount, favoritePaperCountOf(detail.favorite), detail.papers.length)
    },
    () => fallbackCount
  )
}

export function collectPaperToFavorite(userId, favoriteId, paperId) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paperId)
  if (!key || !id || !normalizedPaperId) return Promise.reject(new Error('favorite-collect-invalid'))

  const previous = getFavoriteFoldersSnapshot(key)
  const next = setFavoritePaperMembership(previous, id, normalizedPaperId, true)
  setItems(key, next)
  return User.collectFavorite(id, buildFavoriteCollectPayload(normalizedPaperId)).then(
    () => finalizeFavoriteMembership(key, id, normalizedPaperId, true),
    (error) => {
      if (isDuplicateFavoritePaperError(error)) {
        return finalizeFavoriteMembership(key, id, normalizedPaperId, true)
      }
      setItems(key, previous)
      throw error
    }
  )
}

export function removePaperFromFavorite(userId, favoriteId, paperId) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paperId)
  if (!key || !id || !normalizedPaperId) return Promise.reject(new Error('favorite-remove-invalid'))

  const previous = getFavoriteFoldersSnapshot(key)
  const next = setFavoritePaperMembership(previous, id, normalizedPaperId, false)
  setItems(key, next)
  return User.uncollectFavorite(id, buildFavoriteCollectPayload(normalizedPaperId)).then(
    () => finalizeFavoriteMembership(key, id, normalizedPaperId, false),
    (error) => {
      setItems(key, previous)
      throw error
    }
  )
}

export function movePaperToFavorite(userId, targetFavoriteId, paperId, sourceFavoriteId = '') {
  const key = userKeyOf(userId)
  const targetId = normalizeFavoriteId(targetFavoriteId)
  const sourceId = normalizeFavoriteId(sourceFavoriteId)
  const normalizedPaperId = paperIdOf(paperId)
  if (!key || !targetId || !normalizedPaperId) return Promise.reject(new Error('favorite-move-invalid'))
  if (!sourceId || sourceId === targetId) return collectPaperToFavorite(key, targetId, normalizedPaperId)

  const previous = getFavoriteFoldersSnapshot(key)
  let next = setFavoritePaperMembership(previous, targetId, normalizedPaperId, true)
  next = setFavoritePaperMembership(next, sourceId, normalizedPaperId, false)
  setItems(key, next)

  let targetConfirmed = false
  return User.collectFavorite(targetId, buildFavoriteCollectPayload(normalizedPaperId))
    .then(
      () => { targetConfirmed = true },
      (error) => {
        if (isDuplicateFavoritePaperError(error)) {
          targetConfirmed = true
          return true
        }
        throw error
      }
    )
    .then(() => User.uncollectFavorite(sourceId, buildFavoriteCollectPayload(normalizedPaperId)))
    .then(
      () => {
        rememberFavoriteById(key, targetId)
        rememberFavoriteById(key, sourceId)
        return refreshFavoriteFolders(key, { force: true }).then(
          () => {
            let latest = setFavoritePaperMembership(getFavoriteFoldersSnapshot(key), targetId, normalizedPaperId, true)
            latest = setFavoritePaperMembership(latest, sourceId, normalizedPaperId, false)
            setItems(key, latest)
            rememberFavoriteById(key, targetId)
            rememberFavoriteById(key, sourceId)
            return true
          },
          () => true
        )
      },
      (error) => {
        const rollback = targetConfirmed
          ? setFavoritePaperMembership(previous, targetId, normalizedPaperId, true)
          : previous
        setItems(key, rollback)
        throw error
      }
    )
}
