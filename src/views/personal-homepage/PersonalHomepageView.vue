<template>
  <div class="ps-me">
    <AppGradientHero variant="dark" compact class="ps-me__hero">
      <div class="ps-me__hero-grid">
        <div class="ps-me__hero-main">
          <div class="ps-me__avatar-wrap" @click="triggerAvatarUpload">
            <img
              v-if="personalInfo.avatarUrl && avatarLoaded"
              :src="personalInfo.avatarUrl"
              alt="avatar"
              class="ps-me__avatar-img"
              @error="avatarLoaded = false"
            />
            <AppAvatar
              v-else
              :id="personalInfo.id"
              :name="personalInfo.nickName"
              :gradient="personalInfo.avatarGradient"
              size="2xl"
              class="ps-me__avatar"
            />
            <span class="ps-me__avatar-overlay" aria-hidden="true">
              <AppIcon name="Pencil" :size="16" />
              更换头像
            </span>
            <input type="file" accept="image/*" ref="avatarInput" class="ps-me__file-input" @change="handleAvatarFile" />
          </div>
          <div>
            <p class="ps-me__eyebrow">个人主页</p>
            <h1 class="ps-me__name">
              <template v-if="!isEditing">{{ personalInfo.nickName }}</template>
              <input v-else class="basic-input ps-me__name-input" v-model="personalInfo.nickName" />
            </h1>
            <p class="ps-me__realname">
              <template v-if="!isEditing">{{ personalInfo.realName || '尚未设置真实姓名' }}</template>
              <input v-else class="basic-input ps-me__realname-input" v-model="personalInfo.realName" :placeholder="$t('personal_info_real_name') || '真实姓名'" />
            </p>
            <p class="ps-me__bio">{{ personalInfo.bio }}</p>
          </div>
        </div>

        <aside class="ps-me__hero-stats">
          <div class="ps-me__stat">
            <span class="ps-me__stat-num">{{ favouritesInfo.length }}</span>
            <span class="ps-me__stat-label">收藏夹</span>
          </div>
          <div class="ps-me__stat">
            <span class="ps-me__stat-num">{{ interests.length }}</span>
            <span class="ps-me__stat-label">兴趣标签</span>
          </div>
          <div class="ps-me__stat">
            <span class="ps-me__stat-num">{{ followingCount }}</span>
            <span class="ps-me__stat-label">关注学者</span>
          </div>
          <div class="ps-me__hero-actions">
            <button v-if="!isEditing" class="ps-me__action-primary" @click="enterEditingMode">
              <AppIcon name="Pencil" :size="14" />
              编辑资料
            </button>
            <template v-else>
              <button class="ps-me__action-primary" @click="submitChangePersonalInfo">
                <AppIcon name="Cloud" :size="14" />
                保存
              </button>
              <button class="ps-me__action-secondary" @click="cancelChangePersonalInfo">取消</button>
            </template>
            <button v-if="!isEditing && !auditStatus" class="ps-me__action-secondary" @click="authenticateModalShouldShow = true">
              <AppIcon name="RibbonOutline" :size="14" />
              申请认证
            </button>
            <button v-if="!isEditing && auditStatus" class="ps-me__action-secondary" @click="auditDetailModalShouldShow = true">
              <AppIcon name="HelpCircle" :size="14" />
              查看审核
            </button>
          </div>
        </aside>
      </div>
    </AppGradientHero>

    <div class="ps-me__layout">
      <aside class="ps-me__sidebar">
        <AppCard>
          <AppSectionHeader title="账户信息" tag="h3" />
          <dl class="ps-me__info">
            <div>
              <dt><AppIcon name="Mail" :size="13" inline /> 邮箱</dt>
              <dd>
                <template v-if="!isEditing">{{ personalInfo.email }}</template>
                <input v-else class="basic-input ps-me__inline-input" v-model="personalInfo.email" />
              </dd>
            </div>
            <div>
              <dt><AppIcon name="LocationOutline" :size="13" inline /> 地区</dt>
              <dd>{{ personalInfo.region || '未填写' }}</dd>
            </div>
            <div>
              <dt><AppIcon name="School" :size="13" inline /> 机构</dt>
              <dd>
                <template v-if="!isEditing">{{ personalInfo.institution || '未填写' }}</template>
                <input v-else class="basic-input ps-me__inline-input" v-model="personalInfo.institution" />
              </dd>
            </div>
            <div>
              <dt><AppIcon name="Person" :size="13" inline /> 性别</dt>
              <dd>
                <template v-if="!isEditing">{{ $t(personalInfo.gender) || '未填写' }}</template>
                <select v-else v-model="personalInfo.gender" class="ps-me__inline-select">
                  <option value="gender_male">男</option>
                  <option value="gender_female">女</option>
                  <option value="gender_unset">不公开</option>
                </select>
              </dd>
            </div>
          </dl>
        </AppCard>

        <AppCard accent="gold">
          <AppSectionHeader title="对外链接" tag="h3">
            <template #actions>
              <button v-if="!isEditing" class="ps-me__link-edit" @click="enterEditingMode">
                <AppIcon name="Pencil" :size="12" />
              </button>
            </template>
          </AppSectionHeader>
          <ul class="ps-me__links">
            <li v-for="(url, idx) in personalInfo.urls" :key="idx">
              <AppIcon name="GlobeOutline" :size="13" />
              <template v-if="!isEditing">
                <a :href="url" target="_blank" rel="noopener">{{ url }}</a>
              </template>
              <template v-else>
                <input class="basic-input ps-me__inline-input" v-model="personalInfo.urls[idx]" />
                <button class="ps-me__link-remove" @click="personalInfo.urls.splice(idx, 1)" aria-label="remove">
                  <AppIcon name="Close" :size="12" />
                </button>
              </template>
            </li>
            <li v-if="isEditing" class="ps-me__add-link">
              <AppIcon name="Add" :size="13" />
              <input class="basic-input ps-me__inline-input" v-model="urlAdding" placeholder="https://" />
              <button class="ps-me__link-remove" @click="addUrl">
                <AppIcon name="Add" :size="12" />
              </button>
            </li>
          </ul>
        </AppCard>

        <AppCard>
          <AppSectionHeader title="兴趣标签" tag="h3">
            <template #actions>
              <button class="ps-me__link-edit" @click="interestTagSelectorModalShow = true">
                <AppIcon name="Add" :size="12" />
              </button>
            </template>
          </AppSectionHeader>
          <div class="ps-me__tags">
            <AppTagChip
              v-for="(tag, idx) in interests"
              :key="idx"
              size="md"
              variant="subtle"
              clickable
              removable
              @click="jumpToTagDetail(tag)"
              @remove="removeInterestTag(tag)"
            >{{ tag.name }}</AppTagChip>
            <AppEmptyState
              v-if="!interests.length"
              title="尚未选择兴趣"
              description="选择 3–5 个关心的主题，获取个性化推荐。"
            />
          </div>
        </AppCard>
      </aside>

      <section class="ps-me__main">
        <div class="ps-me__tabs">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="ps-me__tab"
            :class="{ 'ps-me__tab--active': activeTab === t.id }"
            @click="activeTab = t.id"
          >
            <AppIcon :name="t.icon" :size="14" />
            {{ t.label }}
          </button>
        </div>

        <!-- Favorites: 使用原 FavouriteList 组件，保留 CRUD 能力 -->
        <div v-if="activeTab === 'favourites'" class="ps-me__panel">
          <div class="ps-me__panel-header">
            <p class="ps-me__panel-hint">{{ favouritesInfo.length }} 个收藏夹 · 总计 {{ totalFavoriteCount }} 篇文献</p>
            <button class="basic-btn-outline ps-me__new-fav" @click="isCreating = true">
              <AppIcon name="Add" :size="14" />
              新建收藏夹
            </button>
          </div>
          <AppCard class="ps-me__fav-wrap">
            <FavouriteList
              :isCreating="isCreating"
              :favouritesInfo="favouritesInfo"
              @cancelCreation="cancelCreation"
              @updateCreation="updateCreation"
            />
            <AppEmptyState
              v-if="!favouritesInfo.length && !isCreating"
              title="还没有收藏夹"
              description="点击「新建收藏夹」开始整理你的阅读清单。"
            />
          </AppCard>
        </div>

        <!-- Following: 使用原 FollowList 组件，保留 follow/unfollow 能力 -->
        <div v-if="activeTab === 'following'" class="ps-me__panel">
          <AppCard>
            <FollowList :userID="personalInfo.id || $cookies.get('user_id')" @updated="loadFollowing" />
          </AppCard>
        </div>

        <!-- History -->
        <div v-if="activeTab === 'history'" class="ps-me__panel">
          <AppCard>
            <AppSectionHeader title="近期检索" subtitle="" tag="h3" />
            <ul class="ps-me__history">
              <li v-for="h in searchHistory" :key="h.id" @click="searchAgain(h)">
                <AppIcon name="Search" :size="13" />
                <span class="ps-me__history-keyword">{{ h.keyword }}</span>
                <span class="ps-me__history-meta">{{ h.timestamp }}</span>
              </li>
              <AppEmptyState v-if="!searchHistory.length" title="暂无搜索记录" />
            </ul>
          </AppCard>
          <AppCard>
            <AppSectionHeader title="阅读历史" subtitle="" tag="h3" />
            <ul class="ps-me__history">
              <li v-for="v in viewHistoryWithMeta" :key="v.id" @click="$router.push('/paper_detail/' + v.paper_id)">
                <AppIcon name="Eye" :size="13" />
                <span class="ps-me__history-keyword">{{ v.title }}</span>
                <span class="ps-me__history-meta">{{ v.viewed_at }}</span>
              </li>
              <AppEmptyState v-if="!viewHistoryWithMeta.length" title="暂无阅读记录" />
            </ul>
          </AppCard>
        </div>
      </section>
    </div>

    <AuthenticateIdentityModal :show="authenticateModalShouldShow" @close="authenticateModalShouldShow = false" />
    <InterestTagSelectorModal
      :show="interestTagSelectorModalShow"
      :selected-interests="interests"
      @close="interestTagSelectorModalShow = false"
    />
    <AuditDetailModal :show="auditDetailModalShouldShow" @close="auditDetailModalShouldShow = false" />
  </div>
