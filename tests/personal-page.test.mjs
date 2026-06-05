import test from 'node:test'
import assert from 'node:assert/strict'

import {
  appendCacheBust,
  avatarEndpointForUser,
  buildFavoriteCreatePayload,
  buildFavoriteCollectPayload,
  buildFollowPayload,
  authorWorksFilter,
  dedupeWorks,
  buildInterestDeletePayload,
  buildInterestSelectPayload,
  buildProfileUpdatePayload,
  extractCreatedFavorite,
  extractFavoriteDetail,
  favoritePaperCountOf,
  normalizeFavoriteListResponse,
  normalizeConceptId,
  normalizeDoi,
  normalizeInterestId,
  normalizeAvatarUrl,
  normalizeOpenAlexAuthorId,
  normalizeOpenAlexWorkId,
  normalizeFavoriteName,
  normalizeFavoriteChoices,
  removeFavoriteFromList,
  replaceFavoriteInList,
  resolveUserAvatarUrl,
  setFavoritePaperMembership,
  shouldFetchOnShowChange,
  upsertFavoriteInList,
  workBelongsToAuthor
} from '../src/utils/personal-page.mjs'
import {
  normalizeSearchHistory,
  normalizeViewHistory,
  paginateList,
  searchHistoryKeywordOf,
  viewHistoryPaperIdOf
} from '../src/utils/history.mjs'

test('buildFollowPayload uses openalex_id for follow APIs', () => {
  assert.deepEqual(buildFollowPayload('A-123'), { openalex_id: 'A-123' })
  assert.deepEqual(
    buildFollowPayload('https://openalex.org/A5102001778'),
    { openalex_id: 'A5102001778' }
  )
  assert.equal(normalizeOpenAlexAuthorId('https://openalex.org/A5102001778'), 'A5102001778')
})

test('search history helpers filter empty keyword records', () => {
  const items = [
    { id: 'H-1', keyword: '  graph search  ' },
    { id: 'H-2', keyword: '' },
    { id: 'H-3', content: 'RAG' },
    { id: 'H-4', search: '   ' },
    { pk: 'H-5', query: 'citation' }
  ]

  assert.equal(searchHistoryKeywordOf(items[0]), 'graph search')
  assert.deepEqual(
    normalizeSearchHistory(items).map((item) => [item.id, item.keyword]),
    [
      ['H-1', 'graph search'],
      ['H-3', 'RAG'],
      ['H-5', 'citation']
    ]
  )
})

test('search history helpers keep latest record for duplicate keywords', () => {
  const items = [
    { id: 'H-1', keyword: 'RAG', timestamp: '2024-12-01 10:00' },
    { id: 'H-2', keyword: 'graph search', timestamp: '2024-12-01 11:00' },
    { id: 'H-3', keyword: 'RAG', timestamp: '2024-12-02 09:30' },
    { id: 'H-4', keyword: 'graph search', timestamp: '2024-11-30 20:00' }
  ]

  assert.deepEqual(
    normalizeSearchHistory(items).map((item) => [item.id, item.keyword, item.timestamp]),
    [
      ['H-3', 'RAG', '2024-12-02 09:30'],
      ['H-2', 'graph search', '2024-12-01 11:00']
    ]
  )
})

test('view history helpers keep latest record for duplicate papers', () => {
  const items = [
    { id: 'V-1', paper_id: 'W1', viewed_at: '2024-12-01 10:00' },
    { id: 'V-2', paper_id: 'W2', timestamp: '2024-12-01 11:00' },
    { id: 'V-3', paper_id: 'W1', viewed_at: '2024-12-02 09:30' },
    { id: 'V-4', paperId: 'W2', viewed_at: '2024-11-30 20:00' },
    { id: 'V-5', paper_id: '' }
  ]

  assert.equal(viewHistoryPaperIdOf(items[3]), 'W2')
  assert.deepEqual(
    normalizeViewHistory(items).map((item) => [item.id, item.paper_id, item.viewed_at || item.timestamp]),
    [
      ['V-3', 'W1', '2024-12-02 09:30'],
      ['V-2', 'W2', '2024-12-01 11:00']
    ]
  )
})

test('paginateList slices locally and clamps invalid pages', () => {
  assert.deepEqual(
    paginateList([1, 2, 3, 4, 5], 2, 2),
    { items: [3, 4], currentPage: 2, perPage: 2, total: 5, totalPages: 3 }
  )
  assert.deepEqual(
    paginateList([1, 2, 3], 99, 2),
    { items: [3], currentPage: 2, perPage: 2, total: 3, totalPages: 2 }
  )
})

test('author work helpers build exact OpenAlex filters and normalize ids', () => {
  assert.equal(authorWorksFilter('https://api.openalex.org/authors/A5102001778'), 'author.id:A5102001778')
  assert.equal(normalizeOpenAlexWorkId('https://openalex.org/W2741809807'), 'W2741809807')
  assert.equal(normalizeDoi('https://doi.org/10.1038/S41586-020-2649-2'), '10.1038/s41586-020-2649-2')
})

