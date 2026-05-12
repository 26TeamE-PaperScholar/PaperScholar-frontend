/**
 * Single entry point that aggregates mock datasets.
 */
export { mockDelay, mockResponse, paginate } from './delay'

export { mockPapers, findPaper, searchPapers, hotPapers } from './papers'
export { mockAuthors, findAuthor, searchAuthors } from './authors'
export { mockInstitutions, findInstitution, searchInstitutions } from './institutions'
export { mockJournals, findJournal, searchJournals } from './journals'
export { mockTags, findTag } from './tags'
export { mockUser, mockFavorites, mockFollowing } from './user'
export { mockMessages } from './messages'
export { mockSubmittedApplications, mockAuditList } from './applications'
export { mockConversations, mockChatSuggestions } from './chat'
export { mockHotspot, mockInterestList, mockInterestRecommend } from './recommendations'
export { mockSearchHistory, mockViewHistory, mockRelationMap } from './history'
export {
  autocompletePapers,
  autocompleteAuthors,
  autocompleteInstitutions,
  autocompleteConcepts,
  autocompleteJournals,
  autocompleteAll
} from './autocomplete'

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'
