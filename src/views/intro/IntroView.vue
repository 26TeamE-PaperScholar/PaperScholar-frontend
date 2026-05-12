<template>
  <div class="ps-intro">
    <AppGradientHero variant="dark" class="ps-intro__hero">
      <div class="ps-intro__hero-grid">
        <div class="ps-intro__hero-text">
          <p class="ps-intro__eyebrow">PAPERSCHOLAR · 学术检索与展示</p>
          <h1 class="ps-intro__title">
            发现、追踪、引用 <br />
            <span class="ps-intro__title-accent">人类知识的每一次推进</span>
          </h1>
          <p class="ps-intro__lede">
            统一索引全球学术成果，融合语义检索、引用网络与生成式问答，为您构建可信、可追溯、可分享的研究工作台。
          </p>

          <div class="ps-intro__search-shell ps-rise">
            <div class="ps-intro__type-toggle">
              <button
                v-for="type in searchTypes"
                :key="type.value"
                type="button"
                class="ps-intro__type-btn"
                :class="{ 'ps-intro__type-btn--active': searchType === type.value }"
                @click="searchType = type.value"
              >
                <AppIcon :name="type.icon" :size="14" />
                {{ type.label }}
              </button>
            </div>

            <div class="ps-intro__search-input">
              <AppIcon name="Search" :size="20" />
              <input
                ref="searchInput"
                v-model="searchKeyword"
                type="text"
                :placeholder="placeholderText"
                @keyup.enter="basicSearch"
                @focus="suggestOpen = true"
                @blur="onBlur"
              />
              <AppKbdHint v-if="!suggestOpen">⌘K</AppKbdHint>
              <button class="ps-intro__search-btn" type="button" @click="basicSearch">
                {{ $t('search_text') || '检索' }}
                <AppIcon name="ChevronForward" :size="14" />
              </button>

              <transition name="ps-fade">
                <ul v-if="suggestOpen && suggestions.length" class="ps-intro__suggest">
                  <li v-for="(s, idx) in suggestions" :key="idx" @mousedown="applySuggestion(s)">
                    <AppIcon :name="entityIcon(s.entity_type)" :size="14" />
                    <span class="ps-intro__suggest-text">{{ s.display_name }}</span>
                    <span class="ps-intro__suggest-meta">{{ entityLabel(s.entity_type) }}</span>
                  </li>
                </ul>
              </transition>
            </div>

            <div class="ps-intro__hot-tags">
              <span class="ps-intro__hot-tags-label">热门方向</span>
              <AppTagChip
                v-for="tag in hotTags"
                :key="tag.id"
                variant="outline"
                clickable
                @click="searchTag(tag)"
              >
                {{ tag.name }}
              </AppTagChip>
            </div>
          </div>
        </div>

        <aside class="ps-intro__hero-stats">
          <div class="ps-intro__stats-card">
            <p class="ps-intro__stats-label">PLATFORM AT A GLANCE</p>
            <ul>
              <li>
                <span class="ps-intro__stats-num">2.4<small>M</small></span>
                <span class="ps-intro__stats-cap">已收录学术成果</span>
              </li>
              <li>
                <span class="ps-intro__stats-num">386<small>K</small></span>
                <span class="ps-intro__stats-cap">活跃学者档案</span>
              </li>
              <li>
                <span class="ps-intro__stats-num">12<small>K+</small></span>
                <span class="ps-intro__stats-cap">高校与研究机构</span>
              </li>
              <li>
                <span class="ps-intro__stats-num">98<small>%</small></span>
                <span class="ps-intro__stats-cap">用户检索满意度</span>
              </li>
            </ul>
          </div>
          <div class="ps-intro__hero-quote">
            <AppIcon name="RibbonOutline" :size="18" />
            <p>"PaperScholar 让我在两小时内完成一次综述的初稿。"</p>
            <span>— 同济大学博士在读</span>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <section class="ps-intro__section">
      <AppSectionHeader
        eyebrow="今日学术热点"
        title="精选最新研究"
        subtitle="基于引用突增、来源期刊影响力与跨学科曝光自动遴选，每两小时刷新。"
      >
        <template #actions>
          <button class="basic-btn-outline" @click="viewMoreHot">
            查看全部
            <AppIcon name="ChevronForward" :size="14" />
          </button>
        </template>
      </AppSectionHeader>

      <div class="ps-intro__hot-grid">
        <template v-if="loadingHot">
          <AppSkeletonCard v-for="i in 3" :key="'sk-' + i" />
        </template>
        <template v-else>
          <AppCard
            v-for="paper in hotPapersList"
            :key="paper.id"
            hover
            interactive
            accent="gold"
            @click="goToPaper(paper.id)"
          >
            <template #header>
              <div class="ps-intro__hot-header">
                <AppMetricBadge :value="paper.cited_by_count" label="引用" tone="violet" icon="FlameOutline" />
                <span class="ps-intro__hot-date">{{ paper.publication_date }}</span>
              </div>
            </template>
            <h3 class="ps-intro__hot-title">{{ paper.title }}</h3>
            <p class="ps-intro__hot-abstract">{{ paper.abstract }}</p>
            <div class="ps-intro__hot-meta">
              <div class="ps-intro__hot-authors">
                <AppAvatar
                  v-for="(a, idx) in paper.authorships.slice(0, 3)"
                  :key="idx"
                  :name="a.author.display_name"
                  :id="a.author.id"
                  size="xs"
                />
                <span>
                  {{ paper.authorships.slice(0, 2).map((a) => a.author.display_name).join(' · ') }}
                  <span v-if="paper.authorships.length > 2"> · 等 {{ paper.authorships.length }} 位作者</span>
                </span>
              </div>
              <div class="ps-intro__hot-tags-row">
                <AppTagChip
                  v-for="c in paper.concepts && paper.concepts.slice(0, 2)"
                  :key="c.id"
                  size="sm"
                  variant="subtle"
                >
                  {{ c.display_name }}
                </AppTagChip>
              </div>
            </div>
          </AppCard>
        </template>
      </div>
    </section>

    <section class="ps-intro__section">
      <AppSectionHeader
        eyebrow="工作流"
        title="像研究员一样工作"
        subtitle="PaperScholar 把「检索 · 阅读 · 整理 · 分享」串成一个流畅的研究管道。"
      />
      <div class="ps-intro__feature-grid">
        <AppCard v-for="feature in features" :key="feature.title" :elevation="1">
          <div class="ps-intro__feature-icon">
            <AppIcon :name="feature.icon" :size="22" />
          </div>
          <h3 class="ps-intro__feature-title">{{ feature.title }}</h3>
          <p class="ps-intro__feature-desc">{{ feature.desc }}</p>
        </AppCard>
      </div>
    </section>
  </div>