test('workBelongsToAuthor validates authorships by id, orcid, then exact name', () => {
  const work = {
    authorships: [
      { author: { id: 'https://openalex.org/A1', display_name: 'Ada Lovelace' } },
      { author: { id: 'A2', display_name: 'Grace Hopper', orcid: '0000-0002' } }
    ]
  }

  assert.equal(workBelongsToAuthor(work, { id: 'A1', nickName: 'Someone Else' }), true)
  assert.equal(workBelongsToAuthor(work, { id: 'A9', orcid: '0000-0002' }), true)
  assert.equal(workBelongsToAuthor(work, { id: 'A9', nickName: 'Grace Hopper' }), true)
  assert.equal(workBelongsToAuthor(work, { id: 'A9', nickName: 'Grace' }), false)
  assert.equal(workBelongsToAuthor({ authorships: [] }, { id: 'A1', nickName: 'Ada Lovelace' }), false)
})

test('dedupeWorks removes repeated papers by id, DOI, or normalized title without merging metadata', () => {
  const first = { id: 'https://openalex.org/W1', title: 'SciPy 1.0: Fundamental Algorithms', cited_by_count: 10 }
  const sameId = { id: 'W1', title: 'Different title', cited_by_count: 99 }
  const sameDoi = { id: 'W2', doi: 'https://doi.org/10.1000/XYZ', title: 'Another paper' }
  const sameDoiAgain = { id: 'W3', doi: '10.1000/xyz', title: 'A preprint copy' }
  const sameTitle = { id: 'W4', title: 'SciPy 1.0 fundamental algorithms' }

  assert.deepEqual(
    dedupeWorks([first, sameId, sameDoi, sameDoiAgain, sameTitle]),
    [first, sameDoi]
  )
})

test('buildProfileUpdatePayload keeps editable profile fields including email', () => {
  const payload = buildProfileUpdatePayload({
    nickName: 'Alice',
    realName: 'Alice Doe',
    gender: 'gender_female',
    institution: 'PaperScholar Lab',
    email: 'alice@example.edu',
    urls: ['https://example.edu']
  })

  assert.deepEqual(payload, {
    username: 'Alice',
    real_name: 'Alice Doe',
    gender: 'gender_female',
    institution: 'PaperScholar Lab',
    email: 'alice@example.edu',
    websites: ['https://example.edu']
  })
})

test('avatar helpers normalize profile fields and fallback endpoint urls', () => {
  assert.equal(normalizeAvatarUrl({ avatar_url: 'https://cdn.example.edu/a.png' }), 'https://cdn.example.edu/a.png')
  assert.equal(normalizeAvatarUrl({ avatarUrl: '/media/avatars/u1.png' }), '/media/avatars/u1.png')
  assert.equal(normalizeAvatarUrl({ avatar: { url: 'users/U-1/avatar/' } }), '/api/users/U-1/avatar/')
  assert.equal(
    resolveUserAvatarUrl({ data: { user: { profile_image: 'api/users/U-2/avatar/' } } }, 'U-2'),
    '/api/users/U-2/avatar/'
  )
  assert.equal(resolveUserAvatarUrl({ username: 'Alice' }, 'U 3'), '/api/users/U%203/avatar/')
  assert.equal(resolveUserAvatarUrl({ username: 'Alice' }, 'U 3', { fallbackToEndpoint: false }), '')
  assert.equal(avatarEndpointForUser('U 4', 123), '/api/users/U%204/avatar/?_t=123')
  assert.equal(appendCacheBust('/api/users/U-5/avatar?size=large', 'now'), '/api/users/U-5/avatar?size=large&_t=now')
  assert.equal(appendCacheBust('blob:http://localhost/avatar-preview', 'now'), 'blob:http://localhost/avatar-preview')
})

test('normalizeFavoriteChoices maps favorite list to modal options', () => {
  assert.deepEqual(
    normalizeFavoriteChoices([
      { id: 'F-1', name: '综述' },
      { id: 'F-2', name: '组会' }
    ]),
    [
      { id: 'F-1', name: '综述', pending: false, paper_ids: [], paper_count: 0, showContextMenu: false },
      { id: 'F-2', name: '组会', pending: false, paper_ids: [], paper_count: 0, showContextMenu: false }
    ]
  )
})

test('shouldFetchOnShowChange only fetches when modal transitions to visible', () => {
  assert.equal(shouldFetchOnShowChange(false, false), false)
  assert.equal(shouldFetchOnShowChange(true, true), false)
  assert.equal(shouldFetchOnShowChange(false, true), false)
  assert.equal(shouldFetchOnShowChange(true, false), true)
})

