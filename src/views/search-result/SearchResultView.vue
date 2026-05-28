<template>
  <div class="ps-results">
    <!-- ── Top search bar ─────────────────────────────────── -->
    <div class="ps-results__hero">
      <div class="ps-results__search">
        <AppIcon name="Search" :size="18" />
        <input
          v-model="search"
          type="text"
          :placeholder="placeholderText"
          @keyup.enter="submitMainSearch"
        />
        <button class="ps-results__search-clear" v-if="search" @click="search = ''" :aria-label="$t('search_results_clear_aria')">
          <AppIcon name="Close" :size="14" />
        </button>
        <button class="ps-results__search-btn" @click="submitMainSearch">
          {{ $t('search_text') }}
        </button>
      </div>

      <div class="ps-results__type-tabs">
        <button
          v-for="t in typeTabs"
          :key="t.value"
          type="button"
          class="ps-results__type-tab"
          :class="{ 'ps-results__type-tab--active': search_type == t.value }"
          @click="setSearchTypeFromTab(t.value)"
        >
          <AppIcon :name="t.icon" :size="14" />
          {{ $t(t.labelKey) }}
        </button>
      </div>
    </div>

    <div class="ps-results__layout">
      <!-- ── Filter sidebar ─────────────────────────────── -->
      <aside class="ps-results__sidebar">
        <div class="ps-results__sidebar-section">
          <h3 class="ps-results__sidebar-title">
            <AppIcon name="FilterOutline" :size="14" />
            {{ $t('search_results_filter') }}
          </h3>
          <details class="ps-results__filter" open>
            <summary>{{ $t('search_results_publication_time') }}</summary>
            <div class="ps-results__filter-options">
              <button
                v-for="opt in timeOptions"
                :key="opt.value"
                class="ps-results__filter-chip"
                :class="{ 'ps-results__filter-chip--active': timeFilter === opt.value }"
                @click="setFilterTime(opt.value)"
              >{{ $t(opt.labelKey) }}</button>
            </div>
            <div v-if="timeFilter === 'custom'" class="ps-results__filter-range">
              <input
                class="basic-input"
                type="text"
                placeholder="2020"
                v-model="search_start_time"
                @change="applyCustomTimeFilter"
                @keyup.enter="applyCustomTimeFilter"
              />
              <span>~</span>
              <input
                class="basic-input"
                type="text"
                placeholder="2024"
                v-model="search_end_time"
                @change="applyCustomTimeFilter"
                @keyup.enter="applyCustomTimeFilter"
              />
            </div>
          </details>

          <details class="ps-results__filter" open>
            <summary>{{ $t('search_results_citations') }}</summary>
            <div class="ps-results__filter-options">
              <button
                class="ps-results__filter-chip"
                :class="{ 'ps-results__filter-chip--active': citeFilter === 0 }"
                @click="filteByCount(0)"
              >{{ $t('search_option_all') }}</button>
              <button
                class="ps-results__filter-chip"
                :class="{ 'ps-results__filter-chip--active': citeFilter === 1 }"
                @click="filteByCount(1)"
              >&gt; <input
                @click.stop
                @change="applyCitationFilter"
                @keyup.enter="applyCitationFilter"
                type="text"
                v-model="filte_count_value"
                class="ps-results__filter-input"
              />
              </button>
            </div>
          </details>

          <details v-if="search_type == 1" class="ps-results__filter" open>
            <summary>{{ $t('search_results_language') }}</summary>
            <div class="ps-results__filter-options">
              <button
                v-for="opt in langOptions"
                :key="opt.value"
                class="ps-results__filter-chip"
                :class="{ 'ps-results__filter-chip--active': langFilter === opt.value }"
                @click="setLanguage(opt.value)"
              >{{ opt.labelKey ? $t(opt.labelKey) : opt.label }}</button>
            </div>
          </details>

          <details v-if="search_type == 3" class="ps-results__filter">
            <summary>{{ $t('search_results_source_type') }}</summary>
            <div class="ps-results__filter-options">
              <button
                v-for="opt in journalTypes"
                :key="opt.value"
                class="ps-results__filter-chip"
                :class="{ 'ps-results__filter-chip--active': journalFilter === opt.value }"
                @click="setJounalType(opt.value)"
              >{{ $t(opt.labelKey) }}</button>
            </div>
          </details>
        </div>

        <div class="ps-results__sidebar-section">
          <h3 class="ps-results__sidebar-title">
            <AppIcon name="StatsChart" :size="14" />
            {{ $t('sort') }}
          </h3>
          <div class="ps-results__filter-options ps-results__filter-options--column">
            <button
              v-for="opt in sortOptionsForCurrentType"
              :key="opt.value"
              class="ps-results__sort-row"
              :class="{ 'ps-results__sort-row--active': activeSort === opt.value }"
              @click="setSort(opt.value)"
            >
              <span>{{ $t(opt.labelKey) }}</span>
              <AppIcon :name="opt.icon" :size="13" />
            </button>
          </div>
        </div>

        <div class="ps-results__sidebar-section">
          <h3 class="ps-results__sidebar-title">
            <AppIcon name="Layers" :size="14" />
            {{ $t('advanced_search') }}
          </h3>
          <button class="ps-results__advanced-toggle" @click="showAdvancedSearch = !showAdvancedSearch">
            {{ showAdvancedSearch ? $t('search_results_advanced_toggle_collapse') : $t('search_results_advanced_toggle_expand') }}
            <AppIcon :name="showAdvancedSearch ? 'ChevronDown' : 'ChevronForward'" :size="14" />
          </button>
          <div v-show="showAdvancedSearch" class="ps-results__advanced">
            <label>
              <span>{{ $t('author_search') }}</span>
              <input class="basic-input" type="text" v-model="advancedSearchForm.author" placeholder="Einstein" />
            </label>
            <label>
              <span>{{ $t('search_results_source_journal') }}</span>
              <input class="basic-input" type="text" v-model="advancedSearchForm.publication" placeholder="Nature" />
            </label>
            <label>
              <span>{{ $t('search_results_year_range') }}</span>
              <div class="ps-results__advanced-range">
                <input class="basic-input" type="text" v-model="advancedSearchForm.start_time" placeholder="2018" />
                <span>~</span>
                <input class="basic-input" type="text" v-model="advancedSearchForm.end_time" placeholder="2024" />
              </div>
            </label>
            <label>
              <span>{{ $t('advanced_search_publish_keyword') }}</span>
              <input class="basic-input" type="text" v-model="advancedSearchForm.keyword" />
            </label>
            <label class="ps-results__advanced-check">
              <input type="checkbox" v-model="advancedSearchForm.is_key_title" />
              <span>{{ $t('search_results_title_only') }}</span>
            </label>
            <button class="basic-btn ps-results__advanced-submit" @click="submitAdvancedSearch">
              {{ $t('search_results_apply_advanced') }}
            </button>
          </div>
        </div>
      </aside>

      <!-- ── Result main ──────────────────────────────────── -->
      <section class="ps-results__main">
        <div class="ps-results__header">
          <div>
            <p class="ps-results__count">
              <span v-html="$t('search_results_total', { count: '<strong>' + totalCount + '</strong>' })"></span>
              <span v-if="submittedSearch" class="ps-results__count-keyword">{{ $t('search_results_about', { keyword: submittedSearch }) }}</span>
            </p>
            <p class="ps-results__took">{{ $t('search_results_took', { ms: tookMs, page: currentPage, total: totalPages }) }}</p>
          </div>
          <div class="ps-results__sort-quick">
            <span>{{ $t('sort') }}</span>
            <select v-model="quickSort" @change="setSort(quickSort)">
              <option v-for="opt in sortOptionsForCurrentType" :key="opt.value" :value="opt.value">
                {{ $t(opt.labelKey) }}
              </option>
            </select>
          </div>
        </div>

        <template v-if="displayLoading">
          <AppSkeletonCard v-for="i in 4" :key="'sk-' + i" />
        </template>

        <template v-else-if="!infoItems.length">
          <AppEmptyState :title="$t('search_results_empty_title')" :description="$t('search_results_empty_desc')">
            <template #actions>
              <button class="basic-btn-outline" @click="clearAll">{{ $t('search_results_clear_filters') }}</button>
            </template>
          </AppEmptyState>
        </template>

        <template v-else>
          <component
            :is="resultComponent"
            v-for="(info, index) in infoItems"
            :key="info.id || index"
            :infoItem="info"
            :index="(currentPage - 1) * itemsPerPage + index"
          />

          <div class="ps-results__pagination">
            <PaginationBar
              :items-per-page="itemsPerPage"
              :current-page="currentPage"
              :total-pages="totalPages"
              @page-change="changePages"
              @item-per-page-change="changeItemPerpage"
            />
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<script>
import SearchResultListItem from '../../components/search-result-list/SearchResultListItem.vue'
import PaginationBar from '../../components/pagination/PaginationBar.vue'
import InstitutionListItem from '../../components/list-item/InstitutionListItem.vue'
import JournalListItem from '../../components/list-item/JournalListItem.vue'
import ScholarListItem from '../../components/list-item/ScholarListItem.vue'
import { Search } from '../../api/search.js'
import { AppCard, AppIcon, AppSkeletonCard, AppEmptyState } from '../../components/ui'

