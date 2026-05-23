import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildFavoriteCreatePayload,
  buildFollowPayload,
  buildInterestDeletePayload,
  buildInterestSelectPayload,
  buildProfileUpdatePayload,
  extractCreatedFavorite,
  normalizeConceptId,
  normalizeInterestId,
  normalizeOpenAlexAuthorId,
  normalizeFavoriteName,
  normalizeFavoriteChoices,
  shouldFetchOnShowChange
} from '../src/utils/personal-page.mjs'

test('buildFollowPayload uses openalex_id for follow APIs', () => {
  assert.deepEqual(buildFollowPayload('A-123'), { openalex_id: 'A-123' })
  assert.deepEqual(
    buildFollowPayload('https://openalex.org/A5102001778'),
    { openalex_id: 'A5102001778' }
  )
  assert.equal(normalizeOpenAlexAuthorId('https://openalex.org/A5102001778'), 'A5102001778')
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