test('favorite creation helpers trim names and normalize response shapes', () => {
  assert.equal(normalizeFavoriteName('  组会论文  '), '组会论文')
  assert.deepEqual(buildFavoriteCreatePayload('  组会论文  '), { name: '组会论文' })
  assert.deepEqual(buildFavoriteCollectPayload(' W1 '), { paper_id: 'W1' })
  assert.deepEqual(
    extractCreatedFavorite({ data: { favorite: { id: 'F-3', name: '综述', paper_ids: ['W1'] } } }, 'fallback'),
    { id: 'F-3', name: '综述', paper_ids: ['W1'], paper_count: 1, showContextMenu: false, pending: false }
  )
})

test('favorite list helpers normalize wrapped API shapes and keep stable ids', () => {
  assert.deepEqual(
    normalizeFavoriteListResponse({
      data: {
        code: 0,
        data: {
          items: [
            { pk: 7, title: '机器学习', papers: [{ id: 'W1' }, { paper_id: 'W1' }] },
            { id: '7', name: 'duplicate from stale cache' },
            { favorite_id: 'F-2', folder_name: '组会', paperIds: ['W2'] }
          ]
        }
      }
    }),
    [
      { pk: 7, title: '机器学习', papers: [{ id: 'W1' }, { paper_id: 'W1' }], id: '7', name: '机器学习', paper_ids: ['W1'], paper_count: 1, showContextMenu: false, pending: false },
      { favorite_id: 'F-2', folder_name: '组会', paperIds: ['W2'], id: 'F-2', name: '组会', paper_ids: ['W2'], paper_count: 1, showContextMenu: false, pending: false }
    ]
  )
  assert.equal(favoritePaperCountOf({ paper_count: 5, paper_ids: ['W1'] }), 5)
})

test('favorite list mutation helpers upsert replace remove and update paper membership by id', () => {
  const list = [{ id: 'F-1', name: 'A', paper_ids: ['W1'] }]
  assert.deepEqual(
    upsertFavoriteInList(list, { id: 'F-2', name: 'B' }).map((item) => item.id),
    ['F-2', 'F-1']
  )
  assert.deepEqual(
    replaceFavoriteInList(list, 'F-1', { id: 'F-3', name: 'C' }).map((item) => item.id),
    ['F-3']
  )
  assert.deepEqual(removeFavoriteFromList(list, 'F-1'), [])
  assert.deepEqual(
    setFavoritePaperMembership(list, 'F-1', 'W2', true)[0].paper_ids,
    ['W1', 'W2']
  )
  assert.deepEqual(
    setFavoritePaperMembership(list, 'F-1', 'W1', false)[0].paper_ids,
    []
  )
})

test('favorite detail helper extracts papers without confusing folder deletion fields', () => {
  assert.deepEqual(
    extractFavoriteDetail({
      data: {
        data: {
          id: 'F-1',
          name: '阅读清单',
          papers: [{ paper_id: 'W1', title: 'Paper 1' }]
        }
      }
    }),
    {
      favorite: { id: 'F-1', name: '阅读清单', paper_ids: ['W1'], paper_count: 1, showContextMenu: false, pending: false, papers: [{ paper_id: 'W1', title: 'Paper 1' }] },
      papers: [{ paper_id: 'W1', title: 'Paper 1', id: 'W1', favorite_id: 'F-1' }]
    }
  )

  assert.deepEqual(
    extractFavoriteDetail({
      data: {
        favorite: { id: 'F-2', name: '待读' },
        paper_ids: ['W2', 'W3']
      }
    }),
    {
      favorite: { id: 'F-2', name: '待读', paper_ids: ['W2', 'W3'], paper_count: 2, showContextMenu: false, pending: false },
      papers: []
    }
  )
})

test('interest selection payload uses integer ids required by backend', () => {
  const interestList = [
    { 'Artificial intelligence': [{ id: 2, name: 'Artificial intelligence', concept_id: '154945302' }] },
    { Humanities: [{ id: 1, name: 'Humanities' }] }
  ]
  assert.equal(normalizeInterestId({ id: 'C12' }), null)
  assert.equal(normalizeInterestId({ id: 154945302, name: 'Artificial intelligence' }, interestList), 2)
  assert.equal(normalizeInterestId({ concept_id: '154945302' }, interestList), 2)
  assert.equal(normalizeInterestId({ key: '34' }), 34)
  assert.deepEqual(
    buildInterestSelectPayload([{ id: 154945302, name: 'Artificial intelligence' }, { id: 1 }, '3', { key: 'invalid' }], interestList),
    { interests: [2, 1] }
  )
})

test('interest delete payload prefers backend interest id and falls back to concept id', () => {
  const interestList = [
    { 'Artificial intelligence': [{ id: 2, name: 'Artificial intelligence' }] }
  ]
  assert.equal(normalizeConceptId('https://openalex.org/C154945302'), 'C154945302')
  assert.deepEqual(
    buildInterestDeletePayload({ id: 154945302, name: 'Artificial intelligence' }, interestList),
    { interest_id: 2 }
  )
  assert.deepEqual(
    buildInterestDeletePayload({ id: '2778407487', name: 'World Wide Web' }, interestList),
    { concept_id: '2778407487' }
  )
})
