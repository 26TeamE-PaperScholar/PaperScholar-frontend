<template>
  <div class="ps-dash">
    <AppGradientHero variant="dark" compact class="ps-dash__hero">
      <div class="ps-dash__hero-grid">
        <div>
          <p class="ps-dash__eyebrow">{{ greeting }}</p>
          <h1 class="ps-dash__title">
            {{ userName }}{{ titleSeparator }}<br />
            <span class="ps-dash__title-accent">{{ $t('dashboard_title_suffix') }}</span>
          </h1>
          <div class="ps-dash__search">
            <AppIcon name="Search" :size="18" />
            <input
              v-model="searchKeyword"
              type="text"
              :placeholder="$t('dashboard_search_placeholder')"
              @keyup.enter="basicSearch"
            />
            <AppKbdHint>⌘K</AppKbdHint>
            <button class="ps-dash__search-btn" @click="basicSearch">{{ $t('dashboard_search_button') }}</button>
          </div>
          <div class="ps-dash__quick">
            <span>{{ $t('dashboard_quick_topics') }}</span>
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
          <p class="ps-dash__stats-label">{{ $t('dashboard_today') }}</p>
          <ul>
            <li><span>{{ stats.unreadMessages }}</span> {{ $t('dashboard_unread_messages', { count: '' }).trim() }}</li>
            <li><span>{{ stats.newFromFollowing }}</span> {{ $t('dashboard_follow_updates', { count: '' }).trim() }}</li>
            <li><span>{{ stats.recommended }}</span> {{ $t('dashboard_recommended_reads', { count: '' }).trim() }}</li>
          </ul>
        </aside>
      </div>
    </AppGradientHero>

    <section class="ps-dash__section">
      <AppSectionHeader :eyebrow="$t('dashboard_for_you')" :title="$t('dashboard_interest_subscription')" :subtitle="$t('dashboard_interest_subtitle')">
        <template #actions>
          <button class="basic-btn-outline ps-dash__more" @click="viewMore('recommend')">
            {{ $t('common_view_all') }}
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
            <AppTagChip variant="subtle" size="sm">{{ paper.matched_interest || $t('dashboard_recommend_tag') }}</AppTagChip>
            <span class="ps-dash__card-date">{{ paper.publication_date }}</span>
          </div>
          <h3 class="ps-dash__card-title">{{ paper.title }}</h3>
          <p class="ps-dash__card-abstract">{{ paper.abstract }}</p>
          <div class="ps-dash__card-meta">
            <span><AppIcon name="FlameOutline" :size="12" /> {{ $t('dashboard_citations', { count: paper.cited_by_count }) }}</span>
            <span><AppIcon name="People" :size="12" /> {{ $t('dashboard_authors_count', { count: (paper.authorships || []).length }) }}</span>
          </div>
        </AppCard>
      </div>
    </section>

    <section class="ps-dash__section">
      <AppSectionHeader :eyebrow="$t('dashboard_hot_eyebrow')" :title="$t('dashboard_hot_title')" :subtitle="$t('dashboard_hot_subtitle')">
        <template #actions>
          <button class="basic-btn-outline ps-dash__more" @click="viewMore('hot')">
            {{ $t('common_view_all') }}
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
              <span v-if="(p.authorships || []).length > 2"> · {{ $t('common_authors_etc', { count: p.authorships.length }) }}</span>
            </p>
          </div>
          <div class="ps-dash__hot-meta">
            <AppMetricBadge :value="p.cited_by_count" tone="violet" icon="FlameOutline" />
          </div>
        </div>
        <AppEmptyState v-if="!hotPapers.length" :title="$t('dashboard_no_hot')" />
      </div>
    </section>
  </div>
</template>

<script>
import { Article } from '../../api/article.js'
import { Messages } from '../../api/messages.js'
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
        { id: 'C5', name: 'Graph Neural Networks' },
        { id: 'C20', name: 'Causal Inference' },
        { id: 'C14', name: 'Quantum Computing' },
        { id: 'C2', name: 'Multimodal LLM' }
      ],
      stats: { unreadMessages: 0, newFromFollowing: 5, recommended: 12 }
    }
  },
  computed: {
    greeting() {
      const h = new Date().getHours()
      if (h < 6) return this.$t('greeting_early')
      if (h < 12) return this.$t('greeting_morning')
      if (h < 18) return this.$t('greeting_afternoon')
      return this.$t('greeting_evening')
    },
    userName() {
      return this.$cookies && this.$cookies.get('user_id') ? this.$t('user_student') : this.$t('user_researcher')
    },
    titleSeparator() {
      return this.$i18n.locale === 'zh' ? '，' : ','
    }
  },
  mounted() {
    this.$bus.on('messageUnreadChanged', this.handleUnreadMessagesChanged)
    this.loadUnreadMessages()
    Article.getInterestRecommend().then((res) => { this.interestList = ((res && res.data) || []).slice(0, 6) })
    Article.getHotspotRecommend().then((res) => { this.hotPapers = ((res && res.data) || []).slice(0, 5) })
  },
  beforeUnmount() {
    this.$bus.off('messageUnreadChanged', this.handleUnreadMessagesChanged)
  },
  methods: {
    applyUnreadMessageCount(count, shouldBroadcast = true) {
      const unreadCount = Math.max(0, Number(count) || 0)
      this.stats.unreadMessages = unreadCount
      if (shouldBroadcast) {
        this.$bus.emit('messageUnreadChanged', { unreadCount, hasUnread: unreadCount > 0 })
      }
    },
    handleUnreadMessagesChanged(payload) {
      if (payload && Object.prototype.hasOwnProperty.call(payload, 'unreadCount')) {
        this.applyUnreadMessageCount(payload.unreadCount, false)
        return
      }
      this.loadUnreadMessages()
    },
    loadUnreadMessages() {
      Messages.getUnreadReceivedCount().then(
        (count) => { this.applyUnreadMessageCount(count) },
        () => {}
      )
    },
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
        query: { sort: 'cited_by_count:desc', search_type: 1, per_page: '10', page: '1' }
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
  color: var(--ps-hero-eyebrow);
  font-weight: 700;
  margin-bottom: var(--ps-space-2);
}

.ps-dash__title {
  font-family: var(--ps-font-display);
  font-size: clamp(28px, 3.6vw, 40px);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
  line-height: 1.15;
  margin-bottom: var(--ps-space-5);
}

.ps-dash__title-accent {
  background: linear-gradient(120deg, var(--ps-hero-text-strong), var(--ps-color-accent));
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
  color: var(--ps-hero-text-faint);
  text-transform: uppercase;
}

.ps-dash__quick :deep(.ps-chip--outline) {
  background: var(--ps-hero-chip-bg);
  border-color: var(--ps-hero-chip-border);
  color: var(--ps-hero-chip-text);
}

.ps-dash__hero-stats {
  background: var(--ps-hero-surface);
  border: 1px solid var(--ps-hero-surface-border);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  backdrop-filter: blur(10px);
}

.ps-dash__stats-label {
  font-size: 11px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ps-hero-eyebrow);
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
  color: var(--ps-hero-text-muted);
}

.ps-dash__hero-stats li span {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
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
