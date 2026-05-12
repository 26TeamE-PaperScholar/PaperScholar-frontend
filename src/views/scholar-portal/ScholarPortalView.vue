<template>
  <div class="ps-scholar">
    <AppGradientHero variant="dark" class="ps-scholar__hero">
      <AppBreadcrumb :items="breadcrumbs" class="ps-scholar__crumbs" />
      <div class="ps-scholar__hero-grid">
        <div class="ps-scholar__hero-main">
          <AppAvatar :id="authorInfo.id" :name="authorInfo.nickName" size="2xl" class="ps-scholar__avatar" />
          <div class="ps-scholar__hero-body">
            <p v-if="authorInfo.orcid" class="ps-scholar__orcid">
              <AppIcon name="RibbonOutline" :size="14" />
              ORCID {{ authorInfo.orcid }}
            </p>
            <h1 class="ps-scholar__name">{{ authorInfo.nickName || '未知学者' }}</h1>
            <p v-if="authorInfo.institution.name" class="ps-scholar__affil">
              <AppIcon name="School" :size="16" />
              <a class="ps-scholar__affil-link" @click="gotoInstitution(authorInfo.institution)">
                {{ authorInfo.institution.name }}
              </a>
            </p>
            <div class="ps-scholar__interests">
              <AppTagChip
                v-for="(tag, idx) in interestTag.slice(0, 5)"
                :key="idx"
                variant="outline"
                size="md"
              >{{ tag.name }}</AppTagChip>
            </div>
            <div class="ps-scholar__hero-actions">
              <button
                class="ps-scholar__follow-btn"
                :class="{ 'ps-scholar__follow-btn--active': isFollowing }"
                @click="toggleFollow"
              >
                <AppIcon :name="isFollowing ? 'Bookmark' : 'Add'" :size="14" />
                {{ isFollowing ? '已关注' : $t('scholar_portal_follow') || '关注' }}
              </button>
              <button class="ps-scholar__action-secondary" @click="sharePortal">
                <AppIcon name="Share" :size="14" />
                分享主页
              </button>
              <button v-if="authorInfo.email" class="ps-scholar__action-secondary" @click="contactAuthor">
                <AppIcon name="Mail" :size="14" />
                {{ authorInfo.email }}
              </button>
            </div>
          </div>
        </div>

        <aside class="ps-scholar__hero-stats">
          <div class="ps-scholar__stat">
            <span class="ps-scholar__stat-num">{{ authorInfo.hIndex || '—' }}</span>
            <span class="ps-scholar__stat-label">h-index</span>
          </div>
          <div class="ps-scholar__stat">
            <span class="ps-scholar__stat-num">{{ formatNumber(authorInfo.totalWork) }}</span>
            <span class="ps-scholar__stat-label">发表数</span>
          </div>
          <div class="ps-scholar__stat">
            <span class="ps-scholar__stat-num">{{ formatNumber(authorInfo.totalCitations) }}</span>
            <span class="ps-scholar__stat-label">总被引</span>
          </div>
          <div class="ps-scholar__stat">
            <span class="ps-scholar__stat-num">+{{ formatNumber(authorInfo.yearCitations) }}</span>
            <span class="ps-scholar__stat-label">近一年</span>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <div class="ps-scholar__layout">
      <div class="ps-scholar__main">
        <div class="ps-scholar__tabs" role="tablist">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            role="tab"
            :aria-selected="activeTab === tab.id"
            class="ps-scholar__tab"
            :class="{ 'ps-scholar__tab--active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <AppIcon :name="tab.icon" :size="14" />
            {{ tab.label }}
          </button>
        </div>

        <div v-show="activeTab === 'works'" class="ps-scholar__tab-panel">
          <SearchResultListItem
            v-for="(info, idx) in infoItems"
            :key="info.id || idx"
            :infoItem="info"
            :index="idx"
          />
          <AppEmptyState v-if="!infoItems.length" title="尚无发表记录" description="该学者主页还没有可展示的学术成果。" />
          <div class="ps-scholar__pagination" v-if="infoItems.length">
            <PaginationBar
              :items-per-page="paginationInfo.itemsPerPage"
              :current-page="paginationInfo.currentPage"
              :total-pages="paginationInfo.totalPages"
              @page-change="handleChangePage"
              @item-per-page-change="handleChangePerPage"
            />
          </div>
        </div>

        <div v-show="activeTab === 'trend'" class="ps-scholar__tab-panel">
          <AppCard>
            <AppSectionHeader
              title="发表与引用趋势"
              subtitle="按年聚合，反映学者活跃度与影响力轨迹"
              tag="h2"
            />
            <!-- 恢复原 ECharts 双轴柱状图 -->
            <ScholarGraphCite v-if="counts_by_year.length" :info="counts_by_year" />
            <AppEmptyState
              v-else
              title="暂无趋势数据"
              description="该学者尚未提供逐年统计信息。"
            />
          </AppCard>
        </div>

        <div v-show="activeTab === 'network'" class="ps-scholar__tab-panel">
          <AppCard>
            <AppSectionHeader title="合作网络" subtitle="基于共同发表论文构建" tag="h2" />
            <!-- 恢复原 relation-graph 关系网络可视化 -->
            <AuthorRelationGraph v-if="relationList && relationList.length" :relationList="relationList" />
            <AppEmptyState
              v-else
              title="暂无合作者数据"
              description="此学者主页还没有可展示的合作网络。"
            />
            <div v-if="collaboratorPreview.length" class="ps-scholar__network">
              <h3 class="ps-scholar__network-title">部分合作者一览</h3>
              <div class="ps-scholar__network-grid">
                <div
                  v-for="(node, idx) in collaboratorPreview"
                  :key="idx"
                  class="ps-scholar__network-node"
                  @click="gotoScholar(node.id)"
                >
                  <AppAvatar :id="node.id" :name="node.display_name" size="md" />
                  <div>
                    <h4>{{ node.display_name }}</h4>
                    <p>{{ node.last_known_institution && node.last_known_institution.display_name }}</p>
                  </div>
                  <AppMetricBadge :value="node.h_index || '—'" label="h" tone="violet" />
                </div>
              </div>
            </div>
          </AppCard>
        </div>
      </div>

      <aside class="ps-scholar__sidebar">
        <AppCard accent="gold">
          <AppSectionHeader title="研究方向" tag="h3" />
          <div class="ps-scholar__keywords">
            <AppTagChip
              v-for="(tag, idx) in interestTag"
              :key="idx"
              variant="gold"
              size="md"
              clickable
              @click="gotoTag(tag)"
            >{{ tag.name }}</AppTagChip>
          </div>
        </AppCard>

        <AppCard v-if="authorInfo.urls.length">
          <AppSectionHeader title="对外链接" tag="h3" />
          <ul class="ps-scholar__links">
            <li v-for="(url, idx) in authorInfo.urls" :key="idx">
              <AppIcon name="GlobeOutline" :size="14" />
              <a :href="url" target="_blank" rel="noopener">{{ url }}</a>
            </li>
          </ul>
        </AppCard>

        <AppCard>
          <AppSectionHeader title="主页二维码" subtitle="路演分享方便" tag="h3" />
          <div class="ps-scholar__qr" aria-hidden="true">
            <svg viewBox="0 0 100 100" width="120" height="120">
              <rect width="100" height="100" fill="#FFFFFF" />
              <g fill="#0F0E1A">
                <rect x="6" y="6" width="22" height="22" />
                <rect x="72" y="6" width="22" height="22" />
                <rect x="6" y="72" width="22" height="22" />
                <rect x="12" y="12" width="10" height="10" fill="#FFFFFF" />
                <rect x="78" y="12" width="10" height="10" fill="#FFFFFF" />
                <rect x="12" y="78" width="10" height="10" fill="#FFFFFF" />
                <rect x="36" y="6" width="6" height="6" />
                <rect x="48" y="6" width="6" height="6" />
                <rect x="60" y="6" width="6" height="6" />
                <rect x="36" y="18" width="6" height="6" />
                <rect x="54" y="18" width="6" height="6" />
                <rect x="36" y="30" width="6" height="6" />
                <rect x="48" y="30" width="6" height="6" />
                <rect x="66" y="30" width="6" height="6" />
                <rect x="6" y="36" width="6" height="6" />
                <rect x="18" y="36" width="6" height="6" />
                <rect x="42" y="42" width="6" height="6" />
                <rect x="54" y="42" width="6" height="6" />
                <rect x="72" y="42" width="6" height="6" />
                <rect x="84" y="42" width="6" height="6" />
                <rect x="30" y="48" width="6" height="6" />
                <rect x="42" y="48" width="6" height="6" />
                <rect x="60" y="48" width="6" height="6" />
                <rect x="78" y="48" width="6" height="6" />
                <rect x="36" y="60" width="6" height="6" />
                <rect x="54" y="60" width="6" height="6" />
                <rect x="66" y="60" width="6" height="6" />
                <rect x="42" y="72" width="6" height="6" />
                <rect x="60" y="72" width="6" height="6" />
                <rect x="78" y="72" width="6" height="6" />
                <rect x="36" y="84" width="6" height="6" />
                <rect x="54" y="84" width="6" height="6" />
                <rect x="72" y="84" width="6" height="6" />
              </g>
            </svg>
          </div>
        </AppCard>
      </aside>
    </div>
  </div>
