<template>
  <div class="ps-inst">
    <AppGradientHero variant="dark" class="ps-inst__hero">
      <AppBreadcrumb :items="breadcrumbs" class="ps-inst__crumbs" />
      <div class="ps-inst__hero-grid">
        <div class="ps-inst__hero-main">
          <div class="ps-inst__seal" aria-hidden="true">
            <AppIcon name="RibbonOutline" :size="38" />
          </div>
          <div>
            <p v-if="institution.country" class="ps-inst__location">
              <AppIcon name="LocationOutline" :size="14" />
              {{ locationText }}
            </p>
            <h1 class="ps-inst__name">{{ institution.display_name || $t('common_institution_detail') }}</h1>
            <p v-if="institution.display_name_alt" class="ps-inst__alt">{{ institution.display_name_alt }}</p>
            <div class="ps-inst__chips">
              <AppTagChip variant="outline" size="md">{{ typeLabel }}</AppTagChip>
              <AppTagChip
                v-for="(c, idx) in (institution.top_concepts || []).slice(0, 4)"
                :key="idx"
                variant="outline"
                size="md"
              >{{ c }}</AppTagChip>
            </div>
            <div class="ps-inst__actions">
              <a
                v-if="institution.homepage_url"
                class="ps-inst__action-primary"
                :href="institution.homepage_url"
                target="_blank"
                rel="noopener"
              >
                <AppIcon name="GlobeOutline" :size="14" />
                {{ $t('common_official_website') }}
              </a>
              <a
                v-if="institution.ror"
                class="ps-inst__action-secondary"
                :href="institution.ror"
                target="_blank"
                rel="noopener"
              >
                <AppIcon name="GitBranch" :size="14" />
                {{ $t('common_ror') }}
              </a>
            </div>
          </div>
        </div>

        <aside class="ps-inst__hero-stats">
          <div class="ps-inst__stat">
            <span class="ps-inst__stat-num">{{ formatNumber(institution.works_count) }}</span>
            <span class="ps-inst__stat-label">{{ $t('institution_publications') }}</span>
          </div>
          <div class="ps-inst__stat">
            <span class="ps-inst__stat-num">{{ formatNumber(institution.cited_by_count) }}</span>
            <span class="ps-inst__stat-label">{{ $t('institution_total_citations') }}</span>
          </div>
          <div class="ps-inst__stat">
            <span class="ps-inst__stat-num">{{ scholarsCount }}</span>
            <span class="ps-inst__stat-label">{{ $t('institution_registered_scholars') }}</span>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <div class="ps-inst__layout">
      <div class="ps-inst__main">
        <div class="ps-inst__tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="ps-inst__tab"
            :class="{ 'ps-inst__tab--active': activeTab === t.id }"
            @click="activeTab = t.id"
          >
            <AppIcon :name="t.icon" :size="14" />
            {{ $t(t.labelKey) }}
          </button>
        </div>

        <div v-show="activeTab === 'scholars'" class="ps-inst__panel">
          <AppEmptyState v-if="!scholars.length" :title="$t('institution_empty_scholars_title')" :description="$t('institution_empty_scholars_desc')" />
          <ScholarListItem
            v-for="s in scholars"
            :key="s.id"
            :infoItem="s"
          />
        </div>

        <div v-show="activeTab === 'works'" class="ps-inst__panel">
          <SearchResultListItem
            v-for="(info, idx) in works"
            :key="info.id || idx"
            :infoItem="info"
            :index="idx"
          />
          <AppEmptyState v-if="!works.length" :title="$t('institution_empty_works_title')" :description="$t('institution_empty_works_desc')" />
        </div>

        <div v-show="activeTab === 'trend'" class="ps-inst__panel">
          <AppCard>
            <AppSectionHeader :title="$t('institution_trend_title')" :subtitle="$t('institution_trend_subtitle')" tag="h2" />
            <div class="ps-inst__trend">
              <div v-for="(item, idx) in counts_by_year" :key="idx" class="ps-inst__trend-row">
                <span class="ps-inst__trend-year">{{ item.year }}</span>
                <div class="ps-inst__trend-bar">
                  <span class="ps-inst__trend-fill" :style="{ width: pct(item.cited_by_count) + '%' }"></span>
                </div>
                <span class="ps-inst__trend-val">{{ $t('institution_citations_unit', { count: formatNumber(item.cited_by_count) }) }}</span>
                <span class="ps-inst__trend-val ps-inst__trend-val--mini">{{ $t('institution_papers_unit', { count: formatNumber(item.works_count) }) }}</span>
              </div>
              <AppEmptyState v-if="!counts_by_year.length" :title="$t('institution_empty_yearly')" />
            </div>
          </AppCard>
        </div>
      </div>

      <aside class="ps-inst__sidebar">
        <AppCard accent="gold">
          <AppSectionHeader :title="$t('institution_key_info')" tag="h3" />
          <dl class="ps-inst__meta">
            <div v-if="institution.type"><dt>{{ $t('common_type') }}</dt><dd>{{ typeLabel }}</dd></div>
            <div v-if="institution.country"><dt>{{ $t('institution_country_region') }}</dt><dd>{{ institution.country }}</dd></div>
            <div v-if="institution.geo && institution.geo.city"><dt>{{ $t('institution_city') }}</dt><dd>{{ institution.geo.city }}</dd></div>
            <div v-if="institution.homepage_url">
              <dt>{{ $t('common_official_website') }}</dt>
              <dd>
                <a :href="institution.homepage_url" target="_blank" rel="noopener">{{ domain(institution.homepage_url) }}</a>
              </dd>
            </div>
          </dl>
        </AppCard>

        <AppCard>
          <AppSectionHeader :title="$t('institution_main_topics')" tag="h3" />
          <div class="ps-inst__keywords">
            <AppTagChip
              v-for="(c, idx) in institution.top_concepts || []"
              :key="idx"
              variant="subtle"
              size="md"
            >{{ c }}</AppTagChip>
          </div>
        </AppCard>
      </aside>
    </div>
  </div>