const TYPE_TABS = [
  { value: 1, labelKey: 'search_type_paper', icon: 'Document' },
  { value: 2, labelKey: 'search_type_scholar', icon: 'Person' },
  { value: 3, labelKey: 'search_type_journal_conference', icon: 'BookOutline' },
  { value: 4, labelKey: 'search_type_institution', icon: 'School' }
]

const PLACEHOLDERS = {
  1: 'search_placeholder_paper',
  2: 'search_placeholder_scholar',
  3: 'search_placeholder_journal',
  4: 'search_placeholder_institution'
}

const CURRENT_YEAR = new Date().getFullYear()
const RECENT_2_START_YEAR = CURRENT_YEAR - 1
const RECENT_5_START_YEAR = CURRENT_YEAR - 4

const TIME_OPTIONS = [
  { value: 'all', labelKey: 'search_option_all' },
  { value: 'last2', labelKey: 'search_option_recent_2' },
  { value: 'last5', labelKey: 'search_option_recent_5' },
  { value: '2022', labelKey: 'search_option_since_2022' },
  { value: 'custom', labelKey: 'search_option_custom' }
]

const LANG_OPTIONS = [
  { value: 'all', labelKey: 'search_option_all' },
  { value: 'en', label: 'English' },
  { value: 'zh-cn', labelKey: 'search_option_chinese' }
]

