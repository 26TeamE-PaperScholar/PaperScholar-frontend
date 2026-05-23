import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildFavoriteCreatePayload,
  buildFollowPayload,
  buildProfileUpdatePayload,
  extractCreatedFavorite,
  normalizeFavoriteName,
  normalizeFavoriteChoices,
  shouldFetchOnShowChange
} from '../src/utils/personal-page.mjs'

test('buildFollowPayload uses user_id for follow APIs', () => {
  assert.deepEqual(buildFollowPayload('A-123'), { user_id: 'A-123' })
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