</template>

<script>
import SearchResultListItem from '../../components/search-result-list/SearchResultListItem.vue'
import ScholarListItem from '../../components/list-item/ScholarListItem.vue'
import { Search } from '../../api/search.js'
import { mockAuthors } from '../../mock/authors'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppEmptyState, AppBreadcrumb } from '../../components/ui'

const TYPE_LABELS = {
  education: 'institution_type_education',
  company: 'institution_type_company',
  facility: 'institution_type_facility',
  government: 'institution_type_government',
  nonprofit: 'institution_type_nonprofit'
}

export default {
  name: 'InstitutionView',
  components: {
    SearchResultListItem,
    ScholarListItem,
    AppCard,
    AppIcon,
    AppTagChip,
    AppSectionHeader,
    AppGradientHero,
    AppEmptyState,
    AppBreadcrumb
  },
  data() {
    return {
      activeTab: 'scholars',
      tabs: [
        { id: 'scholars', labelKey: 'institution_tab_scholars', icon: 'People' },
        { id: 'works', labelKey: 'institution_tab_recent', icon: 'Document' },
        { id: 'trend', labelKey: 'institution_tab_trend', icon: 'TrendingUp' }
      ],
      institution: {
        display_name: '',
        display_name_alt: '',
        country: '',
        country_code: '',
        type: '',
        works_count: 0,
        cited_by_count: 0,
        homepage_url: '',
        ror: '',
        geo: null,
        top_concepts: [],
        counts_by_year: []
      },
      scholars: [],
      works: []
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { label: this.$t('common_home'), to: '/' },
        { label: this.$t('common_institution'), to: '/search_result?search_type=4' },
        { label: this.institution.display_name || this.$t('common_institution_detail') }
      ]
    },
    typeLabel() {
      return this.$t(TYPE_LABELS[this.institution.type] || 'common_research_institution')
    },
    locationText() {
      const parts = [this.institution.geo && this.institution.geo.city, this.institution.country].filter(Boolean)
      return parts.join(', ')
    },
    scholarsCount() {
      return this.scholars.length || '—'
    },
    counts_by_year() {
      return this.institution.counts_by_year || []
    },
    maxCitations() {
      return Math.max(...this.counts_by_year.map((c) => c.cited_by_count || 0), 1)
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() { this.load() }
    }
  },
  methods: {
    load() {
      const id = this.$route.params.id
      if (!id) return
      Search.institutionRetrieve(id).then((res) => {
        this.institution = { ...this.institution, ...(res && res.data) }
        this.scholars = mockAuthors
          .filter((a) => a.last_known_institution && a.last_known_institution.id === id)
        this.loadWorks()
      })
    },
    loadWorks() {
      Search.searchWorks({
        search: this.institution.display_name,
        per_page: 5,
        page: 1,
        sort: 'cited_by_count:desc'
      }).then((res) => {
        const data = (res && res.data) || {}
        this.works = (data.results || []).slice(0, 5).map((r) => ({ ...r, keyword: '' }))
      })
    },
    formatNumber(n) {
      if (typeof n !== 'number') return n || 0
      if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
      if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
      return n.toLocaleString('en-US')
    },
    pct(value) {
      return Math.max(3, Math.round(((value || 0) / this.maxCitations) * 100))
    },
    domain(url) {
      try { return new URL(url).hostname } catch (e) { return url }
    }
  }
}
</script>

<style scoped>
.ps-inst {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-inst__hero { margin-bottom: var(--ps-space-7); }

.ps-inst__crumbs { margin-bottom: var(--ps-space-5); }

.ps-inst__crumbs :deep(.ps-breadcrumb a),
.ps-inst__crumbs :deep(.ps-breadcrumb__current),
.ps-inst__crumbs :deep(.ps-breadcrumb__sep) { color: var(--ps-hero-text-muted); }

.ps-inst__crumbs :deep(.ps-breadcrumb__current) { color: var(--ps-hero-eyebrow); }

.ps-inst__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-7);
  align-items: center;
}