</template>

<script>
import { User } from '../../api/users.js'
import { Article } from '../../api/article.js'
import { Application } from '../../api/applications.js'
import { History } from '../../api/history.js'
import AuthenticateIdentityModal from '../../components/modals/AuthenticateIdentityModal.vue'
import InterestTagSelectorModal from '../../components/modals/InterestTagSelectorModal.vue'
import AuditDetailModal from '../../components/modals/AuditDetailModal.vue'
import FavouriteList from '../../components/favorites/FavouriteList.vue'
import FollowList from '../../components/follow-list/FollowList.vue'
import { mockUser } from '../../mock/user'
import { findPaper } from '../../mock/papers'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppAvatar, AppEmptyState } from '../../components/ui'
import {
  buildFavoriteCreatePayload,
  buildInterestSelectPayload,
  buildProfileUpdatePayload,
  extractCreatedFavorite,
  normalizeFavoriteName
} from '../../utils/personal-page.mjs'

export default {
  name: 'PersonalHomepageView',
  components: {
    AuthenticateIdentityModal,
    InterestTagSelectorModal,
    AuditDetailModal,
    FavouriteList,
    FollowList,
    AppCard,
    AppIcon,
    AppTagChip,
    AppSectionHeader,
    AppGradientHero,
    AppAvatar,
    AppEmptyState
  },
  data() {
    return {
      isEditing: false,
      urlAdding: '',
      authenticateModalShouldShow: false,
      interestTagSelectorModalShow: false,
      auditDetailModalShouldShow: false,
      activeTab: 'favourites',
      tabs: [
        { id: 'favourites', label: '我的收藏', icon: 'Bookmark' },
        { id: 'following', label: '关注学者', icon: 'People' },
        { id: 'history', label: '浏览历史', icon: 'Time' }
      ],
      personalInfo: {
        id: '',
        avatarUrl: '',
        avatarGradient: mockUser.avatar_gradient,
        nickName: '',
        realName: '',
        region: '',
        institution: '',
        email: '',
        gender: 'gender_unset',
        urls: [],
        bio: ''
      },
      avatarLoaded: false,
      avatarChanged: false,
      avatarFile: null,
      interests: [],
      savePersonalInfo: {},
      isCreating: false,
      followingList: [],
      favouritesInfo: [],
      auditDetail: null,
      auditStatus: false,
      searchHistory: [],
      viewHistory: []
    }
  },
  computed: {
    followingCount() { return this.followingList.length },
    totalFavoriteCount() {
      return this.favouritesInfo.reduce((acc, f) => acc + ((f.paper_ids || []).length), 0)
    },
    viewHistoryWithMeta() {
      return this.viewHistory.map((v) => {
        const p = findPaper(v.paper_id)
        return { ...v, title: (p && p.title) || v.paper_id }
      })
    }
  },
  created() {
    const userId = this.ensureLoggedIn()
    if (!userId) return
    this.getUserInfo(userId)
    this.getAuditDetail()
    this.loadFavorites()
    this.loadFollowing()
    this.loadHistory()
    this.$bus.on('sendFlushInterestRequest', this.flushInterets)
    this.$bus.on('sendFlushAuditStatusRequest', this.flushAuditStatus)
  },
  beforeUnmount() {
    this.$bus.off('sendFlushInterestRequest', this.flushInterets)
    this.$bus.off('sendFlushAuditStatusRequest', this.flushAuditStatus)
  },
  methods: {
    ensureLoggedIn() {
      const userId = this.$cookies.get('user_id')
      if (userId) return userId
      this.$bus.emit('message', { title: '请先登录', content: '登录后即可查看我的页面', time: 1600 })
      this.$router.replace({
        path: '/auth',
        query: {
          mode: 'login',
          redirect: this.$route.fullPath,
          reason: 'login-required'
        }
      })
      return ''
    },
    getUserInfo(userId) {
      if (!userId) return
      User.getUser(userId).then(
        (response) => {
          const data = (response && response.data) || {}
          this.personalInfo.id = data.id || userId
          this.personalInfo.nickName = data.username || data.nickName || ''
          this.personalInfo.realName = data.real_name || ''
          this.personalInfo.region = data.region || ''
          this.personalInfo.gender = data.gender || 'gender_unset'
          this.personalInfo.institution = data.institution || ''
          this.personalInfo.email = data.email || ''
          this.personalInfo.bio = data.bio || ''
          this.personalInfo.urls = (data.websites || data.urls || []).map((u) => {
            if (!u.startsWith('http')) return 'https://' + u
            return u
          })
          this.interests = data.interests || []
        },
        () => {}
      )
    },
    loadFavorites() {
      const userId = this.personalInfo.id || this.$cookies.get('user_id') || 0
      User.getFavoriteList(userId).then(
        (response) => {
          this.favouritesInfo = (response && response.data) || []
        },
        () => {}
      )
    },
    loadFollowing() {
      const userId = this.personalInfo.id || this.$cookies.get('user_id')
      if (!userId) return
      User.getUserFollowing(userId).then(
        (response) => {
          this.followingList = (response && response.data) || []
        },
        () => {
          this.followingList = []
        }
      )
    },
    loadHistory() {
      History.getSearchHistory().then(
        (res) => { this.searchHistory = (res && res.data) || [] },
        () => {}
      )
      History.getViewHistory().then(
        (res) => { this.viewHistory = (res && res.data) || [] },
        () => {}
      )
    },
    flushInterets() {
      const userId = this.personalInfo.id || this.$cookies.get('user_id')
      if (!userId) return
      this.getUserInfo(userId)
    },
    flushAuditStatus() { this.auditStatus = true },
    jumpToTagDetail(tag) { this.$router.push('/tag_detail/' + tag.id) },
    removeInterestTag(tag) {
      const previous = [...this.interests]
      this.interests = this.interests.filter((item) => item.id !== tag.id)
      Article.modifyInterest(buildInterestSelectPayload(this.interests)).then(
        () => {
          this.$bus.emit('message', { title: '兴趣标签已删除', content: tag.name || '', time: 1500 })
          this.flushInterets()
        },
        () => {
          this.interests = previous
          this.$bus.emit('message', { title: '删除失败', content: '请稍后再试', time: 1500 })
        }
      )
    },
    getAuditDetail() {
      Application.getSubmittedList().then(
        (res) => {
          const list = (res && res.data) || []
          if (list.length) {
            this.auditDetail = list[0]
            this.auditStatus = true
          }
        }
      )
    },
    enterEditingMode() {
      this.isEditing = true
      this.cur2savePersonalInfo()
    },
    submitChangePersonalInfo() {
      this.isEditing = false
      if (this.urlAdding) { this.personalInfo.urls.push(this.urlAdding); this.urlAdding = '' }
      const userId = this.personalInfo.id
      const data = buildProfileUpdatePayload(this.personalInfo)
      User.changePersonalInfo(userId, data).then(
        () => {
          this.cur2savePersonalInfo()
          this.$bus.emit('message', { title: '资料已更新', content: '', time: 1500 })
        },
        () => {
          this.save2curPersonalInfo()
          this.$bus.emit('message', { title: '更新失败', content: '请稍后再试', time: 1500 })
        }
      )
    },
    cancelChangePersonalInfo() {
      this.isEditing = false
      this.save2curPersonalInfo()
    },
    cur2savePersonalInfo() {
      this.savePersonalInfo = JSON.parse(JSON.stringify(this.personalInfo))
    },
    save2curPersonalInfo() {
      this.personalInfo = { ...this.personalInfo, ...this.savePersonalInfo }
    },
    addUrl() {
      const u = this.urlAdding.trim()
      if (!u) return
      this.personalInfo.urls.push(u.startsWith('http') ? u : 'https://' + u)
      this.urlAdding = ''
    },
    searchAgain(h) {
      this.$router.push({
        path: '/search_result',
        query: { search: h.keyword, search_type: 1, per_page: '10', page: '1' }
      })
    },

    /* ── 头像上传：恢复原 PersonalHomepageView 的能力 ─────────── */
    triggerAvatarUpload() {
      const input = this.$refs.avatarInput
      if (input) input.click()
    },
    handleAvatarFile(e) {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      this.avatarFile = file
      this.avatarChanged = true
      this.personalInfo.avatarUrl = URL.createObjectURL(file)
      this.avatarLoaded = true
      const userId = this.personalInfo.id
      const formData = new FormData()
      formData.append('avatar', file)
      User.changePersonalInfo(userId, formData).then(
        () => { this.$bus.emit('message', { title: '头像已更新', content: '', time: 1500 }) },
        () => { this.$bus.emit('message', { title: '头像上传失败', content: '请稍后再试', time: 1500 }) }
      )
    },

    /* ── 收藏夹 CRUD：来自原 FavouriteList 的两个事件回调 ────── */
    cancelCreation() {
      this.isCreating = false
    },
    updateCreation(name) {
      this.isCreating = false
      const normalizedName = normalizeFavoriteName(name)
      if (!normalizedName) {
        this.$bus.emit('message', { title: '收藏夹名称不能为空', content: '', time: 1500 })
        return
      }
      const optimisticId = 'F-pending-' + Date.now()
      const optimisticFavorite = {
        id: optimisticId,
        name: normalizedName,
        paper_ids: [],
        showContextMenu: false,
        pending: true
      }
      this.favouritesInfo.unshift(optimisticFavorite)
      User.createFavorite(0, buildFavoriteCreatePayload(normalizedName)).then(
        (res) => {
          const index = this.favouritesInfo.findIndex((item) => item.id === optimisticId)
          const created = extractCreatedFavorite(res, normalizedName, optimisticId)
          if (index !== -1) this.favouritesInfo.splice(index, 1, created)
          this.$bus.emit('message', { title: '收藏夹已创建', content: created.name, time: 1500 })
        },
        () => {
          this.favouritesInfo = this.favouritesInfo.filter((item) => item.id !== optimisticId)
          this.$bus.emit('message', { title: '创建收藏夹失败', content: '请稍后再试', time: 1500 })
        }
      )
    }
  }
}
</script>