const JOURNAL_TYPES = [
  { value: 0, labelKey: 'search_option_all' },
  { value: 1, labelKey: 'search_option_journal' },
  { value: 2, labelKey: 'search_option_preprint' },
  { value: 3, labelKey: 'search_option_conference' }
]

const SORT_OPTIONS = [
  { value: 'cited_by_count:desc', labelKey: 'sort_citations_desc', icon: 'ArrowDown' },
  { value: 'cited_by_count:asc', labelKey: 'sort_citations_asc', icon: 'ArrowUp' },
  { value: 'publication_date:desc', labelKey: 'sort_date_desc', icon: 'ArrowDown' },
  { value: 'publication_date:asc', labelKey: 'sort_date_asc', icon: 'ArrowUp' },
  { value: 'display_name:asc', labelKey: 'sort_name_asc', icon: 'ArrowDown' }
]

const ENTITY_SORT_OPTIONS = [
  { value: 'cited_by_count:desc', labelKey: 'sort_citations_desc', icon: 'ArrowDown' },
  { value: 'cited_by_count:asc', labelKey: 'sort_citations_asc', icon: 'ArrowUp' },
  { value: 'works_count:desc', labelKey: 'sort_works_desc', icon: 'ArrowDown' },
  { value: 'works_count:asc', labelKey: 'sort_works_asc', icon: 'ArrowUp' },
  { value: 'display_name:asc', labelKey: 'sort_name_asc', icon: 'ArrowDown' }
]

