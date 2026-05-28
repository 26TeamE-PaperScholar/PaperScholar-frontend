<template>
  <div class="ps-paper-root">
  <div v-if="notFound || loadError" class="ps-paper ps-paper--error">
    <AppCard>
      <AppSectionHeader
        :title="notFound ? $t('paper_not_found_title') : $t('paper_load_failed_title')"
        tag="h2"
      />
      <p class="ps-paper__error-hint">
        {{ notFound ? $t('paper_not_found_hint') : $t('paper_load_failed_hint') }}
      </p>
      <div class="ps-paper__error-actions">
        <router-link to="/search_result?search_type=1" class="basic-btn">
          {{ $t('common_back_to_search') }}
        </router-link>
        <button v-if="loadError" class="basic-btn-outline" @click="getPaperDetail">
          {{ $t('common_retry') }}
        </button>
      </div>
    </AppCard>
  </div>
  <div v-else class="ps-paper">
    <AppGradientHero variant="dark" class="ps-paper__hero">
      <AppBreadcrumb :items="breadcrumbs" class="ps-paper__crumbs" />
      <div class="ps-paper__hero-grid">
        <div class="ps-paper__hero-main">
          <div class="ps-paper__hero-chips">
            <AppTagChip
              v-if="venue"
              variant="gold"
              size="md"
              icon="BookOutline"
            >{{ venue }}</AppTagChip>
            <AppTagChip
              v-for="(c, idx) in (concepts || []).slice(0, 3)"
              :key="idx"
              variant="outline"
              size="md"
            >{{ c.display_name }}</AppTagChip>
          </div>
          <h1 class="ps-paper__title">{{ title || $t('common_no_title') }}</h1>
          <p class="ps-paper__authors">
            <span
              v-for="(a, idx) in authorships"
              :key="idx"
              class="ps-paper__author"
              :class="{ 'ps-paper__author--disabled': !canOpenAuthor(a) }"
              @click="gotoAuthorPage(a)"
            >
              {{ authorName(a) }}
              <span v-if="idx < authorships.length - 1">,</span>
            </span>
          </p>
          <p v-if="institutions.length" class="ps-paper__institutions">
            <AppIcon name="School" :size="14" />
            {{ institutions.map((i) => i.display_name).join(' · ') }}
          </p>
        </div>

        <aside class="ps-paper__hero-stats">
          <div class="ps-paper__stat">
            <span class="ps-paper__stat-num">{{ formattedCited }}</span>
            <span class="ps-paper__stat-label">{{ $t('paper_cited_count') }}</span>
          </div>
          <div class="ps-paper__stat">
            <span class="ps-paper__stat-num">{{ date || '—' }}</span>
            <span class="ps-paper__stat-label">{{ $t('paper_publication_date') }}</span>
          </div>
          <div class="ps-paper__stat">
            <span class="ps-paper__stat-num">{{ relatedCount }}</span>
            <span class="ps-paper__stat-label">{{ $t('paper_related_work') }}</span>
          </div>
          <div class="ps-paper__action-row">
            <button
              class="ps-paper__action ps-paper__action--gold"
              :class="{ 'ps-paper__action--collected': isPaperCollected }"
              :disabled="favoriteStateLoading"
              :title="isPaperCollected ? $t('paper_uncollect') : $t('paper_collect')"
              :aria-label="isPaperCollected ? $t('paper_uncollect') : $t('paper_collect')"
              @click="collectPaper"
            >
              <AppIcon :name="isPaperCollected ? 'Bookmark' : 'BookmarkOutline'" :size="16" />
              <span class="ps-paper__action-copy">
                <span class="ps-paper__action-label">{{ isPaperCollected ? $t('paper_collected') : $t('paper_collect') }}</span>
                <span v-if="isPaperCollected" class="ps-paper__action-meta">{{ $t('favorite_in_folders', { count: collectedFolderCount }) }}</span>
              </span>
            </button>
            <button class="ps-paper__action" @click="citePaper">
              <AppIcon name="Create" :size="16" />
              {{ $t('paper_generate_citation') }}
            </button>
            <button class="ps-paper__action" @click="sharePaper">
              <AppIcon name="Share" :size="16" />
              {{ $t('common_share') }}
            </button>
            <button class="ps-paper__action ps-paper__action--ai" @click="gotoAssistant">
              <AppIcon name="SparklesOutline" :size="16" />
              {{ $t('paper_use_ai') }}
            </button>
            <span class="ps-paper__compare-action">
              <AddToCompareButton :paper="paperForCompare" size="md" />
            </span>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <div class="ps-paper__layout">
      <article class="ps-paper__article">
        <AppCard>
          <AppSectionHeader :title="$t('paper_detail_abstract')" subtitle="Abstract" tag="h2" />
          <p class="ps-paper__abstract">{{ abstract || $t('paper_no_abstract') }}</p>
        </AppCard>

        <AppCard v-if="keywords.length">
          <AppSectionHeader :title="$t('paper_detail_keywords')" subtitle="Keywords" tag="h2" />
          <div class="ps-paper__keywords">
            <AppTagChip
              v-for="(k, idx) in keywords"
              :key="idx"
              variant="subtle"
              size="md"
            >{{ k }}</AppTagChip>
          </div>
        </AppCard>

        <AppCard v-if="relevantArticles.length">
          <AppSectionHeader :title="$t('paper_related_papers')" subtitle="Related works" tag="h2">
            <template #actions>
              <span class="ps-paper__hint">{{ $t('common_items_count', { count: relevantArticles.length }) }}</span>
            </template>
          </AppSectionHeader>
          <ul class="ps-paper__related">
            <li
              v-for="(a, idx) in relevantArticles"
              :key="idx"
              @click="gotoAnotherPaper(a)"
            >
              <span class="ps-paper__related-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
              <div class="ps-paper__related-body">
                <h4>{{ a.title }}</h4>
                <p v-if="a.authorships && a.authorships.length">
                  {{ a.authorships.slice(0, 2).map((x) => x.author && x.author.display_name).join(' · ') }}
                </p>
              </div>
              <span class="ps-paper__related-compare" @click.stop>
                <AddToCompareButton :paper="a" size="xs" />
              </span>
              <AppIcon name="ChevronForward" :size="16" />
            </li>
          </ul>
        </AppCard>
      </article>

      <aside class="ps-paper__sidebar">
        <AppCard accent="violet">
          <AppSectionHeader :title="$t('common_actions')" tag="h3" />
          <div class="ps-paper__cta-list">
            <button
              v-if="doi"
              class="ps-paper__cta basic-btn"
              @click="gotoPaperLandingURL"
            >
              <AppIcon name="GlobeOutline" :size="16" />
              {{ $t('paper_visit_original') }}
            </button>
            <button
              v-if="pdf_url"
              class="ps-paper__cta basic-btn-outline"
              @click="gotoPdfURL"
            >
              <AppIcon name="Document" :size="16" />
              {{ $t('paper_online_pdf') }}
            </button>
            <button
              v-if="pdf_url"
              class="ps-paper__cta basic-btn-outline"
              @click="downloadPaper"
            >
              <AppIcon name="Cloud" :size="16" />
              {{ $t('paper_download_pdf') }}
            </button>
          </div>
        </AppCard>

        <AppCard>
          <AppSectionHeader :title="$t('common_metadata')" tag="h3" />
          <dl class="ps-paper__meta-list">
            <div v-if="doi">
              <dt>DOI</dt>
              <dd>
                <a :href="doi" target="_blank" rel="noopener" class="ps-paper__meta-link">
                  {{ doiShort }}
                  <AppIcon name="ChevronForward" :size="12" />
                </a>
              </dd>
            </div>
            <div v-if="source">
              <dt>{{ $t('paper_source') }}</dt>
              <dd>{{ source }}</dd>
            </div>
            <div v-if="date">
              <dt>{{ $t('common_date') }}</dt>
              <dd>{{ date }}</dd>
            </div>
            <div>
              <dt>{{ $t('common_type') }}</dt>
              <dd>{{ workType }}</dd>
            </div>
          </dl>
        </AppCard>

        <AppCard v-if="tags.length" accent="gold">
          <AppSectionHeader :title="$t('paper_subject_classification')" tag="h3" />
          <div class="ps-paper__keywords">
            <AppTagChip
              v-for="(t, idx) in tags"
              :key="idx"
              size="sm"
              variant="gold"
            >{{ t.display_name }}</AppTagChip>
          </div>
        </AppCard>
      </aside>
    </div>
  </div>
  <ChooseFavoriteModal :paperId="paperId" :show="collectModalShouldShow" @close="collectModalShouldShow = false" />
  <CiteModal :citations="citations" :show="citeModalShouldShow" @close="citeModalShouldShow = false" />
  </div>