</template>

<script>
import { AppCard, AppIcon, AppTagChip, AppMetricBadge, AppAvatar, AppGradientHero, AppSectionHeader, AppSkeletonCard, AppKbdHint } from '../../components/ui'
import { Article } from '../../api/article.js'
import { AutoComplete } from '../../api/autocomplete.js'

const SEARCH_TYPES = [
  { value: 1, label: '论文', icon: 'Document' },
  { value: 2, label: '学者', icon: 'Person' },
  { value: 3, label: '期刊', icon: 'BookOutline' },
  { value: 4, label: '机构', icon: 'School' }
]

const PLACEHOLDERS = {
  1: '检索论文、关键词或 DOI——例如：retrieval-augmented generation',
  2: '检索学者姓名或 ORCID——例如：Ming Chen',
  3: '检索期刊或会议——例如：Nature, WWW',
  4: '检索高校或研究机构——例如：Tsinghua University'
}

const ENTITY_META = {
  work: { icon: 'Document', label: '论文' },
  author: { icon: 'Person', label: '学者' },
  institution: { icon: 'School', label: '机构' },
  concept: { icon: 'Sparkles', label: '主题' },
  source: { icon: 'BookOutline', label: '期刊' }
}

export default {
  name: 'IntroView',
  components: {
    AppCard,
    AppIcon,
    AppTagChip,
    AppMetricBadge,
    AppAvatar,
    AppGradientHero,
    AppSectionHeader,
    AppSkeletonCard,
    AppKbdHint
  },
  data() {
    return {
      searchKeyword: '',
      searchType: 1,
      searchTypes: SEARCH_TYPES,
      hotTags: [
        { id: 'C1', name: 'Retrieval-Augmented Generation' },
        { id: 'C5', name: 'Graph Neural Networks' },
        { id: 'C14', name: 'Quantum Computing' },
        { id: 'C20', name: 'Causal Inference' },
        { id: 'C2', name: 'Multimodal LLM' }
      ],
      features: [
        {
          icon: 'Search',
          title: '语义 + 关键词 混合检索',
          desc: '同时检索标题、摘要、全文与作者意图，让每一次搜索都更接近研究本意。'
        },
        {
          icon: 'GitBranch',
          title: '引用图谱可视化',
          desc: '基于引用与共现网络，自动呈现学者影响力轨迹与研究脉络。'
        },
        {
          icon: 'Bookmark',
          title: '可分享的收藏夹',
          desc: '一键归集组会、综述、毕设所需文献，并生成多格式引用清单。'
        },
        {
          icon: 'Sparkles',
          title: 'AI 学术助手',
          desc: '提炼方法、生成 BibTeX、对比相关工作；所有回答均附可追溯出处。'
        }
      ],
      loadingHot: true,
      hotPapersList: [],
      suggestOpen: false,
      suggestions: []
    }
  },
  computed: {
    placeholderText() {
      return PLACEHOLDERS[this.searchType] || ''
    }
  },
  watch: {
    searchKeyword(v) {
      if (!v.trim()) {
        this.suggestions = []
        return
      }
      this.debounceSuggest()
    }
  },
  mounted() {
    this.loadHotPapers()
  },
  methods: {
    loadHotPapers() {
      this.loadingHot = true
      Article.getHotspotRecommend().then(
        (res) => {
          this.hotPapersList = (res && res.data) || []
          this.loadingHot = false
        },
        () => { this.loadingHot = false }
      )
    },
    basicSearch() {
      const k = this.searchKeyword.trim()
      if (!k) return
      this.$router.push({
        path: '/search_result',
        query: {
          filter: '',
          search: k,
          sort: '',
          per_page: '10',
          page: '1',
          cursor: '',
          search_type: this.searchType
        }
      })
    },
    searchTag(tag) {
      this.searchKeyword = tag.name
      this.searchType = 1
      this.basicSearch()
    },
    goToPaper(id) {
      this.$router.push('/paper_detail/' + id)
    },
    viewMoreHot() {
      this.$router.push({
        path: '/search_result',
        query: { search: '', sort: 'cited_by_count:desc', per_page: '10', page: '1', search_type: 1 }
      })
    },
    debounceSuggest() {
      clearTimeout(this._sugT)
      this._sugT = setTimeout(this.fetchSuggestions, 180)
    },
    fetchSuggestions() {
      AutoComplete.getAutoAllInfo({ q: this.searchKeyword.trim() }).then(
        (res) => {
          this.suggestions = (res && res.data && res.data.results) || []
          this.suggestOpen = true
        },
        () => {}
      )
    },
    applySuggestion(s) {
      this.searchKeyword = s.display_name
      this.suggestOpen = false
      if (s.entity_type === 'author') {
        this.searchType = 2
      } else if (s.entity_type === 'institution') {
        this.searchType = 4
      } else if (s.entity_type === 'source') {
        this.searchType = 3
      } else {
        this.searchType = 1
      }
      this.basicSearch()
    },
    onBlur() {
      setTimeout(() => { this.suggestOpen = false }, 160)
    },
    entityIcon(type) {
      return (ENTITY_META[type] || ENTITY_META.work).icon
    },
    entityLabel(type) {
      return (ENTITY_META[type] || ENTITY_META.work).label
    }
  }
}
</script>

