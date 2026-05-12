<template>
  <div class="ps-dash">
    <AppGradientHero variant="dark" compact class="ps-dash__hero">
      <div class="ps-dash__hero-grid">
        <div>
          <p class="ps-dash__eyebrow">{{ greeting }}</p>
          <h1 class="ps-dash__title">
            {{ userName }}，<br />
            <span class="ps-dash__title-accent">今天准备研究什么？</span>
          </h1>
          <div class="ps-dash__search">
            <AppIcon name="Search" :size="18" />
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="检索论文、学者、机构、主题——⌘K 快速聚焦"
              @keyup.enter="basicSearch"
            />
            <AppKbdHint>⌘K</AppKbdHint>
            <button class="ps-dash__search-btn" @click="basicSearch">检索</button>
          </div>
          <div class="ps-dash__quick">
            <span>常用主题</span>
            <AppTagChip
              v-for="tag in quickTopics"
              :key="tag.id"
              variant="outline"
              clickable
              @click="searchTag(tag)"
            >{{ tag.name }}</AppTagChip>
          </div>
        </div>
        <aside class="ps-dash__hero-stats">
          <p class="ps-dash__stats-label">今日动态</p>
          <ul>
            <li><span>{{ stats.unreadMessages }}</span> 条未读消息</li>
            <li><span>{{ stats.newFromFollowing }}</span> 篇关注更新</li>
            <li><span>{{ stats.recommended }}</span> 篇推荐阅读</li>
          </ul>
        </aside>
      </div>
    </AppGradientHero>

    <section class="ps-dash__section">
      <AppSectionHeader eyebrow="为你推荐" title="兴趣订阅" subtitle="基于您选择的兴趣标签自动生成">
        <template #actions>
          <button class="basic-btn-outline ps-dash__more" @click="viewMore('recommend')">
            查看全部
            <AppIcon name="ChevronForward" :size="14" />
          </button>
        </template>
      </AppSectionHeader>
      <div class="ps-dash__grid">
        <AppCard
          v-for="paper in interestList"
          :key="paper.id"
          hover
          interactive
          @click="goPaper(paper.id)"
        >
          <div class="ps-dash__card-header">
            <AppTagChip variant="subtle" size="sm">{{ paper.matched_interest || '推荐' }}</AppTagChip>
            <span class="ps-dash__card-date">{{ paper.publication_date }}</span>
          </div>
          <h3 class="ps-dash__card-title">{{ paper.title }}</h3>
          <p class="ps-dash__card-abstract">{{ paper.abstract }}</p>
          <div class="ps-dash__card-meta">
            <span><AppIcon name="FlameOutline" :size="12" /> {{ paper.cited_by_count }} 引用</span>
            <span><AppIcon name="People" :size="12" /> {{ (paper.authorships || []).length }} 位作者</span>
          </div>
        </AppCard>
      </div>
    </section>

    <section class="ps-dash__section">
      <AppSectionHeader eyebrow="近期热点" title="学术热度榜" subtitle="基于引用突增与跨学科曝光">
        <template #actions>
          <button class="basic-btn-outline ps-dash__more" @click="viewMore('hot')">
            查看全部
            <AppIcon name="ChevronForward" :size="14" />
          </button>
        </template>
      </AppSectionHeader>
      <div class="ps-dash__hot-list">
        <div
          v-for="(p, idx) in hotPapers"
          :key="p.id"
          class="ps-dash__hot-item"
          @click="goPaper(p.id)"
        >
          <span class="ps-dash__hot-rank">{{ String(idx + 1).padStart(2, '0') }}</span>
          <div class="ps-dash__hot-body">
            <h4>{{ p.title }}</h4>
            <p>
              <span v-for="(a, ai) in (p.authorships || []).slice(0, 2)" :key="ai">
                {{ a.author.display_name }}
                <span v-if="ai < Math.min(p.authorships.length, 2) - 1">·</span>
              </span>
              <span v-if="(p.authorships || []).length > 2"> · 等 {{ p.authorships.length }} 位作者</span>
            </p>
          </div>
          <div class="ps-dash__hot-meta">
            <AppMetricBadge :value="p.cited_by_count" tone="violet" icon="FlameOutline" />
          </div>
        </div>
        <AppEmptyState v-if="!hotPapers.length" title="暂无热点数据" />
      </div>
    </section>
  </div>
</template>

<script>
import { Article } from '../../api/article.js'
import { Search } from '../../api/search.js'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppMetricBadge, AppEmptyState, AppKbdHint } from '../../components/ui'