</template>

<script>
import { Search } from '../../api/search'
import ChooseFavoriteModal from '../../components/modals/ChooseFavoriteModal.vue'
import CiteModal from '../../components/modals/CiteModal.vue'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppBreadcrumb } from '../../components/ui'
import AddToCompareButton from '../../components/compare/AddToCompareButton.vue'
import { authorIdOf, authorNameOf, paperIdOf, pickAuthorSearchResult, scholarPortalPath } from '../../utils/personal-page.mjs'
import { refreshFavoriteFolders, removePaperFromFavorite, subscribeFavoriteFolders } from '../../utils/favorite-store.mjs'

export default {
  name: 'PaperDetailView',
  components: {
    ChooseFavoriteModal,
    CiteModal,
    AddToCompareButton,
    AppCard,
    AppIcon,
    AppTagChip,
    AppSectionHeader,
    AppGradientHero,
    AppBreadcrumb
  },
  data() {
    return {
      paperId: undefined,
      title: '',
      authorships: [],
      institutions: [],
      abstract: '',
      keywords: [],
      doi: '',
      source: '',
      tags: [],
      date: '',
      pdf_url: '',
      citations: [],
      collectModalShouldShow: false,
      citeModalShouldShow: false,
      relevantArticles: [],
      related_works_count: 0,
      workType: 'article',
      concepts: [],
      cited_by_count: 0,
      isOpenAccess: false,
      notFound: false,
      loadError: false,
      favoriteFolders: [],
      favoriteStateLoading: false,
      unsubscribeFavorites: null,
      subscribedFavoriteUserId: ''
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() { this.getPaperDetail() }
    }
  },
  computed: {
    venue() {
      return this.source
    },
    breadcrumbs() {
      return [
        { label: this.$t('common_home'), to: '/' },
        { label: this.$t('common_search_results'), to: '/search_result?search_type=1' },
        { label: this.title || this.$t('common_paper_detail') }
      ]
    },
    formattedCited() {
      const n = this.cited_by_count
      if (typeof n !== 'number') return n || 0
      if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
      return n.toLocaleString('en-US')
    },
    relatedCount() {
      return this.related_works_count || this.relevantArticles.length
    },
    doiShort() {
      if (!this.doi) return ''
      return String(this.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
    },
    paperForCompare() {
      return {
        id: this.paperId,
        title: this.title,
        publication_year: this.date ? Number(String(this.date).slice(0, 4)) : null
      }
    },
    collectedFavoriteFolders() {
      const paperId = paperIdOf(this.paperId)
      if (!paperId) return []
      return this.favoriteFolders.filter((folder) => {
        if (!folder || !folder.id || folder.pending) return false
        return (folder.paper_ids || []).map(String).includes(String(paperId))
      })
    },
    collectedFolderCount() {
      return this.collectedFavoriteFolders.length
    },
    isPaperCollected() {
      return this.collectedFolderCount > 0
    }
  },
  mounted() {
    this.loadFavoriteState()
  },
  beforeUnmount() {
    this.releaseFavoriteSubscription()
  },
  methods: {
    getPaperDetail() {
      const id = this.$route.params.id
      this.paperId = id
      this.notFound = false
      this.loadError = false
      if (!id || !/^W\d+$/.test(id)) {
        this.notFound = true
        return
      }
      this.loadFavoriteState()
      Search.workRetrieve(id).then(
        (response) => {
          const data = (response && response.data) || {}
          if (!data || (!data.id && !data.title)) {
            this.notFound = true
            return
          }
          this.title = data.title || ''
          this.authorships = data.authorships || []
          this.institutions = ((data.authorships || []).flatMap((a) => a.institutions || [])).filter(Boolean)
          if (data.abstract != null) this.abstract = data.abstract
          this.keywords = data.keywords || []
          if (data.doi != null) this.doi = data.doi
          this.cited_by_count = data.cited_by_count || 0
          this.concepts = data.concepts || []
          if (data.primary_location && data.primary_location.source) {
            const name = data.primary_location.source.display_name || ''
            this.source = name.replace(/=/g, '')
          }
          this.tags = data.concepts || []
          this.date = data.publication_date || ''
          if (data.primary_location && data.primary_location.pdf_url) {
            this.pdf_url = data.primary_location.pdf_url
          }
          this.citations = data.citations || []
          this.related_works_count = data.related_works_count || 0
          this.workType = data.type || 'article'
          this.isOpenAccess = !!data.open_access
          if (data.related_works_count > 0 && data.related_works_api_url) {
            this.getRelatedArticles(data.related_works_api_url)
          }
        },
        (err) => {
          const resp = err && err.response
          const status = resp && resp.status
          const inner = resp && resp.data && resp.data.status_code
          if (status === 404 || status === 400 || inner === 404 || inner === 400) {
            this.notFound = true
          } else {
            this.loadError = true
          }
        }
      )
    },
    getRelatedArticles(url) {
      Search.getEntities(url).then(
        (response) => {
          const data = (response && response.data) || {}
          const list = data.results || []
          this.relevantArticles = list.slice(0, 6)
        },
        () => {}
      )
    },
    currentUserId() {
      return this.$cookies.get('user_id')
    },
    bindFavoriteSubscription(userId) {
      if (!userId || this.subscribedFavoriteUserId === String(userId)) return
      this.releaseFavoriteSubscription()
      this.subscribedFavoriteUserId = String(userId)
      this.unsubscribeFavorites = subscribeFavoriteFolders(userId, (items) => {
        this.favoriteFolders = items
      })
    },
    releaseFavoriteSubscription() {
      if (this.unsubscribeFavorites) this.unsubscribeFavorites()
      this.unsubscribeFavorites = null
      this.subscribedFavoriteUserId = ''
      this.favoriteFolders = []
    },
    loadFavoriteState() {
      const userId = this.currentUserId()
      if (!userId) {
        this.releaseFavoriteSubscription()
        return
      }
      this.bindFavoriteSubscription(userId)
      this.favoriteStateLoading = true
      refreshFavoriteFolders(userId, { force: true }).then(
        () => {},
        () => {}
      ).finally(() => {
        this.favoriteStateLoading = false
      })
    },
    async collectPaper() {
      if (this.favoriteStateLoading) return
      const userId = this.currentUserId()
      if (!userId) {
        this.$bus.emit('message', { title: this.$t('login_text'), content: this.$t('personal_login_required_content'), time: 1600 })
        return
      }
      this.bindFavoriteSubscription(userId)
      if (this.isPaperCollected) {
        const paperId = paperIdOf(this.paperId)
        const folders = this.collectedFavoriteFolders.slice()
        if (!paperId || !folders.length) return
        this.favoriteStateLoading = true
        try {
          await Promise.all(folders.map((folder) => removePaperFromFavorite(userId, folder.id, paperId)))
          this.$bus.emit('message', { title: this.$t('paper_uncollected'), content: this.title || '', time: 1500 })
          try {
            await refreshFavoriteFolders(userId, { force: true })
          } catch (e) {}
        } catch (e) {
          this.$bus.emit('message', { title: this.$t('favorite_remove_failed'), content: this.$t('common_retry_later'), time: 1500 })
        } finally {
          this.favoriteStateLoading = false
        }
        return
      }
      this.collectModalShouldShow = true
    },
    citePaper() { this.citeModalShouldShow = true },
    sharePaper() {
      try {
        navigator.clipboard.writeText(window.location.href)
        this.$bus.emit('message', { title: this.$t('paper_copied_to_clipboard'), content: window.location.href, time: 2000 })
      } catch (e) {}
    },
    gotoAssistant() {
      const id = this.$route.params.id
      if (!id) return
      this.$router.push({ path: '/ai_assistant', query: { context_papers: id } })
    },
    downloadPaper() {
      if (!this.pdf_url) return
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = this.pdf_url
      link.setAttribute('download', this.title + '.pdf')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    authorId(authorship) {
      return authorIdOf(authorship)
    },
    authorName(authorship) {
      return authorNameOf(authorship)
    },
    canOpenAuthor(authorship) {
      return Boolean(authorIdOf(authorship) || authorNameOf(authorship))
    },
    async gotoAuthorPage(authorship) {
      const path = scholarPortalPath(authorship)
      if (path) {
        this.$router.push(path)
        return
      }
      const name = authorNameOf(authorship)
      if (!name) return
      try {
        const res = await Search.searchAuthor({ search: name, per_page: 5, page: 1 })
        const data = (res && res.data) || {}
        const matched = pickAuthorSearchResult(authorship, data.results || [])
        const fallbackPath = scholarPortalPath(matched)
        if (fallbackPath) this.$router.push(fallbackPath)
      } catch (e) {}
    },
    gotoPaperLandingURL() {
      window.open(this.doi, '_blank', 'noopener')
    },
    gotoPdfURL() {
      window.open(this.pdf_url, '_blank', 'noopener')
    },
    gotoAnotherPaper(article) {
      this.$router.push('/paper_detail/' + article.id)
    }
  }
}
</script>

<style scoped>
.ps-paper {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-paper--error {
  max-width: 640px;
  padding-top: var(--ps-space-10);
}

.ps-paper__error-hint {
  font-size: var(--ps-fs-md);
  color: var(--ps-text-2);
  line-height: var(--ps-lh-relaxed);
  margin: var(--ps-space-3) 0 var(--ps-space-5);
}

.ps-paper__error-actions {
  display: flex;
  gap: var(--ps-space-3);
  flex-wrap: wrap;
}

.ps-paper__error-actions .basic-btn,
.ps-paper__error-actions .basic-btn-outline {
  min-width: 140px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.ps-paper__hero {
  margin-bottom: var(--ps-space-7);
}

.ps-paper__crumbs {
  margin-bottom: var(--ps-space-5);
}

.ps-paper__crumbs :deep(.ps-breadcrumb a),
.ps-paper__crumbs :deep(.ps-breadcrumb__current),
.ps-paper__crumbs :deep(.ps-breadcrumb__sep) {
  color: var(--ps-hero-text-muted);
}

.ps-paper__crumbs :deep(.ps-breadcrumb__current) {
  color: var(--ps-hero-eyebrow);
}

.ps-paper__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
  gap: var(--ps-space-7);
  align-items: flex-start;
}

.ps-paper__hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: var(--ps-space-4);
}

.ps-paper__hero-chips :deep(.ps-chip--outline) {
  background: var(--ps-hero-chip-bg);
  border-color: var(--ps-hero-chip-border);
  color: var(--ps-hero-chip-text);
}

.ps-paper__title {
  font-family: var(--ps-font-display);
  font-size: clamp(28px, 3.6vw, 42px);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
  line-height: 1.2;
  margin-bottom: var(--ps-space-4);
}

.ps-paper__authors {
  font-size: var(--ps-fs-md);
  color: var(--ps-hero-text-muted);
  margin-bottom: var(--ps-space-3);
}

.ps-paper__author {
  cursor: pointer;
  font-weight: 600;
  color: var(--ps-hero-link);
  margin-right: 4px;
}

.ps-paper__author:hover { color: var(--ps-hero-link-hover); text-decoration: underline; }

.ps-paper__author--disabled {
  cursor: default;
}

.ps-paper__author--disabled:hover {
  color: var(--ps-hero-link);
  text-decoration: none;
}

.ps-paper__institutions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--ps-fs-sm);
  color: var(--ps-hero-text-faint);
}