<style scoped>
.ps-intro {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-7) var(--ps-space-6) var(--ps-space-10);
}

.ps-intro__hero {
  margin-bottom: var(--ps-space-9);
}

.ps-intro__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
  gap: var(--ps-space-9);
  align-items: center;
}

.ps-intro__eyebrow {
  font-size: var(--ps-fs-xs);
  letter-spacing: 0.22em;
  font-weight: 700;
  color: var(--ps-color-accent);
  margin-bottom: var(--ps-space-4);
}

.ps-intro__title {
  font-family: var(--ps-font-display);
  font-size: clamp(34px, 5vw, 56px);
  font-weight: 700;
  line-height: 1.05;
  color: #FFFFFF;
}

.ps-intro__title-accent {
  background: linear-gradient(120deg, #FFFFFF 20%, #E6C766 60%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.ps-intro__lede {
  margin-top: var(--ps-space-5);
  max-width: 600px;
  font-size: var(--ps-fs-lg);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.78);
}

.ps-intro__search-shell {
  margin-top: var(--ps-space-7);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-xl);
  padding: var(--ps-space-5);
  box-shadow: var(--ps-shadow-3);
  max-width: 640px;
}

.ps-intro__type-toggle {
  display: flex;
  gap: var(--ps-space-1);
  margin-bottom: var(--ps-space-4);
  padding: 4px;
  background: var(--ps-bg-sunken);
  border-radius: var(--ps-radius-pill);
  width: fit-content;
}

