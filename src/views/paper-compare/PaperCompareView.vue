<template>
  <div class="ps-pc">
    <AppGradientHero variant="dark" compact class="ps-pc__hero">
      <AppBreadcrumb :items="breadcrumbs" class="ps-pc__crumbs" />
      <div class="ps-pc__hero-grid">
        <div class="ps-pc__hero-text">
          <p class="ps-pc__eyebrow">论文横向对比 · 用例 804</p>
          <h1 class="ps-pc__title">
            方法 / 数据 / 指标 / 贡献 / 局限
            <span class="ps-pc__title-accent">五维结构化对比</span>
          </h1>
          <p class="ps-pc__lede">
            对比内容由 AI 抽取生成，并标注来源；遇到信息不全时进入受限模式。
          </p>
        </div>
        <div class="ps-pc__hero-actions">
          <button
            class="ps-pc__cta-ghost"
            type="button"
            @click="goBack"
          >
            <AppIcon name="ArrowBack" :size="14" inline />
            返回检索
          </button>
          <button
            class="ps-pc__cta"
            type="button"
            :disabled="!canFollowUp"
            :title="canFollowUp ? '基于这两篇论文继续向 AI 助手追问' : '需要 2 篇有效论文'"
            @click="gotoAssistant"
          >
            <AppIcon name="SparklesOutline" :size="14" inline />
            继续追问
          </button>
        </div>
      </div>
    </AppGradientHero>

    <div v-if="!hasEnough" class="ps-pc__layout ps-pc__layout--empty">
      <AppEmptyState
        title="未选满 2 篇论文"
        description="请回到检索结果或论文详情，使用 + 对比 按钮选满两篇后再发起对比。"
      >
        <template #actions>
          <button class="ps-pc__cta" type="button" @click="goSearch">去检索</button>
        </template>
      </AppEmptyState>
    </div>

    <div v-else class="ps-pc__layout">
      <!-- 可比性警告 -->
      <div v-if="warning" class="ps-pc__warn">
        <AppIcon name="WarningOutline" :size="16" inline />
        <span>{{ warning }}</span>
      </div>

      <!-- 受限论文横幅 -->
      <div v-if="restrictedIds.length" class="ps-pc__restricted-banner">
        <AppIcon name="AlertCircleOutline" :size="16" inline />
        <div>
          <strong>受限模式：</strong>
          <span>以下论文仅有题录/摘要级信息，部分对比维度可能为推断结果：</span>
          <span class="ps-pc__restricted-list">
            {{ restrictedIds.map(id => paperTitleById(id) || id).join('、') }}
          </span>
        </div>
      </div>

      <!-- 论文卡片头 -->
      <div class="ps-pc__paper-row">
        <article
          v-for="(p, idx) in meta"
          :key="p.id"
          class="ps-pc__paper"
          :class="{ 'ps-pc__paper--restricted': restrictedIds.includes(p.id) }"
        >
          <span class="ps-pc__paper-idx">论文 {{ idx + 1 }}</span>
          <h2 class="ps-pc__paper-title" @click="goPaper(p.id)" :title="p.title">{{ p.title }}</h2>
          <p class="ps-pc__paper-meta">
            <span v-if="p.authorships && p.authorships.length">
              {{ p.authorships.slice(0, 2).map(a => a.author && a.author.display_name).join(' · ') }}
              <span v-if="p.authorships.length > 2"> · 等 {{ p.authorships.length }} 位作者</span>
            </span>
            <span v-if="p.publication_year"> · {{ p.publication_year }}</span>
            <span v-if="p.primary_location && p.primary_location.source"> · {{ p.primary_location.source.display_name }}</span>
          </p>
          <button class="ps-pc__paper-remove" type="button" @click="removeFromCart(p.id)" aria-label="从对比中移除">
            <AppIcon name="Close" :size="14" />
          </button>
        </article>
      </div>

      <!-- 加载态 -->
      <div v-if="loading" class="ps-pc__loading">
        <AppSkeleton v-for="i in 5" :key="i" height="100px" />
      </div>

      <!-- 对比矩阵 -->
      <section v-else class="ps-pc__matrix" :aria-label="'对比矩阵'">
        <div
          v-for="row in rows"
          :key="row.key"
          class="ps-pc__row"
        >
          <div class="ps-pc__row-head">
            <AppIcon :name="row.icon" :size="16" inline />
            <span class="ps-pc__row-label">{{ row.label }}</span>
            <span v-if="row.subtle" class="ps-pc__row-subtle">{{ row.subtle }}</span>
          </div>
          <div class="ps-pc__row-cells">
            <CompareCell
              v-for="(p) in meta"
              :key="p.id + '-' + row.key"
              :cell="row.key === 'metrics' ? null : (matrix[p.id] && matrix[p.id][row.key])"
              :metrics="row.key === 'metrics' ? (matrix[p.id] && matrix[p.id].metrics) : null"
              :restricted="restrictedIds.includes(p.id)"
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Compare } from '../../api/compare.js'
import CompareCell from '../../components/compare/CompareCell.vue'
import {
  AppGradientHero,
  AppBreadcrumb,
  AppIcon,
  AppEmptyState,
  AppSkeleton
} from '../../components/ui'