<style scoped>
.ps-me {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-me__hero { margin-bottom: var(--ps-space-7); }

.ps-me__hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 320px);
  gap: var(--ps-space-7);
  align-items: center;
}

.ps-me__hero-main {
  display: flex;
  align-items: center;
  gap: var(--ps-space-5);
}

.ps-me__avatar-wrap {
  position: relative;
  width: 128px;
  height: 128px;
  border-radius: 50%;
  cursor: pointer;
  overflow: hidden;
  border: 3px solid rgba(212, 175, 55, 0.55);
  box-shadow: var(--ps-shadow-gold);
  flex: none;
}

.ps-me__avatar-wrap :deep(.ps-avatar),
.ps-me__avatar-img {
  width: 100% !important;
  height: 100% !important;
  display: block;
  object-fit: cover;
  border: 0 !important;
}

.ps-me__avatar-wrap :deep(.ps-avatar__initials) { font-size: 38px !important; }

.ps-me__avatar {
  border: 3px solid rgba(212, 175, 55, 0.55);
  box-shadow: var(--ps-shadow-gold);
}

.ps-me__avatar-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(11, 11, 31, 0.55);
  color: #FFFFFF;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transition: opacity var(--ps-motion-fast) var(--ps-ease-out);
  letter-spacing: 0.06em;
}

