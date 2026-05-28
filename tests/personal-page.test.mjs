import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildFavoriteCreatePayload,
  buildFollowPayload,
  authorWorksFilter,
  dedupeWorks,
  buildInterestDeletePayload,
  buildInterestSelectPayload,
  buildProfileUpdatePayload,
  extractCreatedFavorite,
  normalizeConceptId,
  normalizeDoi,
  normalizeInterestId,
  normalizeOpenAlexAuthorId,
  normalizeOpenAlexWorkId,
  normalizeFavoriteName,
  normalizeFavoriteChoices,
  shouldFetchOnShowChange,
  workBelongsToAuthor
} from '../src/utils/personal-page.mjs'

test('buildFollowPayload uses openalex_id for follow APIs', () => {
  assert.deepEqual(buildFollowPayload('A-123'), { openalex_id: 'A-123' })
  assert.deepEqual(
    buildFollowPayload('https://openalex.org/A5102001778'),
    { openalex_id: 'A5102001778' }
  )
  assert.equal(normalizeOpenAlexAuthorId('https://openalex.org/A5102001778'), 'A5102001778')
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

test('normalizeFavoriteChoices maps favorite list to modal options', () => {
  assert.deepEqual(
    normalizeFavoriteChoices([
      { id: 'F-1', name: '综述' },
      { id: 'F-2', name: '组会' }
    ]),
    [
      { id: 'F-1', name: '综述' },
      { id: 'F-2', name: '组会' }
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
  assert.deepEqual(
    extractCreatedFavorite({ data: { favorite: { id: 'F-3', name: '综述', paper_ids: ['W1'] } } }, 'fallback'),
    { id: 'F-3', name: '综述', paper_ids: ['W1'], showContextMenu: false }
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