.ps-intro__type-btn {
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

.ps-intro__type-btn:hover { color: var(--ps-text-1); }

.ps-intro__type-btn--active {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  box-shadow: var(--ps-shadow-1);
}

.ps-intro__search-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  height: 56px;
  padding: 0 var(--ps-space-3) 0 var(--ps-space-5);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  transition: border-color var(--ps-motion-base) var(--ps-ease-out),
    box-shadow var(--ps-motion-base) var(--ps-ease-out);
}

.ps-intro__search-input:focus-within {
  border-color: var(--ps-color-primary);
  box-shadow: var(--ps-shadow-focus);
}

.ps-intro__search-input input {
  flex: 1;
  border: 0;
  outline: 0;
  font-size: var(--ps-fs-lg);
  background: transparent;
  color: var(--ps-text-1);
  min-width: 0;
}

.ps-intro__search-input input::placeholder { color: var(--ps-text-3); }

.ps-intro__search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 18px;
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  border-radius: var(--ps-radius-pill);
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background var(--ps-motion-base) var(--ps-ease-out),
    box-shadow var(--ps-motion-base) var(--ps-ease-out);
}

.ps-intro__search-btn:hover {
  background: var(--ps-color-primary-strong);
  box-shadow: var(--ps-shadow-violet);
}

.ps-intro__suggest {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  box-shadow: var(--ps-shadow-3);
  padding: 8px;
  z-index: 20;
  max-height: 320px;
  overflow: auto;
}

.ps-intro__suggest li {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  padding: 10px 12px;
  border-radius: var(--ps-radius-md);
  cursor: pointer;
  color: var(--ps-text-1);
  font-size: var(--ps-fs-sm);
}

.ps-intro__suggest li:hover {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-intro__suggest-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-intro__suggest-meta {
  font-size: 11px;
  color: var(--ps-text-3);
  padding: 2px 8px;
  border-radius: var(--ps-radius-pill);
  background: var(--ps-bg-sunken);
}

.ps-intro__hot-tags {
  margin-top: var(--ps-space-5);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ps-intro__hot-tags-label {
  font-size: 11px;
  letter-spacing: 0.14em;
  font-weight: 700;
  color: var(--ps-text-3);
  text-transform: uppercase;
}

.ps-intro__hero-stats {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-5);
}

.ps-intro__stats-card {
  background: rgba(15, 14, 26, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-6);
  backdrop-filter: blur(10px);
}

.ps-intro__stats-label {
  font-size: 10px;
  letter-spacing: 0.22em;
  font-weight: 700;
  color: var(--ps-color-accent);
  text-transform: uppercase;
  margin-bottom: var(--ps-space-5);
}

.ps-intro__stats-card ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ps-space-5) var(--ps-space-5);
}