.ps-paper__hero-stats {
  background: var(--ps-hero-surface);
  border: 1px solid var(--ps-hero-surface-border);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
  min-width: 0;
}

.ps-paper__stat {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: var(--ps-space-3);
  min-height: 42px;
  padding: 0 0 var(--ps-space-3);
  border-bottom: 1px dashed var(--ps-hero-divider);
}

.ps-paper__stat:last-of-type {
  border: 0;
  padding-bottom: 0;
}

.ps-paper__stat-num {
  min-width: 0;
  font-family: var(--ps-font-sans);
  font-size: var(--ps-fs-lg);
  font-weight: 750;
  line-height: 1.2;
  color: var(--ps-hero-text-strong);
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}

.ps-paper__stat-label {
  font-size: var(--ps-fs-xs);
  font-weight: 650;
  line-height: 1.2;
  color: var(--ps-hero-eyebrow);
  text-align: right;
  white-space: nowrap;
}

.ps-paper__action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ps-space-2);
  margin-top: var(--ps-space-2);
}

.ps-paper__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0 var(--ps-space-3);
  background: var(--ps-hero-action-bg);
  border: 1px solid var(--ps-hero-action-border);
  border-radius: var(--ps-radius-sm);
  color: var(--ps-hero-text-strong);
  font-size: var(--ps-fs-xs);
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    border-color var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-paper__action:hover { background: var(--ps-hero-action-bg-hover); }