</template>

<script>
import SearchResultListItem from '../../components/search-result-list/SearchResultListItem.vue'
import PaginationBar from '../../components/pagination/PaginationBar.vue'
import ScholarGraphCite from '../../components/graphs/ScholarGraphCite.vue'
import AuthorRelationGraph from '../../components/relation-graph/RelationGraph.vue'
import { Search } from '../../api/search.js'
import { History } from '../../api/history.js'
import { User } from '../../api/users'
import { mockAuthors } from '../../mock/authors'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppAvatar, AppEmptyState, AppMetricBadge, AppBreadcrumb } from '../../components/ui'

export default {
  name: 'ScholarPortalView',
  components: {
    SearchResultListItem,
    PaginationBar,
    ScholarGraphCite,
    AuthorRelationGraph,
    AppCard,
    AppIcon,
    AppTagChip,
    AppSectionHeader,
    AppGradientHero,
    AppAvatar,
    AppEmptyState,
    AppMetricBadge,
    AppBreadcrumb
  },
  data() {
    return {
      isFollowing: false,
      activeTab: 'works',
      tabs: [
        { id: 'works', label: '代表论文', icon: 'Document' },
        { id: 'trend', label: '引用趋势', icon: 'TrendingUp' },
        { id: 'network', label: '合作网络', icon: 'GitBranch' }
      ],
      authorInfo: {
        id: '',
        orcid: '',
        worksApiUrl: '',
        nickName: '',
        realName: '',
        region: '',
        institution: { id: '', ror: '', name: '' },
        email: '',
        gender: '',
        urls: [],
        major: '',
        totalCitations: 0,
        totalWork: 0,
        yearCitations: 0,
        hIndex: 0
      },
      paginationInfo: { itemsPerPage: 5, currentPage: 1, totalPages: 1 },
      infoItems: [],
      interestTag: [],
      counts_by_year: [],
      relationList: []
    }
  },
  computed: {
    breadcrumbs() {
      return [
        { label: '首页', to: '/' },
        { label: '学者', to: '/search_result?search_type=2' },
        { label: this.authorInfo.nickName || '学者主页' }
      ]
    },
    maxCitations() {
      const max = Math.max(...this.counts_by_year.map((c) => c.cited_by_count || 0), 1)
      return max
    },
    collaboratorPreview() {
      return mockAuthors.filter((a) => a.id !== this.authorInfo.id).slice(0, 6)
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        if (!newId) return
        this.authorInfo.id = newId
        this.activeTab = 'works'
        this.paginationInfo.currentPage = 1
        this.infoItems = []
        this.counts_by_year = []
        this.relationList = []
        this.interestTag = []
        this.getAuthorInfo()
        this.getRelationMap()
      }
    }
  },
  methods: {
    getAuthorInfo() {
      if (!this.authorInfo.id) return
      Search.searchAuthorInfo(this.authorInfo.id).then(
        (res) => {
          const data = (res && res.data) || {}
          this.authorInfo.nickName = data.display_name || ''
          this.authorInfo.realName = data.display_name_alt || ''
          this.authorInfo.totalWork = data.works_count || 0
          this.authorInfo.totalCitations = data.cited_by_count || 0
          this.authorInfo.hIndex = data.h_index || 0
          this.authorInfo.orcid = data.orcid || ''
          if (data.last_known_institution) {
            this.authorInfo.institution = {
              id: data.last_known_institution.id || '',
              name: data.last_known_institution.display_name || '',
              ror: data.last_known_institution.ror || ''
            }
          }
          this.authorInfo.email = data.email || ''
          this.authorInfo.urls = data.urls || data.websites || []
          this.interestTag = (data.research_interests || []).map((n) => ({ name: n, id: '' }))
          this.counts_by_year = data.counts_by_year || []
          const latest = (data.counts_by_year || []).slice(-1)[0]
          if (latest) this.authorInfo.yearCitations = latest.cited_by_count
          this.loadWorks()
        },
        () => {}
      )
    },
    loadWorks() {
      Search.searchWorks({
        search: this.authorInfo.nickName,
        per_page: this.paginationInfo.itemsPerPage,
        page: this.paginationInfo.currentPage,
        sort: 'cited_by_count:desc'
      }).then((res) => {
        const data = (res && res.data) || {}
        this.infoItems = (data.results || []).map((r) => ({ ...r, keyword: '' }))
        const meta = data.meta || {}
        this.paginationInfo.totalPages = meta.total_pages || 1
      })
    },
    getRelationMap() {
      if (!this.authorInfo.id) return
      History.getRelationMap(this.authorInfo.id).then(
        (res) => { this.relationList = (res && res.data) || [] },
        () => {}
      )
    },
    handleChangePage(page) {
      this.paginationInfo.currentPage = page
      this.loadWorks()
    },
    handleChangePerPage(n) {
      this.paginationInfo.itemsPerPage = n
      this.paginationInfo.currentPage = 1
      this.loadWorks()
    },
    toggleFollow() {
      if (this.isFollowing) this.unfollow()
      else this.follow()
    },
    follow() {
      User.followUser({ user_id: this.authorInfo.id }).then(() => {
        this.isFollowing = true
        this.$bus.emit('message', { title: '关注成功', content: this.authorInfo.nickName, time: 1500 })
      })
    },
    unfollow() {
      User.cancelFollowUser({ user_id: this.authorInfo.id }).then(() => {
        this.isFollowing = false
        this.$bus.emit('message', { title: '已取消关注', content: '', time: 1500 })
      })
    },
    sharePortal() {
      try {
        navigator.clipboard.writeText(window.location.href)
        this.$bus.emit('message', { title: '已复制学者主页链接', content: window.location.href, time: 1800 })
      } catch (e) {}
    },
    contactAuthor() {
      if (this.authorInfo.email) window.location.href = 'mailto:' + this.authorInfo.email
    },
    gotoInstitution(inst) {
      if (inst && inst.id) this.$router.push('/institution_detail/' + inst.id)
    },
    gotoTag(tag) {
      if (tag && tag.id) this.$router.push('/tag_detail/' + tag.id)
    },
    gotoScholar(id) {
      if (id) this.$router.push('/scholar_portal/' + id)
    },
    formatNumber(n) {
      if (typeof n !== 'number') return n || 0
      if (Math.abs(n) >= 10_000) return (n / 1_000).toFixed(1) + 'K'
      return n.toLocaleString('en-US')
    },
    pct(value) {
      return Math.max(2, Math.round(((value || 0) / this.maxCitations) * 100))
    },
    barStyle() {
      return {}
    }
  }
}
</script>

