<template>
  <div class="ps-tag">
    <AppGradientHero variant="dark" class="ps-tag__hero">
      <AppBreadcrumb :items="breadcrumbs" class="ps-tag__crumbs" />
      <div class="ps-tag__hero-grid">
        <div class="ps-tag__hero-main">
          <p class="ps-tag__eyebrow">学科主题 · CONCEPT</p>
          <h1 class="ps-tag__name">
            {{ tag.name_zh || tag.name }}
          </h1>
          <p v-if="tag.name && tag.name_zh" class="ps-tag__alt">{{ tag.name }}</p>
          <p class="ps-tag__desc">{{ tag.description || '在 PaperScholar 上探索该主题的核心论文与代表学者。' }}</p>

          <div class="ps-tag__hero-actions">
            <button class="ps-tag__follow-btn" @click="toggleSubscribe">
              <AppIcon :name="subscribed ? 'Bookmark' : 'Add'" :size="14" />
              {{ subscribed ? '已订阅' : '订阅主题' }}
            </button>
            <button class="ps-tag__action-secondary" @click="goSearch">
              <AppIcon name="Search" :size="14" />
              检索该主题
            </button>
          </div>
        </div>

        <aside class="ps-tag__hero-stats">
          <div class="ps-tag__stat">
            <span class="ps-tag__stat-num">{{ formatNumber(tag.works_count) }}</span>
            <span class="ps-tag__stat-label">收录论文</span>
          </div>
          <div class="ps-tag__stat">
            <span class="ps-tag__stat-num">{{ topAuthors.length }}</span>
            <span class="ps-tag__stat-label">活跃学者</span>
          </div>
          <div class="ps-tag__stat">
            <span class="ps-tag__stat-num">L{{ tag.level !== undefined ? tag.level : '—' }}</span>
            <span class="ps-tag__stat-label">学科层级</span>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <section class="ps-tag__section ps-tag__charts">
      <AppCard>
        <AppSectionHeader title="主题热度趋势" subtitle="近 6 年关注度分布" tag="h2" />
        <div class="ps-tag__trend">
          <div
            v-for="(t, idx) in tag.trend || []"
            :key="idx"
            class="ps-tag__trend-bar"
            :style="{ height: barHeight(t.score) + 'px' }"
            :title="t.year + '：' + t.score + ' / 100'"
          >
            <span class="ps-tag__trend-label">{{ t.year }}</span>
          </div>
        </div>
      </AppCard>
      <AppCard>
        <AppSectionHeader title="活跃学者 Top 5" subtitle="按该方向发表数加权" tag="h2" />
        <!-- 恢复原 ECharts 饼图 -->
        <TagDetailGraphScholar :authorList="topAuthors" class="ps-tag__pie" />
        <AppEmptyState v-if="!topAuthors.length" title="暂无学者数据" />
      </AppCard>
    </section>

    <div class="ps-tag__grid">
      <section>
        <AppSectionHeader title="代表论文" subtitle="按引用与热度精选" tag="h2" />
        <SearchResultListItem
          v-for="(info, idx) in infoItems"
          :key="info.id || idx"
          :infoItem="info"
          :index="idx"
        />
        <AppEmptyState v-if="!infoItems.length" title="暂无代表论文" />
      </section>

      <aside class="ps-tag__sidebar">
        <AppCard accent="gold">
          <AppSectionHeader title="活跃学者" tag="h3" />
          <ul class="ps-tag__author-list">
            <li
              v-for="a in topAuthors"
              :key="a.id"
              @click="gotoAuthor(a)"
            >
              <AppAvatar :id="a.id" :name="a.display_name" size="sm" />
              <div>
                <h4>{{ a.display_name }}</h4>
                <p>{{ a.last_known_institution && a.last_known_institution.display_name }}</p>
              </div>
              <AppMetricBadge :value="a.h_index" label="h" tone="gold" />
            </li>
          </ul>
        </AppCard>

        <AppCard>
          <AppSectionHeader title="相关主题" tag="h3" />
          <div class="ps-tag__related">
            <AppTagChip
              v-for="t in relatedTags"
              :key="t.id"
              clickable
              variant="subtle"
              size="md"
              @click="gotoTag(t)"
            >{{ t.name_zh || t.name }}</AppTagChip>
          </div>
        </AppCard>
      </aside>
    </div>
  </div>
</template>

<script>
import SearchResultListItem from '../../components/search-result-list/SearchResultListItem.vue'
import TagDetailGraphScholar from '../../components/graphs/TagDetailGraphScholar.vue'
import { Search } from '../../api/search.js'
import { mockTags } from '../../mock/tags'
import { mockAuthors } from '../../mock/authors'
import { findPaper } from '../../mock/papers'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppEmptyState, AppMetricBadge, AppAvatar, AppBreadcrumb } from '../../components/ui'