const LEGACY_SORT_MAP = {
  'cited_by_count:': 'cited_by_count:asc',
  'publication_date:': 'publication_date:asc',
  'works_count:': 'works_count:asc',
  'display_name:': 'display_name:asc'
}

function normalizeSortValue(sort) {
  if (!sort) return 'cited_by_count:desc'
  return LEGACY_SORT_MAP[sort] || sort
}

function sortOptionsForType(type) {
  if (Number(type) === 1) return SORT_OPTIONS
  return ENTITY_SORT_OPTIONS
}

function normalizeSortForType(sort, type) {
  const normalized = normalizeSortValue(sort)
  const allowed = sortOptionsForType(type).some((opt) => opt.value === normalized)
  return allowed ? normalized : 'cited_by_count:desc'
}

function toPositiveInteger(value, fallback = 1) {
  const n = Number(value)
  if (!Number.isFinite(n) || n < 1) return fallback
  return Math.floor(n)
}

function filterParts(filter) {
  return String(filter || '').split(',').map((p) => p.trim()).filter(Boolean)
}

function buildTimeFilter(timeFilter, start, end) {
  if (timeFilter === 'last2') return `publication_year:${RECENT_2_START_YEAR}-`
  if (timeFilter === 'last5') return `publication_year:${RECENT_5_START_YEAR}-`
  if (timeFilter === '2022') return 'publication_year:2022-'
  if (timeFilter !== 'custom') return ''

  const from = String(start || '').trim()
  const to = String(end || '').trim()
  if (from && to) return `publication_year:${from}-${to}`
  if (from) return `publication_year:${from}-`
  if (to) return `publication_year:-${to}`
  return ''
}

function parseTimeFilter(part) {
  const value = part.slice('publication_year:'.length)
  const [from = '', to = ''] = value.split('-')
  if (from === String(RECENT_2_START_YEAR) && !to) return { timeFilter: 'last2' }
  if (from === String(RECENT_5_START_YEAR) && !to) return { timeFilter: 'last5' }
  if (from === '2022' && !to) return { timeFilter: '2022' }
  return {
    timeFilter: 'custom',
    search_start_time: from || RECENT_2_START_YEAR,
    search_end_time: to || CURRENT_YEAR
  }
}

function buildAdvancedFilterParts(data) {
  const parts = []
  if (data.author) parts.push(`author.search:${encodeURIComponent(data.author)}`)
  if (data.publication) parts.push(`source.search:${encodeURIComponent(data.publication)}`)
  if (data.keyword) {
    const field = data.is_key_title ? 'title.search' : 'abstract.search'
    parts.push(`${field}:${encodeURIComponent(data.keyword)}`)
  }
  return parts
}

function sortValueOf(item, field) {
  if (field === 'display_name') return item.display_name || item.title || ''
  if (field === 'publication_date') return new Date(item.publication_date || 0).getTime()
  return Number(item[field] || 0)
}

function sortItemsForCurrentPage(items, sort) {
  const [field, direction = 'asc'] = normalizeSortValue(sort).split(':')
  const factor = direction === 'desc' ? -1 : 1
  return [...items].sort((a, b) => {
    const av = sortValueOf(a, field)
    const bv = sortValueOf(b, field)
    if (typeof av === 'string' || typeof bv === 'string') {
      return factor * String(av).localeCompare(String(bv))
    }
    return factor * (av - bv)
  })
}