const ROWS = [
  { key: 'method',       label: '方法',         icon: 'CogOutline',          subtle: 'Method' },
  { key: 'dataset',      label: '数据集',       icon: 'ServerOutline',       subtle: 'Dataset' },
  { key: 'metrics',      label: '评价指标',     icon: 'StatsChartOutline',   subtle: 'Metrics' },
  { key: 'contribution', label: '主要贡献',     icon: 'BulbOutline',         subtle: 'Contribution' },
  { key: 'limitation',   label: '局限性',       icon: 'WarningOutline',      subtle: 'Limitation' }
]

export default {
  name: 'PaperCompareView',
  components: {
    AppGradientHero,
    AppBreadcrumb,
    AppIcon,
    AppEmptyState,
    AppSkeleton,
    CompareCell
  },
  data() {
    return {
      rows: ROWS,
      loading: false,
      matrix: {},
      meta: [],
      restrictedIds: [],
      warning: null,
      missing: []
    }
  },
  computed: {
    ...mapGetters('compare', { cart: 'cart' }),
    idsFromQuery() {
      const raw = this.$route.query.ids || ''
      return String(raw).split(',').map(s => s.trim()).filter(Boolean)
    },
    effectiveIds() {
      if (this.idsFromQuery.length >= 2) return this.idsFromQuery.slice(0, 2)
      return this.cart.slice(0, 2).map(p => p.id)
    },
    hasEnough() {
      return this.effectiveIds.length >= 2
    },
    canFollowUp() {
      return this.hasEnough && this.meta.length === 2 && this.missing.length === 0
    },
    breadcrumbs() {
      return [
        { label: '首页', to: '/' },
        { label: '检索结果', to: '/search_result' },
        { label: '论文对比' }
      ]
    }
  },
  watch: {
    effectiveIds: {
      immediate: false,
      handler(newIds, oldIds) {
        if (newIds.join(',') !== (oldIds || []).join(',')) {
          this.load()
        }
      }
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    async load() {
      const ids = this.effectiveIds
      if (ids.length < 2) return
      this.loading = true
      try {
        const [extractRes, metaRes] = await Promise.all([
          Compare.extract(ids),
          Compare.getMeta(ids)
        ])
        const data = extractRes && extractRes.data ? extractRes.data : { matrix: {}, restricted_papers: [], comparability_warning: null, missing_papers: [] }
        this.matrix = data.matrix || {}
        this.restrictedIds = data.restricted_papers || []
        this.warning = data.comparability_warning || null
        this.missing = data.missing_papers || []
        this.meta = (metaRes && metaRes.data) ? metaRes.data : []
      } catch (e) {
        console.error('[paper-compare] load failed:', e)
        this.matrix = {}
        this.meta = []
      } finally {
        this.loading = false
      }
    },
    paperTitleById(id) {
      const p = this.meta.find(x => x.id === id)
      return p ? p.title : null
    },
    removeFromCart(id) {
      this.$store.dispatch('compare/removeFromCompare', id)
      const remaining = this.cart.filter(p => p.id !== id).map(p => p.id)
      if (remaining.length >= 2) {
        this.$router.replace({ path: '/paper_compare', query: { ids: remaining.join(',') } })
      } else {
        this.$router.replace({ path: '/paper_compare' })
      }
    },
    goPaper(id) { this.$router.push('/paper_detail/' + id) },
    goSearch() { this.$router.push('/search_result') },
    goBack() {
      if (window.history.length > 1) this.$router.back()
      else this.$router.push('/search_result')
    },
    gotoAssistant() {
      if (!this.canFollowUp) return
      const ids = this.effectiveIds.join(',')
      this.$router.push({ path: '/ai_assistant', query: { context_papers: ids } })
    }
  }
}
</script>

<style scoped>
.ps-pc { padding-bottom: 120px; }

.ps-pc__hero { padding-bottom: 32px; }
.ps-pc__crumbs { margin-bottom: 16px; }
.ps-pc__hero-grid {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.ps-pc__hero-text { flex: 1 1 380px; min-width: 0; }
.ps-pc__eyebrow {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ps-hero-eyebrow);
  margin: 0 0 8px;
}
.ps-pc__title {
  font-size: clamp(24px, 3.4vw, 36px);
  line-height: 1.18;
  color: var(--ps-hero-text-strong);
  margin: 0;
}
.ps-pc__title-accent {
  display: block;
  background: linear-gradient(90deg, #d4af37, #f5d169);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ps-pc__lede {
  margin: 12px 0 0;
  color: var(--ps-hero-text-muted);
  font-size: 14px;
  max-width: 520px;
}
.ps-pc__hero-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
}
.ps-pc__cta,
.ps-pc__cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.18s ease;
}
.ps-pc__cta {
  background: linear-gradient(135deg, #d4af37, #f5d169);
  color: #2d1b69;
  font-weight: 600;
  box-shadow: 0 6px 18px rgba(212, 175, 55, 0.32);
}
.ps-pc__cta:hover:not(:disabled) { filter: brightness(1.04); }
.ps-pc__cta:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }
.ps-pc__cta-ghost {
  background: var(--ps-hero-action-bg);
  color: var(--ps-hero-text-strong);
  border-color: var(--ps-hero-action-border);
}
.ps-pc__cta-ghost:hover { background: var(--ps-hero-action-bg-hover); }