export default {
  name: 'SearchView',
  components: {
    AppCard,
    AppIcon,
    AppTagChip,
    AppSectionHeader,
    AppGradientHero,
    AppMetricBadge,
    AppEmptyState,
    AppKbdHint
  },
  data() {
    return {
      searchKeyword: '',
      hotPapers: [],
      interestList: [],
      quickTopics: [
        { id: 'C1', name: 'Retrieval-Augmented Generation' },
        { id: 'C5', name: '图神经网络' },
        { id: 'C20', name: '因果推断' },
        { id: 'C14', name: '量子计算' },
        { id: 'C2', name: 'Multimodal LLM' }
      ],
      stats: { unreadMessages: 2, newFromFollowing: 5, recommended: 12 }
    }
  },
  computed: {
    greeting() {
      const h = new Date().getHours()
      if (h < 6) return '清晨好'
      if (h < 12) return '上午好'
      if (h < 18) return '下午好'
      return '晚上好'
    },
    userName() {
      return this.$cookies && this.$cookies.get('user_id') ? '同学' : '研究者'
    }
  },
  mounted() {
    Article.getInterestRecommend().then((res) => { this.interestList = ((res && res.data) || []).slice(0, 6) })
    Article.getHotspotRecommend().then((res) => { this.hotPapers = ((res && res.data) || []).slice(0, 5) })
  },
  methods: {
    basicSearch() {
      const k = this.searchKeyword.trim()
      if (!k) return
      this.$router.push({
        path: '/search_result',
        query: { search: k, search_type: 1, per_page: '10', page: '1' }
      })
    },
    searchTag(tag) {
      this.$router.push({
        path: '/search_result',
        query: { search: tag.name, search_type: 1, per_page: '10', page: '1' }
      })
    },
    viewMore() {
      this.$router.push({
        path: '/search_result',
        query: { search: '', sort: 'cited_by_count:desc', search_type: 1, per_page: '10', page: '1' }
      })
    },
    goPaper(id) {
      this.$router.push('/paper_detail/' + id)
    }
  }
}
</script>

<style scoped>
.ps-dash {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-dash__hero { margin-bottom: var(--ps-space-7); }

.ps-dash__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 280px);
  gap: var(--ps-space-6);
  align-items: center;
}

.ps-dash__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ps-color-accent);
  font-weight: 700;
  margin-bottom: var(--ps-space-2);
}

.ps-dash__title {
  font-family: var(--ps-font-display);
  font-size: clamp(28px, 3.6vw, 40px);
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.15;
  margin-bottom: var(--ps-space-5);
}

.ps-dash__title-accent {
  background: linear-gradient(120deg, #FFFFFF, var(--ps-color-accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  color: transparent;
}

.ps-dash__search {
  background: var(--ps-bg-elevated);
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  height: 56px;
  padding: 0 var(--ps-space-3) 0 var(--ps-space-5);
  border-radius: var(--ps-radius-pill);
  box-shadow: var(--ps-shadow-3);
}

.ps-dash__search input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: 0;
  font-size: var(--ps-fs-lg);
  color: var(--ps-text-1);
  min-width: 0;
}

.ps-dash__search input::placeholder { color: var(--ps-text-3); }

.ps-dash__search-btn {
  height: 40px;
  padding: 0 18px;
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  border-radius: var(--ps-radius-pill);
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  cursor: pointer;
}

.ps-dash__quick {
  margin-top: var(--ps-space-4);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.ps-dash__quick > span {
  font-size: 11px;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
}

.ps-dash__quick :deep(.ps-chip--outline) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  color: #FFFFFF;
}

.ps-dash__hero-stats {
  background: rgba(15, 14, 26, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  backdrop-filter: blur(10px);
}

.ps-dash__stats-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ps-color-accent);
  font-weight: 700;
  margin-bottom: var(--ps-space-3);
}

.ps-dash__hero-stats ul {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
}

.ps-dash__hero-stats li {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: var(--ps-fs-sm);
  color: rgba(255, 255, 255, 0.7);
}

.ps-dash__hero-stats li span {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: #FFFFFF;
}

/* ── Section ─────────────────────────────────────── */
.ps-dash__section { margin-top: var(--ps-space-8); }

.ps-dash__more {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.ps-dash__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--ps-space-4);
}

.ps-dash__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--ps-space-3);
}

.ps-dash__card-date {
  font-family: var(--ps-font-mono);
  font-size: 11px;
  color: var(--ps-text-3);
}

.ps-dash__card-title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-md);
  font-weight: 700;
  color: var(--ps-text-1);
  line-height: 1.35;
  margin-bottom: var(--ps-space-2);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.ps-dash__card-abstract {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.ps-dash__card-meta {
  margin-top: var(--ps-space-3);
  padding-top: var(--ps-space-3);
  border-top: 1px solid var(--ps-border-1);
  display: flex;
  gap: var(--ps-space-3);
  font-size: 12px;
  color: var(--ps-text-3);
}

.ps-dash__card-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ps-dash__hot-list {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  overflow: hidden;
}

.ps-dash__hot-item {
  display: flex;
  align-items: center;
  gap: var(--ps-space-4);
  padding: var(--ps-space-4);
  border-bottom: 1px solid var(--ps-border-1);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-dash__hot-item:last-child { border: 0; }
.ps-dash__hot-item:hover { background: var(--ps-color-primary-soft); }

.ps-dash__hot-rank {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-xl);
  font-weight: 700;
  color: var(--ps-color-accent);
  width: 40px;
  flex: none;
  letter-spacing: -0.01em;
}

.ps-dash__hot-body { flex: 1; min-width: 0; }

.ps-dash__hot-body h4 {
  font-size: var(--ps-fs-md);
  font-weight: 600;
  color: var(--ps-text-1);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  overflow: hidden;
}

.ps-dash__hot-body p {
  font-size: 12px;
  color: var(--ps-text-3);
}

.ps-dash__hot-meta { flex: none; }

@media screen and (max-width: 980px) {
  .ps-dash__hero-grid {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 720px) {
  .ps-dash { padding: var(--ps-space-4); }
}
</style>