export default {
  name: 'SearchResultView',
  components: {
    SearchResultListItem,
    PaginationBar,
    InstitutionListItem,
    JournalListItem,
    ScholarListItem,
    AppCard,
    AppIcon,
    AppSkeletonCard,
    AppEmptyState
  },
  data() {
    return {
      SORT_OPTIONS,
      showAdvancedSearch: false,
      advancedSearchForm: {
        author: '',
        publication: '',
        start_time: '',
        end_time: '',
        keyword: '',
        is_key_title: true
      },

      timeFilter: 'all',
      citeFilter: 0,
      langFilter: 'all',
      journalFilter: 0,
      advancedFilterParts: [],

      filte_count_value: 10,
      activeSort: 'cited_by_count:desc',
      quickSort: 'cited_by_count:desc',

      totalPages: 1,
      currentPage: 1,
      itemsPerPage: 10,
      displayLoading: false,
      tookMs: 0,
      searchRequestSeq: 0,

      infoItems: [],
      totalCount: 0,

      filter: '',
      search: '',
      submittedSearch: '',
      sort: 'cited_by_count:desc',
      per_page: '10',
      page: '1',
      cursor: '',

      search_start_time: RECENT_2_START_YEAR,
      search_end_time: CURRENT_YEAR,
      search_type: 1
    }
  },
  computed: {
    placeholderText() {
      return this.$t(PLACEHOLDERS[this.search_type] || 'search_placeholder_paper')
    },
    typeTabs() {
      return TYPE_TABS
    },
    timeOptions() {
      return TIME_OPTIONS
    },
    langOptions() {
      return LANG_OPTIONS
    },
    journalTypes() {
      return JOURNAL_TYPES
    },
    sortOptionsForCurrentType() {
      return sortOptionsForType(this.search_type)
    },
    resultComponent() {
      switch (Number(this.search_type)) {
        case 2: return 'ScholarListItem'
        case 3: return 'JournalListItem'
        case 4: return 'InstitutionListItem'
        default: return 'SearchResultListItem'
      }
    }
  },
  watch: {
    '$route.query': {
      immediate: true,
      handler(newQuery) {
        const q = newQuery || {}
        const nextType = Number(q.search_type) || 1
        const nextSort = normalizeSortForType(q.sort || 'cited_by_count:desc', nextType)
        this.search = q.search || ''
        this.submittedSearch = this.search
        this.search_type = nextType
        this.sort = nextSort
        this.quickSort = this.sort
        this.activeSort = this.sort
        this.per_page = q.per_page || '10'
        this.itemsPerPage = toPositiveInteger(this.per_page, 10)
        this.currentPage = toPositiveInteger(q.page, 1)
        this.page = String(this.currentPage)
        this.cursor = q.cursor || ''
        this.filter = (q.filter || '').replace(/,$/, '')
        this.applyFilterStateFromFilter(this.filter)
        this.searchmethod()
      }
    }
  },
  methods: {
    applyFilterStateFromFilter(filter) {
      const state = {
        timeFilter: 'all',
        citeFilter: 0,
        langFilter: 'all',
        journalFilter: 0,
        search_start_time: RECENT_2_START_YEAR,
        search_end_time: CURRENT_YEAR,
        filte_count_value: this.filte_count_value,
        advancedFilterParts: []
      }

      filterParts(filter).forEach((part) => {
        if (part.startsWith('publication_year:')) {
          Object.assign(state, parseTimeFilter(part))
        } else if (part.startsWith('cited_by_count:>')) {
          state.citeFilter = 1
          state.filte_count_value = toPositiveInteger(part.slice('cited_by_count:>'.length), state.filte_count_value)
        } else if (part.startsWith('language:')) {
          state.langFilter = part.slice('language:'.length) || 'all'
        } else if (part === 'type:journal') {
          state.journalFilter = 1
        } else if (part === 'type:repository') {
          state.journalFilter = 2
        } else if (part === 'type:conference') {
          state.journalFilter = 3
        } else {
          state.advancedFilterParts.push(part)
        }
      })

      this.timeFilter = state.timeFilter
      this.citeFilter = state.citeFilter
      this.langFilter = state.langFilter
      this.journalFilter = state.journalFilter
      this.search_start_time = state.search_start_time
      this.search_end_time = state.search_end_time
      this.filte_count_value = state.filte_count_value
      this.advancedFilterParts = state.advancedFilterParts
    },
    buildFilter() {
      const type = Number(this.search_type)
      const parts = []
      const timeFilter = buildTimeFilter(this.timeFilter, this.search_start_time, this.search_end_time)
      if (timeFilter) parts.push(timeFilter)
      if (this.citeFilter === 1) {
        const citeValue = toPositiveInteger(this.filte_count_value, 0)
        if (citeValue > 0) parts.push(`cited_by_count:>${citeValue}`)
      }
      if (type === 1 && this.langFilter !== 'all') {
        parts.push(`language:${this.langFilter}`)
      }
      if (type === 3) {
        if (this.journalFilter === 1) parts.push('type:journal')
        else if (this.journalFilter === 2) parts.push('type:repository')
        else if (this.journalFilter === 3) parts.push('type:conference')
      }
      parts.push(...this.advancedFilterParts)
      return parts.join(',')
    },
    submitMainSearch() {
      this.currentPage = 1
      this.setQuery()
    },
    setSearchTypeFromTab(type) {
      this.search_type = Number(type)
      this.sort = normalizeSortForType(this.sort, this.search_type)
      this.quickSort = this.sort
      this.activeSort = this.sort
      this.currentPage = 1
      this.setQuery()
    },
    setFilterTime(value) {
      this.timeFilter = value
      this.currentPage = 1
      this.setQuery()
    },
    applyCustomTimeFilter() {
      if (this.timeFilter !== 'custom') return
      this.currentPage = 1
      this.setQuery()
    },
    filteByCount(type) {
      this.citeFilter = type
      this.currentPage = 1
      this.setQuery()
    },
    applyCitationFilter() {
      if (this.citeFilter !== 1) return
      this.currentPage = 1
      this.setQuery()
    },
    setLanguage(type) {
      this.langFilter = type
      this.currentPage = 1
      this.setQuery()
    },
    setJounalType(type) {
      this.journalFilter = type
      this.currentPage = 1
      this.setQuery()
    },
    setSort(value) {
      this.sort = normalizeSortForType(value, this.search_type)
      this.activeSort = this.sort
      this.quickSort = this.sort
      this.currentPage = 1
      this.setQuery()
    },
    submitAdvancedSearch() {
      const data = this.advancedSearchForm
      if (data.start_time && data.end_time) {
        this.timeFilter = 'custom'
        this.search_start_time = data.start_time
        this.search_end_time = data.end_time
      }
      this.advancedFilterParts = buildAdvancedFilterParts(data)
      this.currentPage = 1
      this.setQuery()
    },
    clearAll() {
      this.filter = ''
      this.timeFilter = 'all'
      this.citeFilter = 0
      this.langFilter = 'all'
      this.journalFilter = 0
      this.advancedFilterParts = []
      this.advancedSearchForm = {
        author: '',
        publication: '',
        start_time: '',
        end_time: '',
        keyword: '',
        is_key_title: true
      }
      this.search_start_time = RECENT_2_START_YEAR
      this.search_end_time = CURRENT_YEAR
      this.currentPage = 1
      this.setQuery()
    },
    setQuery() {
      this.filter = this.buildFilter()
      const query = {
        filter: this.filter,
        search: this.search,
        sort: this.sort,
        per_page: String(this.itemsPerPage),
        page: String(this.currentPage),
        cursor: '',
        search_type: this.search_type
      }
      this.$router.push({ query })
    },
    changePages(page) {
      this.currentPage = toPositiveInteger(page, 1)
      this.setQuery()
    },
    changeItemPerpage(n) {
      this.itemsPerPage = n
      this.currentPage = 1
      this.setQuery()
    },
    searchmethod() {
      this.displayLoading = true
      const requestId = ++this.searchRequestSeq
      const started = Date.now()
      const submittedSearch = this.search
      const params = {
        filter: this.filter,
        search: submittedSearch,
        sort: this.sort,
        per_page: this.itemsPerPage,
        page: this.currentPage,
        cursor: this.cursor
      }
      const type = Number(this.search_type)
      let api = Search.searchWorks
      if (type === 2) api = Search.searchAuthor
      else if (type === 3) api = Search.searchSources
      else if (type === 4) api = Search.searchInstitutions
      api.call(Search, params).then(
        (res) => {
          if (requestId !== this.searchRequestSeq) return
          const data = (res && res.data) || {}
          this.infoItems = sortItemsForCurrentPage(
            (data.results || []).map((r) => ({ ...r, keyword: submittedSearch })),
            this.sort
          )
          this.submittedSearch = submittedSearch
          const meta = data.meta || {}
          this.totalCount = meta.count || this.infoItems.length
          this.totalPages = meta.total_pages || Math.max(1, Math.ceil(this.totalCount / this.itemsPerPage))
          this.tookMs = Date.now() - started
          this.displayLoading = false
        },
        () => {
          if (requestId !== this.searchRequestSeq) return
          this.infoItems = []
          this.totalCount = 0
          this.totalPages = 1
          this.tookMs = Date.now() - started
          this.displayLoading = false
        }
      )
    }
  }
}
</script>

