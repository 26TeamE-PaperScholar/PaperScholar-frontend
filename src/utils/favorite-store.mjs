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
const FAVORITE_CONTENT_CACHE_MAX_AGE_MS = 5 * 60 * 1000
const entries = new Map()
const contentEntries = new Map()
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

function contentKeyOf(userId, favoriteId) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  return key && id ? `${key}:${id}` : ''
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

function favoriteAlreadyCollectedError() {
  const error = new Error('favorite-already-collected')
  error.code = 'favorite-already-collected'
  return error
}

export function isFavoriteAlreadyCollectedError(error) {
  return Boolean(error && (error.code === 'favorite-already-collected' || error.message === 'favorite-already-collected'))
}

function favoriteEntryIdOf(item) {
  if (!item || typeof item !== 'object') return ''
  return normalizeFavoriteId(
    item.favorite_id ??
      item.favoriteId ??
      item.entry_id ??
      item.entryId ??
      item.relation_id ??
      item.relationId ??
      item.collect_id ??
      item.collectId ??
      item.collection_id ??
      item.collectionId ??
      item.pk
  )
}

function findContentPaper(detail, paperId) {
  const normalizedPaperId = paperIdOf(paperId)
  if (!normalizedPaperId) return null
  return ((detail && detail.papers) || []).find((paper) => paperIdOf(paper) === normalizedPaperId) || null
}

function resolveFavoriteEntryId(userId, favoriteId, paper) {
  const key = userKeyOf(userId)
  const folderId = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paper)
  const directId = favoriteEntryIdOf(paper)
  if (directId && directId !== folderId) return Promise.resolve(directId)

  const cached = getFavoriteFolderContentSnapshot(key, folderId)
  const cachedEntryId = favoriteEntryIdOf(findContentPaper(cached, normalizedPaperId))
  if (cachedEntryId && cachedEntryId !== folderId) return Promise.resolve(cachedEntryId)

  return getFavoriteFolderContent(key, { id: folderId }, { force: true }).then((detail) => {
    const entryId = favoriteEntryIdOf(findContentPaper(detail, normalizedPaperId))
    return entryId && entryId !== folderId ? entryId : ''
  })
}

function deleteFavoritePaperEntry(userId, favoriteId, paper) {
  const folderId = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paper)
  return resolveFavoriteEntryId(userId, folderId, paper).then((entryId) => {
    if (!entryId) return Promise.reject(new Error('favorite-entry-id-required'))
    return User.deleteFavorite(entryId, {
      ...buildFavoriteCollectPayload(normalizedPaperId),
      folder_id: folderId
    })
  })
}

function rememberFavoriteById(userId, favoriteId) {
  const id = normalizeFavoriteId(favoriteId)
  const updated = getFavoriteFoldersSnapshot(userId).find((item) => item.id === id)
  if (updated) rememberFavorite(userId, updated)
}

function cloneFavoriteContent(detail) {
  const favorite = normalizeFavoriteItem(detail && detail.favorite)
  const papers = ((detail && detail.papers) || []).map((paper) => ({ ...paper }))
  return {
    favorite: {
      ...favorite,
      paper_ids: [...(favorite.paper_ids || [])]
    },
    papers
  }
}

function mergeFavoriteContentDetails(favoriteId, fallbackFavorite, ...details) {
  const seed = normalizeFavoriteItem(fallbackFavorite || {}, { id: favoriteId })
  const paperIds = new Set(seed.paper_ids || [])
  let favorite = seed
  const papers = []
  const seenPapers = new Set()

  details.forEach((detail) => {
    const nextFavorite = normalizeFavoriteItem(detail && detail.favorite, favorite)
    ;(nextFavorite.paper_ids || []).forEach((id) => {
      const normalized = paperIdOf(id)
      if (normalized) paperIds.add(normalized)
    })
    favorite = normalizeFavoriteItem({
      ...favorite,
      ...nextFavorite,
      id: nextFavorite.id || favorite.id || favoriteId,
      name: nextFavorite.name || favorite.name,
      paper_ids: Array.from(paperIds),
      paper_count: Math.max(favorite.paper_count || 0, nextFavorite.paper_count || 0, paperIds.size)
    }, { id: favoriteId })

    ;((detail && detail.papers) || []).forEach((paper) => {
      const paperId = paperIdOf(paper)
      if (!paperId || seenPapers.has(paperId)) return
      seenPapers.add(paperId)
      paperIds.add(paperId)
      papers.push({ ...paper })
    })
  })

  favorite = normalizeFavoriteItem({
    ...favorite,
    paper_ids: Array.from(paperIds),
    paper_count: Math.max(favorite.paper_count || 0, paperIds.size)
  }, { id: favoriteId })
  return { favorite, papers }
}