.ps-me__avatar-wrap:hover .ps-me__avatar-overlay { opacity: 1; }

.ps-me__file-input { display: none; }

.ps-me__fav-wrap { padding: var(--ps-space-4) !important; }

.ps-me__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ps-hero-eyebrow);
  font-weight: 700;
  margin-bottom: var(--ps-space-2);
}

.ps-me__name {
  font-family: var(--ps-font-display);
  font-size: clamp(28px, 3.6vw, 38px);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
  line-height: 1.1;
}

.ps-me__name-input {
  background: var(--ps-hero-action-bg);
  border: 1px solid var(--ps-hero-action-border);
  color: var(--ps-hero-text-strong);
  font-size: var(--ps-fs-2xl);
}

.ps-me__realname {
  font-size: var(--ps-fs-md);
  color: var(--ps-hero-text-muted);
  margin-top: 4px;
}

.ps-me__realname-input {
  background: var(--ps-hero-action-bg);
  border: 1px solid var(--ps-hero-action-border);
  color: var(--ps-hero-text-strong);
}

.ps-me__bio {
  font-size: var(--ps-fs-sm);
  color: var(--ps-hero-text-faint);
  margin-top: var(--ps-space-2);
  max-width: 540px;
}

.ps-me__hero-stats {
  background: var(--ps-hero-surface);
  border: 1px solid var(--ps-hero-surface-border);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-5);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: var(--ps-space-3);
  align-items: center;
  backdrop-filter: blur(10px);
}