<style scoped>
.ps-scholar {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-scholar__hero { margin-bottom: var(--ps-space-7); }

.ps-scholar__crumbs { margin-bottom: var(--ps-space-5); }

.ps-scholar__crumbs :deep(.ps-breadcrumb a),
.ps-scholar__crumbs :deep(.ps-breadcrumb__current),
.ps-scholar__crumbs :deep(.ps-breadcrumb__sep) {
  color: rgba(255, 255, 255, 0.7);
}

.ps-scholar__crumbs :deep(.ps-breadcrumb__current) {
  color: var(--ps-color-accent);
}

.ps-scholar__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 360px);
  gap: var(--ps-space-7);
  align-items: center;
}

.ps-scholar__hero-main {
  display: flex;
  gap: var(--ps-space-6);
  align-items: center;
}

.ps-scholar__avatar :deep(.ps-avatar__initials) {
  font-size: 38px !important;
}

.ps-scholar__avatar {
  border: 3px solid rgba(212, 175, 55, 0.5);
  box-shadow: var(--ps-shadow-gold);
}

.ps-scholar__hero-body { flex: 1; min-width: 0; }

.ps-scholar__orcid {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 10px;
  background: rgba(212, 175, 55, 0.15);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: var(--ps-radius-pill);
  font-size: 11px;
  font-family: var(--ps-font-mono);
  color: var(--ps-color-accent);
  margin-bottom: var(--ps-space-3);
}