export default {
  name: 'TagDetailView',
  components: {
    SearchResultListItem,
    TagDetailGraphScholar,
    AppCard,
    AppIcon,
    AppTagChip,
    AppSectionHeader,
    AppGradientHero,
    AppEmptyState,
    AppMetricBadge,
    AppAvatar,
    AppBreadcrumb
  },
  data() {
    return {
      tag: { id: '', name: '', name_zh: '', level: 0, works_count: 0, description: '', trend: [], related_paper_ids: [], top_author_ids: [] },
      infoItems: [],
      subscribed: false
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { label: '首页', to: '/' },
        { label: '主题', to: '/search_result?search_type=1' },
        { label: this.tag.name_zh || this.tag.name || '主题详情' }
      ]
    },
    topAuthors() {
      const ids = this.tag.top_author_ids || []
      return mockAuthors.filter((a) => ids.includes(a.id))
    },
    relatedTags() {
      return mockTags.filter((t) => t.id !== this.tag.id).slice(0, 5)
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
      Search.conceptRetrieve(id).then((res) => {
        this.tag = (res && res.data) || this.tag
        const ids = this.tag.related_paper_ids || []
        this.infoItems = ids.map((pid) => findPaper(pid)).filter(Boolean).map((p) => ({ ...p, keyword: '' }))
      })
    },
    barHeight(score) {
      return Math.max(8, (Number(score) || 0) * 1.2)
    },
    formatNumber(n) {
      if (typeof n !== 'number') return n || 0
      if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
      if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
      if (Math.abs(n) >= 1_000) return n.toLocaleString('en-US')
      return n.toString()
    },
    toggleSubscribe() {
      this.subscribed = !this.subscribed
      this.$bus.emit('message', { title: this.subscribed ? '订阅成功' : '已取消订阅', content: this.tag.name_zh || this.tag.name, time: 1500 })
    },
    goSearch() {
      this.$router.push({
        path: '/search_result',
        query: { search: this.tag.name_zh || this.tag.name, search_type: 1, per_page: '10', page: '1' }
      })
    },
    gotoAuthor(a) {
      this.$router.push('/scholar_portal/' + a.id)
    },
    gotoTag(t) {
      this.$router.push('/tag_detail/' + t.id)
    }
  }
}
</script>

<style scoped>
.ps-tag {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-tag__hero { margin-bottom: var(--ps-space-7); }
.ps-tag__crumbs { margin-bottom: var(--ps-space-5); }
.ps-tag__crumbs :deep(.ps-breadcrumb a),
.ps-tag__crumbs :deep(.ps-breadcrumb__current),
.ps-tag__crumbs :deep(.ps-breadcrumb__sep) { color: rgba(255, 255, 255, 0.7); }
.ps-tag__crumbs :deep(.ps-breadcrumb__current) { color: var(--ps-color-accent); }

.ps-tag__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-7);
}

.ps-tag__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ps-color-accent);
  font-weight: 700;
  margin-bottom: var(--ps-space-3);
}

.ps-tag__name {
  font-family: var(--ps-font-display);
  font-size: clamp(34px, 4.5vw, 56px);
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.05;
}

.ps-tag__alt {
  font-family: var(--ps-font-display);
  font-style: italic;
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--ps-fs-lg);
  margin-top: 4px;
}

.ps-tag__desc {
  margin-top: var(--ps-space-4);
  max-width: 600px;
  font-size: var(--ps-fs-md);
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.6;
}

.ps-tag__hero-actions {
  margin-top: var(--ps-space-5);
  display: flex;
  gap: var(--ps-space-2);
}

.ps-tag__follow-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 18px;
  height: 38px;
  background: var(--ps-color-accent);
  color: #1B1147;
  border-radius: var(--ps-radius-pill);
  font-size: var(--ps-fs-sm);
  font-weight: 700;
  cursor: pointer;
}

.ps-tag__follow-btn:hover { background: var(--ps-color-accent-strong); }

.ps-tag__action-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 16px;
  height: 38px;
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  border-radius: var(--ps-radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  cursor: pointer;
}
.ps-tag__action-secondary:hover { background: rgba(255, 255, 255, 0.14); }

.ps-tag__hero-stats {
  background: rgba(15, 14, 26, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
  backdrop-filter: blur(10px);
}

.ps-tag__stat {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
  padding-bottom: 6px;
}
.ps-tag__stat:last-of-type { border: 0; }

.ps-tag__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: #FFFFFF;
}
.ps-tag__stat-label {
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--ps-color-accent);
}

.ps-tag__section { margin-bottom: var(--ps-space-6); }

.ps-tag__charts {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
  gap: var(--ps-space-4);
}

.ps-tag__pie {
  margin: 0 auto;
}

@media screen and (max-width: 1024px) {
  .ps-tag__charts {
    grid-template-columns: 1fr;
  }
}

.ps-tag__trend {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--ps-space-3);
  height: 160px;
  padding: var(--ps-space-3) 0 var(--ps-space-8);
  position: relative;
}

.ps-tag__trend-bar {
  flex: 1;
  background: linear-gradient(180deg, var(--ps-color-primary), var(--ps-color-accent));
  border-radius: var(--ps-radius-sm);
  position: relative;
  transition: height var(--ps-motion-slow) var(--ps-ease-out);
  min-width: 24px;
}

.ps-tag__trend-label {
  position: absolute;
  bottom: -28px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--ps-font-mono);
  font-size: 12px;
  color: var(--ps-text-2);
}

.ps-tag__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-6);
  align-items: flex-start;
}

.ps-tag__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-4));
}

.ps-tag__author-list {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
}

.ps-tag__author-list li {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  padding: 10px 8px;
  border-radius: var(--ps-radius-md);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-tag__author-list li:hover { background: var(--ps-color-primary-soft); }

.ps-tag__author-list li > div { flex: 1; min-width: 0; }

.ps-tag__author-list h4 {
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-1);
}

.ps-tag__author-list p {
  font-size: 11px;
  color: var(--ps-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-tag__related {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

@media screen and (max-width: 1024px) {
  .ps-tag__hero-grid,
  .ps-tag__grid {
    grid-template-columns: 1fr;
  }
  .ps-tag__sidebar { position: static; }
}

@media screen and (max-width: 720px) {
  .ps-tag { padding: var(--ps-space-4); }
}
</style>