.ps-me__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.ps-me__stat-num {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-2xl);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
}

.ps-me__stat-label {
  font-size: 11px;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--ps-hero-eyebrow);
}

.ps-me__hero-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  margin-top: var(--ps-space-3);
  padding-top: var(--ps-space-3);
  border-top: 1px solid var(--ps-hero-divider);
  flex-wrap: wrap;
}

.ps-me__action-primary,
.ps-me__action-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  border-radius: var(--ps-radius-pill);
  cursor: pointer;
}

.ps-me__action-primary {
  background: var(--ps-color-accent);
  color: #1B1147;
}
.ps-me__action-primary:hover { background: var(--ps-color-accent-strong); }

.ps-me__action-secondary {
  background: var(--ps-hero-action-bg);
  color: var(--ps-hero-text-strong);
  border: 1px solid var(--ps-hero-action-border);
}
.ps-me__action-secondary:hover { background: var(--ps-hero-action-bg-hover); }

/* ── Layout ──────────────────────────────────────── */
.ps-me__layout {
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  gap: var(--ps-space-6);
  align-items: flex-start;
}

.ps-me__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-4));
}

.ps-me__info {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
}

.ps-me__info div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: var(--ps-space-2) 0;
  border-bottom: 1px dashed var(--ps-border-1);
}
.ps-me__info div:last-child { border: 0; }