.ps-scholar__name {
  font-family: var(--ps-font-display);
  font-size: clamp(32px, 4vw, 48px);
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.1;
  margin-bottom: var(--ps-space-3);
}

.ps-scholar__affil {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: var(--ps-fs-md);
  color: rgba(255, 255, 255, 0.78);
  margin-bottom: var(--ps-space-4);
}

.ps-scholar__affil-link {
  color: #FFFFFF;
  font-weight: 600;
  cursor: pointer;
}

.ps-scholar__affil-link:hover { color: var(--ps-color-accent); }

.ps-scholar__interests {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--ps-space-5);
}

.ps-scholar__interests :deep(.ps-chip--outline) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.28);
  color: #FFFFFF;
}

.ps-scholar__hero-actions {
  display: flex;
  gap: var(--ps-space-2);
  flex-wrap: wrap;
}

.ps-scholar__follow-btn {
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
  transition: background var(--ps-motion-base) var(--ps-ease-out);
}

.ps-scholar__follow-btn:hover { background: var(--ps-color-accent-strong); }

.ps-scholar__follow-btn--active {
  background: rgba(212, 175, 55, 0.18);
  color: var(--ps-color-accent);
  border: 1px solid rgba(212, 175, 55, 0.45);
}

.ps-scholar__action-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  height: 38px;
  background: rgba(255, 255, 255, 0.08);
  color: #FFFFFF;
  border-radius: var(--ps-radius-pill);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  cursor: pointer;
}