function setFavoriteContentCache(userId, favoriteId, detail) {
  const cacheKey = contentKeyOf(userId, favoriteId)
  if (!cacheKey) return null
  const normalized = cloneFavoriteContent(detail)
  contentEntries.set(cacheKey, {
    detail: normalized,
    updatedAt: Date.now(),
    loadingPromise: null
  })
  return cloneFavoriteContent(normalized)
}

function updateFavoriteContentMembership(userId, favoriteId, paperId, shouldContain, paper = null) {
  const cacheKey = contentKeyOf(userId, favoriteId)
  const entry = cacheKey && contentEntries.get(cacheKey)
  const normalizedPaperId = paperIdOf(paperId)
  if (!entry || !entry.detail || !normalizedPaperId) return

  const detail = cloneFavoriteContent(entry.detail)
  const paperIds = new Set(detail.favorite.paper_ids || [])
  if (shouldContain) paperIds.add(normalizedPaperId)
  else paperIds.delete(normalizedPaperId)

  const papers = shouldContain
    ? detail.papers.concat(
        detail.papers.some((item) => paperIdOf(item) === normalizedPaperId)
          ? []
          : [{ ...(paper || {}), id: normalizedPaperId, title: (paper && paper.title) || normalizedPaperId }]
      )
    : detail.papers.filter((item) => paperIdOf(item) !== normalizedPaperId)

  entry.detail = cloneFavoriteContent({
    favorite: {
      ...detail.favorite,
      paper_ids: Array.from(paperIds),
      paper_count: paperIds.size
    },
    papers
  })
  entry.updatedAt = Date.now()
}

function forgetFavoriteContent(userId, favoriteId) {
  const cacheKey = contentKeyOf(userId, favoriteId)
  if (cacheKey) contentEntries.delete(cacheKey)
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
  forgetFavoriteContent(userId, id)
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

export function getFavoriteFolderContentSnapshot(userId, favoriteId) {
  const cacheKey = contentKeyOf(userId, favoriteId)
  const entry = cacheKey && contentEntries.get(cacheKey)
  return entry && entry.detail ? cloneFavoriteContent(entry.detail) : null
}

export function getFavoriteFolderContent(userId, favorite, options = {}) {
  const key = userKeyOf(userId)
  const fallbackFavorite = normalizeFavoriteItem(favorite || {})
  const favoriteId = normalizeFavoriteId(fallbackFavorite.id || favorite)
  if (!key || !favoriteId) return Promise.resolve({ favorite: fallbackFavorite, papers: [] })

  const cacheKey = contentKeyOf(key, favoriteId)
  const cached = contentEntries.get(cacheKey)
  const fresh = cached && cached.detail && Date.now() - cached.updatedAt < FAVORITE_CONTENT_CACHE_MAX_AGE_MS
  if (!options.force && fresh) return Promise.resolve(cloneFavoriteContent(cached.detail))
  if (cached && cached.loadingPromise) return cached.loadingPromise.then(cloneFavoriteContent)

  const entry = cached || { detail: null, updatedAt: 0, loadingPromise: null }
  contentEntries.set(cacheKey, entry)

  const promise = User.getFavoriteList(favoriteId, { cacheBust: !!options.force }).then((response) => {
    const fallback = entry.detail ? entry.detail.favorite : fallbackFavorite
    const detail = mergeFavoriteContentDetails(
      favoriteId,
      fallback,
      extractFavoriteDetail(response, favoriteId, fallback)
    )
    entry.detail = cloneFavoriteContent(detail)
    entry.updatedAt = Date.now()

    if (detail.favorite && detail.favorite.id) {
      setItems(key, upsertFavoriteInList(getFavoriteFoldersSnapshot(key), detail.favorite), { bump: false })
      rememberFavorite(key, detail.favorite)
    }
    return cloneFavoriteContent(entry.detail)
  }).catch((error) => {
    if (entry.detail) return cloneFavoriteContent(entry.detail)
    throw error
  }).finally(() => {
    if (entry.loadingPromise === promise) entry.loadingPromise = null
  })

  entry.loadingPromise = promise
  return promise
}

export function refreshFavoriteFolderContents(userId, favorites, options = {}) {
  const key = userKeyOf(userId)
  if (!key) return Promise.resolve([])
  const folders = normalizeFavoriteList(favorites || getFavoriteFoldersSnapshot(key))
    .filter((favorite) => favorite && favorite.id && !favorite.pending)
  if (!folders.length) return Promise.resolve([])
  return Promise.all(folders.map((favorite) =>
    getFavoriteFolderContent(key, favorite, options).then(
      (detail) => detail,
      () => null
    )
  )).then((details) => details.filter(Boolean))
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

export function resolveFavoriteFolderPaperCount(favorite, userId = 'current') {
  const id = normalizeFavoriteId(favorite && favorite.id)
  const fallbackCount = favoritePaperCountOf(favorite)
  if (!id || fallbackCount > 0) return Promise.resolve(fallbackCount)

  return getFavoriteFolderContent(userId, favorite).then(
    (detail) => Math.max(fallbackCount, favoritePaperCountOf(detail.favorite), detail.papers.length),
    () => fallbackCount
  )
}

export function collectPaperToFavorite(userId, favoriteId, paperId) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paperId)
  if (!key || !id || !normalizedPaperId) return Promise.reject(new Error('favorite-collect-invalid'))

  const previous = getFavoriteFoldersSnapshot(key)
  const previousContent = getFavoriteFolderContentSnapshot(key, id)

  return getFavoriteFolderContent(key, previous.find((item) => item.id === id) || { id }).then((detail) => {
    if (findContentPaper(detail, normalizedPaperId)) throw favoriteAlreadyCollectedError()

    const next = setFavoritePaperMembership(previous, id, normalizedPaperId, true)
    setItems(key, next)
    updateFavoriteContentMembership(key, id, normalizedPaperId, true, typeof paperId === 'object' ? paperId : null)
    return User.collectFavorite(id, buildFavoriteCollectPayload(normalizedPaperId)).then(
      () => finalizeFavoriteMembership(key, id, normalizedPaperId, true),
      (error) => {
        if (isDuplicateFavoritePaperError(error)) {
          return finalizeFavoriteMembership(key, id, normalizedPaperId, true)
        }
        setItems(key, previous)
        if (previousContent) setFavoriteContentCache(key, id, previousContent)
        throw error
      }
    )
  })
}