<style scoped>
.ps-results {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-6) var(--ps-space-6) var(--ps-space-10);
}

.ps-results__hero {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-xl);
  padding: var(--ps-space-5) var(--ps-space-6);
  box-shadow: var(--ps-shadow-1);
  margin-bottom: var(--ps-space-6);
}

.ps-results__search {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  height: 52px;
  padding: 0 var(--ps-space-3) 0 var(--ps-space-4);
  background: var(--ps-bg-page);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-pill);
  transition: border-color var(--ps-motion-base) var(--ps-ease-out),
    box-shadow var(--ps-motion-base) var(--ps-ease-out);
}

.ps-results__search:focus-within {
  border-color: var(--ps-color-primary);
  box-shadow: var(--ps-shadow-focus);
}

.ps-results__search input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: 0;
  font-size: var(--ps-fs-md);
  color: var(--ps-text-1);
  min-width: 0;
}

.ps-results__search input::placeholder { color: var(--ps-text-3); }

.ps-results__search-clear {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ps-bg-sunken);
  color: var(--ps-text-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ps-results__search-btn {
  height: 38px;
  padding: 0 18px;
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  border-radius: var(--ps-radius-pill);
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  cursor: pointer;
}

.ps-results__search-btn:hover {
  background: var(--ps-color-primary-strong);
}

.ps-results__type-tabs {
  display: flex;
  gap: var(--ps-space-1);
  margin-top: var(--ps-space-4);
  padding: 4px;
  background: var(--ps-bg-sunken);
  border-radius: var(--ps-radius-pill);
  width: fit-content;
}

.ps-results__type-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-text-2);
  background: transparent;
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-results__type-tab:hover { color: var(--ps-text-1); }