.ps-me__info dt {
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ps-text-3);
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ps-me__info dd { color: var(--ps-text-1); font-size: var(--ps-fs-sm); font-weight: 500; }

.ps-me__inline-input {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
}

.ps-me__inline-select {
  height: 32px;
  padding: 0 10px;
  font-size: 13px;
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-md);
  background: var(--ps-bg-elevated);
  color: var(--ps-text-1);
  font-family: inherit;
}

.ps-me__link-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--ps-radius-sm);
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
  cursor: pointer;
}

.ps-me__links {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
}

.ps-me__links li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--ps-text-2);
}

.ps-me__links a {
  color: var(--ps-color-primary);
  word-break: break-all;
}

.ps-me__link-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--ps-bg-sunken);
  color: var(--ps-text-2);
  cursor: pointer;
}

.ps-me__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* ── Main panels ───────────────────────────────── */
.ps-me__main { min-width: 0; }

.ps-me__tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-pill);
  margin-bottom: var(--ps-space-5);
  width: fit-content;
}

.ps-me__tab {
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

.ps-me__tab:hover { color: var(--ps-text-1); }
.ps-me__tab--active { background: var(--ps-color-primary); color: var(--ps-text-inverse); }

.ps-me__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--ps-space-4);
}

.ps-me__panel-hint {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
}