.ps-paper__action:disabled {
  cursor: wait;
  opacity: 0.64;
}

.ps-paper__action-copy {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  line-height: 1.15;
}

.ps-paper__action-label,
.ps-paper__action-meta {
  display: block;
  max-width: 100%;
  line-height: 1.2;
  white-space: nowrap;
}

.ps-paper__action-label {
  font-size: var(--ps-fs-xs);
  font-weight: 700;
}

.ps-paper__action-meta {
  color: currentColor;
  font-size: 10px;
  font-weight: 500;
  opacity: 0.78;
}

.ps-paper__compare-action {
  display: block;
  grid-column: 1 / -1;
  min-width: 0;
}

.ps-paper__action-row :deep(.ps-compare-add) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0 var(--ps-space-3);
  border-radius: var(--ps-radius-sm);
  border-color: var(--ps-hero-action-border);
  background: var(--ps-hero-action-bg);
  color: var(--ps-hero-text-strong);
  font-size: var(--ps-fs-xs);
  font-weight: 650;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
}

.ps-paper__action-row :deep(.ps-compare-add:hover:not(:disabled)) {
  border-color: var(--ps-color-primary);
  background: var(--ps-hero-action-bg-hover);
  color: var(--ps-color-primary);
}

.ps-paper__action-row :deep(.ps-compare-add--active) {
  background: var(--ps-color-warning-soft);
  border-color: var(--ps-color-warning);
  color: var(--ps-color-warning-strong);
}