.ps-results__type-tab--active {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  box-shadow: var(--ps-shadow-1);
}

/* ── Layout ──────────────────────────────────────────── */
.ps-results__layout {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: var(--ps-space-6);
  align-items: flex-start;
}

.ps-results__sidebar {
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-5));
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-5);
}

.ps-results__sidebar-section {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
}

.ps-results__sidebar-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ps-fs-xs);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ps-text-3);
  margin-bottom: var(--ps-space-3);
}

.ps-results__filter {
  border-bottom: 1px dashed var(--ps-border-1);
  padding-bottom: var(--ps-space-3);
  margin-bottom: var(--ps-space-3);
}
.ps-results__filter:last-child {
  border: 0;
  padding: 0;
  margin: 0;
}

.ps-results__filter summary {
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-1);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
}

.ps-results__filter summary::-webkit-details-marker { display: none; }
.ps-results__filter summary::after {
  content: '+';
  font-size: 16px;
  color: var(--ps-text-3);
}
.ps-results__filter[open] summary::after { content: '–'; }

.ps-results__filter-options {
  margin-top: var(--ps-space-3);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ps-results__filter-options--column {
  flex-direction: column;
}

.ps-results__filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-text-2);
  background: var(--ps-bg-sunken);
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-results__filter-chip:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-results__filter-chip--active {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

.ps-results__filter-input {
  width: 56px;
  font-size: var(--ps-fs-xs);
  background: transparent;
  border: 0;
  outline: 0;
  color: inherit;
  text-align: center;
}

.ps-results__filter-range {
  margin-top: var(--ps-space-3);
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
}

.ps-results__filter-range .basic-input { height: 32px; padding: 0 10px; font-size: 13px; }

.ps-results__sort-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 10px;
  font-size: var(--ps-fs-sm);
  font-weight: 500;
  color: var(--ps-text-2);
  background: transparent;
  border-radius: var(--ps-radius-sm);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-results__sort-row:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-results__sort-row--active {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
  font-weight: 700;
}

.ps-results__advanced-toggle {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-color-primary);
  background: var(--ps-color-primary-soft);
  border-radius: var(--ps-radius-sm);
  cursor: pointer;
}