.ps-me__new-fav {
  height: 36px;
  gap: 6px;
  font-size: var(--ps-fs-sm);
}

.ps-me__fav-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--ps-space-4);
}

.ps-me__fav-card {
  position: relative;
  padding-top: var(--ps-space-7) !important;
}

.ps-me__fav-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--ps-fav-color, var(--ps-color-primary));
  border-radius: var(--ps-radius-lg) var(--ps-radius-lg) 0 0;
}

.ps-me__fav-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--ps-radius-md);
  background: var(--ps-color-primary-soft);
  color: var(--ps-fav-color, var(--ps-color-primary));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--ps-space-3);
}

.ps-me__fav-name {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-lg);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: 4px;
}

.ps-me__fav-desc {
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  line-height: 1.5;
  margin-bottom: var(--ps-space-3);
}

.ps-me__fav-meta {
  display: flex;
  gap: var(--ps-space-3);
  font-size: 11px;
  color: var(--ps-text-3);
}

.ps-me__fav-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.ps-me__follow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--ps-space-3);
}

.ps-me__follow-row {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
}

.ps-me__follow-row > div { flex: 1; min-width: 0; }

.ps-me__follow-row h4 {
  font-size: var(--ps-fs-base);
  font-weight: 600;
  color: var(--ps-text-1);
}

.ps-me__follow-row p {
  font-size: 12px;
  color: var(--ps-text-3);
}

.ps-me__follow-time {
  font-size: 11px;
  color: var(--ps-text-3);
  font-family: var(--ps-font-mono);
}

.ps-me__history {
  display: flex;
  flex-direction: column;
}

.ps-me__history li {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  padding: var(--ps-space-3) var(--ps-space-2);
  border-bottom: 1px dashed var(--ps-border-1);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out);
  font-size: var(--ps-fs-sm);
}

.ps-me__history li:last-child { border: 0; }
.ps-me__history li:hover { background: var(--ps-color-primary-soft); }

.ps-me__history-keyword {
  flex: 1;
  min-width: 0;
  color: var(--ps-text-1);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-me__history-meta {
  font-family: var(--ps-font-mono);
  font-size: 11px;
  color: var(--ps-text-3);
}

@media screen and (max-width: 1024px) {
  .ps-me__layout {
    grid-template-columns: 1fr;
  }
  .ps-me__sidebar { position: static; }
}

@media screen and (max-width: 720px) {
  .ps-me { padding: var(--ps-space-4); }
  .ps-me__hero-grid {
    grid-template-columns: 1fr;
  }
  .ps-me__hero-main {
    flex-direction: column;
    text-align: center;
  }
  .ps-me__follow-grid { grid-template-columns: 1fr; }
}
</style>