.ps-paper__action-row :deep(.ps-compare-add--locked) {
  opacity: 0.55;
  cursor: not-allowed;
}

.ps-paper__action-row :deep(.ps-compare-add__label) {
  line-height: 1.2;
}

.ps-paper__action--gold {
  background: rgba(212, 175, 55, 0.18);
  border-color: rgba(212, 175, 55, 0.5);
  color: var(--ps-color-accent-strong);
}

.ps-paper__action--collected {
  background: var(--ps-color-success-soft);
  border-color: color-mix(in srgb, var(--ps-color-success) 45%, transparent);
  color: var(--ps-color-success-strong);
}

.ps-paper__action--ai {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.22), var(--ps-hero-action-bg));
  border-color: rgba(212, 175, 55, 0.4);
  color: var(--ps-hero-text-strong);
}
.ps-paper__action--ai:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.34), var(--ps-hero-action-bg-hover));
}

/* ── Layout ────────────────────────────────────────────── */
.ps-paper__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-6);
  align-items: flex-start;
}

.ps-paper__article {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-5);
  min-width: 0;
}

.ps-paper__abstract {
  font-family: var(--ps-font-sans);
  font-size: var(--ps-fs-md);
  line-height: var(--ps-lh-relaxed);
  color: var(--ps-text-1);
}