.ps-results__advanced {
  margin-top: var(--ps-space-3);
  display: grid;
  gap: var(--ps-space-3);
}

.ps-results__advanced label {
  display: grid;
  gap: 6px;
  font-size: var(--ps-fs-xs);
  color: var(--ps-text-2);
}

.ps-results__advanced label span { font-weight: 600; }

.ps-results__advanced .basic-input { height: 34px; font-size: 13px; padding: 0 10px; }

.ps-results__advanced-range {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 6px;
}

.ps-results__advanced-check {
  display: flex !important;
  align-items: center;
  gap: 6px;
  grid-auto-flow: column;
}

.ps-results__advanced-check input {
  width: 14px;
  height: 14px;
  accent-color: var(--ps-color-primary);
}

.ps-results__advanced-submit {
  width: 100%;
  height: 36px;
}

/* ── Result main ─────────────────────────────────────── */
.ps-results__main {
  min-width: 0;
}

.ps-results__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--ps-space-4);
  padding: var(--ps-space-3) var(--ps-space-4);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
}

.ps-results__count {
  font-size: var(--ps-fs-md);
  color: var(--ps-text-1);
}

.ps-results__count strong {
  font-family: var(--ps-font-display);
  font-weight: 700;
  color: var(--ps-color-primary);
  font-size: var(--ps-fs-lg);
}

.ps-results__count-keyword {
  color: var(--ps-text-2);
  font-weight: 500;
  margin-left: 6px;
}

.ps-results__took {
  font-size: var(--ps-fs-xs);
  color: var(--ps-text-3);
  margin-top: 2px;
  font-family: var(--ps-font-mono);
}

.ps-results__sort-quick {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
}

.ps-results__sort-quick select {
  height: 32px;
  padding: 0 10px;
  font-size: var(--ps-fs-sm);
  background: var(--ps-bg-page);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
  color: var(--ps-text-1);
  font-family: inherit;
  cursor: pointer;
}

.ps-results__pagination {
  margin-top: var(--ps-space-6);
  display: flex;
  justify-content: center;
}

/* ── Responsive ──────────────────────────────────────── */
@media screen and (max-width: 1024px) {
  .ps-results__layout {
    grid-template-columns: 1fr;
  }
  .ps-results__sidebar {
    position: static;
  }
}

@media screen and (max-width: 720px) {
  .ps-results { padding: var(--ps-space-4); }
  .ps-results__header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ps-space-3);
  }
}
</style>