.ps-scholar__action-secondary:hover { background: rgba(255, 255, 255, 0.14); }

.ps-scholar__hero-stats {
  background: rgba(15, 14, 26, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ps-space-3) var(--ps-space-5);
  backdrop-filter: blur(10px);
}

.ps-scholar__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ps-scholar__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.0;
}

.ps-scholar__stat-label {
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--ps-color-accent);
}

/* ── Layout ─────────────────────────────────────────── */
.ps-scholar__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-6);
  align-items: flex-start;
}

.ps-scholar__tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  margin-bottom: var(--ps-space-4);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-pill);
  width: fit-content;
}

.ps-scholar__tab {
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

.ps-scholar__tab:hover { color: var(--ps-text-1); }

.ps-scholar__tab--active {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

.ps-scholar__pagination {
  margin-top: var(--ps-space-5);
  display: flex;
  justify-content: center;
}

.ps-scholar__trend {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ps-scholar__trend-row {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 100px 60px;
  align-items: center;
  gap: var(--ps-space-3);
  font-size: var(--ps-fs-sm);
}

.ps-scholar__trend-year {
  font-family: var(--ps-font-mono);
  font-weight: 600;
  color: var(--ps-text-2);
}

.ps-scholar__trend-bar {
  height: 8px;
  background: var(--ps-bg-sunken);
  border-radius: var(--ps-radius-pill);
  overflow: hidden;
  position: relative;
}

.ps-scholar__trend-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--ps-color-primary), var(--ps-color-accent));
  border-radius: inherit;
  transition: width var(--ps-motion-slow) var(--ps-ease-out);
}

.ps-scholar__trend-val {
  font-weight: 600;
  color: var(--ps-text-1);
}

.ps-scholar__trend-val--mini {
  color: var(--ps-text-3);
  font-size: 12px;
}

.ps-scholar__network {
  margin-top: var(--ps-space-6);
}

.ps-scholar__network-title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-md);
  color: var(--ps-text-1);
  font-weight: 700;
  margin-bottom: var(--ps-space-3);
}

.ps-scholar__network-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ps-space-3);
}

.ps-scholar__network-node {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  padding: var(--ps-space-3) var(--ps-space-4);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    border-color var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-scholar__network-node:hover {
  background: var(--ps-color-primary-soft);
  border-color: var(--ps-color-primary);
}

.ps-scholar__network-node > div { flex: 1; min-width: 0; }

.ps-scholar__network-node h4 {
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-1);
  margin-bottom: 2px;
}

.ps-scholar__network-node p {
  font-size: 12px;
  color: var(--ps-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Sidebar ────────────────────────────────────────── */
.ps-scholar__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-4));
}

.ps-scholar__keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ps-scholar__links li {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  border-bottom: 1px dashed var(--ps-border-1);
}

.ps-scholar__links li:last-child { border: 0; }

.ps-scholar__links a {
  color: var(--ps-color-primary);
  font-size: 13px;
  word-break: break-all;
}

.ps-scholar__qr {
  display: flex;
  justify-content: center;
  padding: var(--ps-space-4);
  background: linear-gradient(135deg, #FFFFFF, var(--ps-bg-sunken));
  border-radius: var(--ps-radius-md);
}

.ps-scholar__qr svg {
  border-radius: var(--ps-radius-sm);
  box-shadow: var(--ps-shadow-1);
}

@media screen and (max-width: 1024px) {
  .ps-scholar__hero-grid,
  .ps-scholar__layout {
    grid-template-columns: 1fr;
  }
  .ps-scholar__sidebar { position: static; }
}

@media screen and (max-width: 720px) {
  .ps-scholar { padding: var(--ps-space-4); }
  .ps-scholar__hero-main {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
  .ps-scholar__network {
    grid-template-columns: 1fr;
  }
}
</style>