.ps-intro__stats-card li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-intro__stats-num {
  font-family: var(--ps-font-display);
  font-size: 32px;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.0;
}

.ps-intro__stats-num small {
  font-size: 16px;
  font-weight: 600;
  color: var(--ps-color-accent);
  margin-left: 2px;
}

.ps-intro__stats-cap {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.ps-intro__hero-quote {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--ps-space-4) var(--ps-space-5);
  background: rgba(212, 175, 55, 0.10);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--ps-radius-lg);
  color: rgba(255, 255, 255, 0.9);
}

.ps-intro__hero-quote :deep(.ps-icon) { color: var(--ps-color-accent); }

.ps-intro__hero-quote p {
  font-style: italic;
  font-size: var(--ps-fs-sm);
  line-height: 1.5;
}

.ps-intro__hero-quote span {
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--ps-color-accent);
}

/* ── Section common ─────────────────────────────────────── */
.ps-intro__section {
  margin-top: var(--ps-space-10);
}

.ps-intro__hot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--ps-space-5);
}

.ps-intro__hot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.ps-intro__hot-date {
  font-size: 11px;
  color: var(--ps-text-3);
  font-family: var(--ps-font-mono);
}

.ps-intro__hot-title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-xl);
  font-weight: 700;
  line-height: 1.3;
  color: var(--ps-text-1);
  margin-bottom: var(--ps-space-3);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.ps-intro__hot-abstract {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.ps-intro__hot-meta {
  margin-top: var(--ps-space-4);
  padding-top: var(--ps-space-4);
  border-top: 1px solid var(--ps-border-1);
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
}

.ps-intro__hot-authors {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  font-size: 12px;
  color: var(--ps-text-2);
}

.ps-intro__hot-authors :deep(.ps-avatar) {
  margin-right: -8px;
  box-shadow: 0 0 0 2px var(--ps-bg-elevated);
}

.ps-intro__hot-authors :deep(.ps-avatar:last-child) { margin-right: 8px; }

.ps-intro__hot-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── Feature grid ──────────────────────────────────────── */
.ps-intro__feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--ps-space-4);
}

.ps-intro__feature-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--ps-radius-md);
  background: linear-gradient(135deg, var(--ps-color-primary-soft), var(--ps-color-accent-soft));
  color: var(--ps-color-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--ps-space-3);
}

.ps-intro__feature-title {
  font-size: var(--ps-fs-md);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: var(--ps-space-2);
}

.ps-intro__feature-desc {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  line-height: 1.6;
}

/* ── Transitions ───────────────────────────────────────── */
.ps-fade-enter-active, .ps-fade-leave-active {
  transition: opacity var(--ps-motion-fast) var(--ps-ease-out),
    transform var(--ps-motion-fast) var(--ps-ease-out);
}
.ps-fade-enter-from, .ps-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Responsive ────────────────────────────────────────── */
@media screen and (max-width: 980px) {
  .ps-intro__hero-grid {
    grid-template-columns: 1fr;
    gap: var(--ps-space-7);
  }
  .ps-intro__hero-stats { order: -1; }
  .ps-intro__stats-card ul {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media screen and (max-width: 720px) {
  .ps-intro__search-shell { padding: var(--ps-space-4); }
  .ps-intro__type-toggle { width: 100%; overflow-x: auto; }
  .ps-intro__stats-card ul {
    grid-template-columns: 1fr 1fr;
  }
  .ps-intro__search-btn span { display: none; }
}
</style>