.ps-inst__hero-main {
  display: flex;
  align-items: center;
  gap: var(--ps-space-6);
}

.ps-inst__seal {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3), rgba(45, 27, 105, 0.3));
  border: 2px solid rgba(212, 175, 55, 0.6);
  color: var(--ps-color-accent-strong);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.ps-inst__location {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--ps-hero-eyebrow);
  letter-spacing: 0.10em;
  text-transform: uppercase;
  margin-bottom: var(--ps-space-2);
}

.ps-inst__name {
  font-family: var(--ps-font-display);
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
  line-height: 1.15;
}

.ps-inst__alt {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-md);
  color: var(--ps-hero-text-muted);
  margin-top: 6px;
  font-style: italic;
}

.ps-inst__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: var(--ps-space-4) 0;
}

.ps-inst__chips :deep(.ps-chip--outline) {
  background: var(--ps-hero-chip-bg);
  border-color: var(--ps-hero-chip-border);
  color: var(--ps-hero-chip-text);
}

.ps-inst__actions {
  display: flex;
  gap: var(--ps-space-2);
}

.ps-inst__action-primary,
.ps-inst__action-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 38px;
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  border-radius: var(--ps-radius-pill);
  color: var(--ps-hero-text-strong);
}

.ps-inst__action-primary {
  background: var(--ps-color-accent);
  color: #1B1147;
}
.ps-inst__action-primary:hover {
  background: var(--ps-color-accent-strong);
  text-decoration: none;
}

.ps-inst__action-secondary {
  background: var(--ps-hero-action-bg);
  border: 1px solid var(--ps-hero-action-border);
}
.ps-inst__action-secondary:hover {
  background: var(--ps-hero-action-bg-hover);
  text-decoration: none;
}

.ps-inst__hero-stats {
  background: var(--ps-hero-surface);
  border: 1px solid var(--ps-hero-surface-border);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ps-space-3);
  backdrop-filter: blur(10px);
}

.ps-inst__stat {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 1px dashed var(--ps-hero-divider);
  padding-bottom: 6px;
}
.ps-inst__stat:last-of-type { border: 0; }

.ps-inst__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
}

.ps-inst__stat-label {
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--ps-hero-eyebrow);
}

/* ── Layout ─────────────────────────────────── */
.ps-inst__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-6);
  align-items: flex-start;
}

.ps-inst__tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: var(--ps-space-4);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-pill);
  width: fit-content;
}

.ps-inst__tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-2);
  background: transparent;
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
}

.ps-inst__tab:hover { color: var(--ps-text-1); }
.ps-inst__tab--active { background: var(--ps-color-primary); color: var(--ps-text-inverse); }

.ps-inst__trend { display: flex; flex-direction: column; gap: 10px; }

.ps-inst__trend-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 110px 80px;
  align-items: center;
  gap: var(--ps-space-3);
  font-size: var(--ps-fs-sm);
}

.ps-inst__trend-year { font-family: var(--ps-font-mono); font-weight: 600; color: var(--ps-text-2); }
.ps-inst__trend-bar { height: 8px; background: var(--ps-bg-sunken); border-radius: var(--ps-radius-pill); overflow: hidden; }
.ps-inst__trend-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--ps-color-primary), var(--ps-color-accent));
  border-radius: inherit;
  transition: width var(--ps-motion-slow) var(--ps-ease-out);
}
.ps-inst__trend-val { font-weight: 600; color: var(--ps-text-1); }
.ps-inst__trend-val--mini { color: var(--ps-text-3); font-size: 12px; }

.ps-inst__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-4));
}

.ps-inst__meta {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
}
.ps-inst__meta div {
  display: flex;
  justify-content: space-between;
  font-size: var(--ps-fs-sm);
  padding: 4px 0;
  border-bottom: 1px dashed var(--ps-border-1);
}
.ps-inst__meta div:last-child { border: 0; }
.ps-inst__meta dt { color: var(--ps-text-3); text-transform: uppercase; letter-spacing: 0.08em; font-size: 11px; }
.ps-inst__meta dd { color: var(--ps-text-1); font-weight: 500; }

.ps-inst__keywords { display: flex; flex-wrap: wrap; gap: 6px; }

@media screen and (max-width: 1024px) {
  .ps-inst__hero-grid,
  .ps-inst__layout {
    grid-template-columns: 1fr;
  }
  .ps-inst__sidebar { position: static; }
}

@media screen and (max-width: 720px) {
  .ps-inst { padding: var(--ps-space-4); }
  .ps-inst__hero-main { flex-direction: column; text-align: center; }
}
</style>