.ps-paper__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ps-paper__hint {
  font-size: var(--ps-fs-xs);
  color: var(--ps-text-3);
  font-family: var(--ps-font-mono);
}

.ps-paper__related {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
}

.ps-paper__related li {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  padding: var(--ps-space-3) var(--ps-space-4);
  border-radius: var(--ps-radius-md);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    transform var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-paper__related li:hover {
  background: var(--ps-color-primary-soft);
  transform: translateX(4px);
}

.ps-paper__related-idx {
  font-family: var(--ps-font-mono);
  font-size: 11px;
  color: var(--ps-text-3);
  width: 22px;
  flex: none;
}

.ps-paper__related-body { flex: 1; min-width: 0; }

.ps-paper__related-body h4 {
  font-size: var(--ps-fs-base);
  font-weight: 600;
  color: var(--ps-text-1);
  margin-bottom: 2px;
}

.ps-paper__related-body p {
  font-size: var(--ps-fs-xs);
  color: var(--ps-text-3);
}

/* ── Sidebar ──────────────────────────────────────────── */
.ps-paper__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-4));
}

.ps-paper__cta-list {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
}

.ps-paper__cta {
  width: 100%;
  height: 42px;
  font-size: var(--ps-fs-sm);
  gap: 8px;
}

.ps-paper__meta-list {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
}

.ps-paper__meta-list div {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ps-space-3);
  font-size: var(--ps-fs-sm);
}

.ps-paper__meta-list dt {
  color: var(--ps-text-3);
  font-size: var(--ps-fs-xs);
  letter-spacing: 0.10em;
  text-transform: uppercase;
}

.ps-paper__meta-list dd {
  color: var(--ps-text-1);
  font-weight: 500;
  text-align: right;
  word-break: break-word;
}

.ps-paper__meta-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ps-color-primary);
  font-family: var(--ps-font-mono);
  font-size: 12px;
}

@media screen and (max-width: 1024px) {
  .ps-paper__hero-grid {
    grid-template-columns: 1fr;
  }
  .ps-paper__layout {
    grid-template-columns: 1fr;
  }
  .ps-paper__sidebar { position: static; }
}

@media screen and (max-width: 720px) {
  .ps-paper { padding: var(--ps-space-4); }
}
</style>