export function removePaperFromFavorite(userId, favoriteId, paper) {
  const key = userKeyOf(userId)
  const id = normalizeFavoriteId(favoriteId)
  const normalizedPaperId = paperIdOf(paper)
  if (!key || !id || !normalizedPaperId) return Promise.reject(new Error('favorite-remove-invalid'))

  const previous = getFavoriteFoldersSnapshot(key)
  const previousContent = getFavoriteFolderContentSnapshot(key, id)
  return resolveFavoriteEntryId(key, id, paper).then((entryId) => {
    if (!entryId) return Promise.reject(new Error('favorite-entry-id-required'))
    const next = setFavoritePaperMembership(previous, id, normalizedPaperId, false)
    setItems(key, next)
    updateFavoriteContentMembership(key, id, normalizedPaperId, false)
    return User.deleteFavorite(entryId, {
      ...buildFavoriteCollectPayload(normalizedPaperId),
      folder_id: id
    })
  }).then(
    () => finalizeFavoriteMembership(key, id, normalizedPaperId, false),
    (error) => {
      setItems(key, previous)
      if (previousContent) setFavoriteContentCache(key, id, previousContent)
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
  if (!sourceId || sourceId === targetId) return collectPaperToFavorite(key, targetId, paperId)

  const previous = getFavoriteFoldersSnapshot(key)
  const previousSourceContent = sourceId ? getFavoriteFolderContentSnapshot(key, sourceId) : null
  const previousTargetContent = getFavoriteFolderContentSnapshot(key, targetId)
  const sourcePaper = findContentPaper(previousSourceContent, normalizedPaperId) || normalizedPaperId

  return getFavoriteFolderContent(key, previous.find((item) => item.id === targetId) || { id: targetId }).then((targetContent) => {
    if (findContentPaper(targetContent, normalizedPaperId)) throw favoriteAlreadyCollectedError()

    let next = setFavoritePaperMembership(previous, targetId, normalizedPaperId, true)
    next = setFavoritePaperMembership(next, sourceId, normalizedPaperId, false)
    setItems(key, next)
    updateFavoriteContentMembership(key, targetId, normalizedPaperId, true, typeof paperId === 'object' ? paperId : null)
    updateFavoriteContentMembership(key, sourceId, normalizedPaperId, false)

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
    .then(() => deleteFavoritePaperEntry(key, sourceId, sourcePaper))
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
        if (previousTargetContent) setFavoriteContentCache(key, targetId, previousTargetContent)
        if (previousSourceContent) setFavoriteContentCache(key, sourceId, previousSourceContent)
        throw error
      }
    )
  })
}