.ps-pc__layout {
  max-width: 1180px;
  margin: -16px auto 0;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ps-pc__layout--empty { margin-top: 32px; }

.ps-pc__warn,
.ps-pc__restricted-banner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.55;
}
.ps-pc__warn {
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning-strong);
  border: 1px solid var(--ps-color-warning);
}
.ps-pc__restricted-banner {
  background: var(--ps-color-warning-soft);
  color: var(--ps-color-warning-strong);
  border: 1px solid var(--ps-color-warning);
}
.ps-pc__restricted-list { font-weight: 600; }

.ps-pc__paper-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.ps-pc__paper {
  position: relative;
  padding: 18px 20px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ps-pc__paper--restricted {
  border-color: var(--ps-color-warning);
  background: var(--ps-color-warning-soft);
}
.ps-pc__paper-idx {
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--ps-text-3);
  text-transform: uppercase;
}
.ps-pc__paper-title {
  margin: 0;
  font-size: 17px;
  line-height: 1.4;
  cursor: pointer;
  color: var(--ps-color-primary);
}
.ps-pc__paper-title:hover { text-decoration: underline; }
.ps-pc__paper-meta {
  margin: 0;
  font-size: 12.5px;
  color: var(--ps-text-3);
  line-height: 1.5;
}
.ps-pc__paper-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 26px;
  height: 26px;
  border: none;
  background: var(--ps-bg-sunken);
  border-radius: 50%;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ps-text-3);
}
.ps-pc__paper-remove:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-pc__matrix {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ps-pc__row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 16px;
  align-items: stretch;
}
.ps-pc__row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 16px;
  background: var(--ps-color-primary-soft);
  border: 1px solid var(--ps-border-1);
  border-radius: 12px;
  color: var(--ps-color-primary-strong);
  font-weight: 600;
}
.ps-pc__row-label { font-size: 14px; }
.ps-pc__row-subtle {
  margin-left: auto;
  font-size: 11px;
  font-weight: 500;
  color: var(--ps-text-3);
  letter-spacing: 0.08em;
}
.ps-pc__row-cells {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ps-pc__loading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (max-width: 900px) {
  .ps-pc__row { grid-template-columns: 1fr; gap: 8px; }
  .ps-pc__row-subtle { display: none; }
}
@media (max-width: 768px) {
  .ps-pc__hero-grid { flex-direction: column; align-items: stretch; }
  .ps-pc__hero-actions { width: 100%; }
  .ps-pc__cta, .ps-pc__cta-ghost { flex: 1; justify-content: center; }
  .ps-pc__paper-row { grid-template-columns: 1fr; }
  .ps-pc__row-cells { grid-template-columns: 1fr; }
  .ps-pc__layout { padding: 0 12px; }
}
</style>
