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
            <h1 class="ps-inst__name">{{ institution.display_name || '机构详情' }}</h1>
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
                官网
              </a>
              <a
                v-if="institution.ror"
                class="ps-inst__action-secondary"
                :href="institution.ror"
                target="_blank"
                rel="noopener"
              >
                <AppIcon name="GitBranch" :size="14" />
                ROR 标识
              </a>
            </div>
          </div>
        </div>

        <aside class="ps-inst__hero-stats">
          <div class="ps-inst__stat">
            <span class="ps-inst__stat-num">{{ formatNumber(institution.works_count) }}</span>
            <span class="ps-inst__stat-label">发表数</span>
          </div>
          <div class="ps-inst__stat">
            <span class="ps-inst__stat-num">{{ formatNumber(institution.cited_by_count) }}</span>
            <span class="ps-inst__stat-label">总被引</span>
          </div>
          <div class="ps-inst__stat">
            <span class="ps-inst__stat-num">{{ scholarsCount }}</span>
            <span class="ps-inst__stat-label">在册学者</span>
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
            {{ t.label }}
          </button>
        </div>

        <div v-show="activeTab === 'scholars'" class="ps-inst__panel">
          <AppEmptyState v-if="!scholars.length" title="未关联学者" description="该机构暂未在 PaperScholar 同步学者信息。" />
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
          <AppEmptyState v-if="!works.length" title="暂无机构发表" description="该机构尚未关联到任何论文记录。" />
        </div>

        <div v-show="activeTab === 'trend'" class="ps-inst__panel">
          <AppCard>
            <AppSectionHeader title="逐年产出" subtitle="发表与引用按年变化趋势" tag="h2" />
            <div class="ps-inst__trend">
              <div v-for="(item, idx) in counts_by_year" :key="idx" class="ps-inst__trend-row">
                <span class="ps-inst__trend-year">{{ item.year }}</span>
                <div class="ps-inst__trend-bar">
                  <span class="ps-inst__trend-fill" :style="{ width: pct(item.cited_by_count) + '%' }"></span>
                </div>
                <span class="ps-inst__trend-val">{{ formatNumber(item.cited_by_count) }} 引用</span>
                <span class="ps-inst__trend-val ps-inst__trend-val--mini">{{ formatNumber(item.works_count) }} 篇</span>
              </div>
              <AppEmptyState v-if="!counts_by_year.length" title="暂无逐年数据" />
            </div>
          </AppCard>
        </div>
      </div>

      <aside class="ps-inst__sidebar">
        <AppCard accent="gold">
          <AppSectionHeader title="机构关键信息" tag="h3" />
          <dl class="ps-inst__meta">
            <div v-if="institution.type"><dt>类型</dt><dd>{{ typeLabel }}</dd></div>
            <div v-if="institution.country"><dt>国家/地区</dt><dd>{{ institution.country }}</dd></div>
            <div v-if="institution.geo && institution.geo.city"><dt>所在城市</dt><dd>{{ institution.geo.city }}</dd></div>
            <div v-if="institution.homepage_url">
              <dt>官网</dt>
              <dd>
                <a :href="institution.homepage_url" target="_blank" rel="noopener">{{ domain(institution.homepage_url) }}</a>
              </dd>
            </div>
          </dl>
        </AppCard>

        <AppCard>
          <AppSectionHeader title="主要研究方向" tag="h3" />
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
  education: '高校 / 研究机构',
  company: '产业实验室',
  facility: '研究设施',
  government: '政府研究机构',
  nonprofit: '非营利组织'
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
        { id: 'scholars', label: '在册学者', icon: 'People' },
        { id: 'works', label: '近期发表', icon: 'Document' },
        { id: 'trend', label: '产出趋势', icon: 'TrendingUp' }
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
        { label: '首页', to: '/' },
        { label: '机构', to: '/search_result?search_type=4' },
        { label: this.institution.display_name || '机构详情' }
      ]
    },
    typeLabel() {
      return TYPE_LABELS[this.institution.type] || '研究机构'
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
