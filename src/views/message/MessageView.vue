<template>
  <div class="ps-msg">
    <AppGradientHero variant="soft" compact class="ps-msg__hero">
      <div class="ps-msg__hero-content">
        <div>
          <p class="ps-msg__eyebrow">{{ $t('message_center') }}</p>
          <h1 class="ps-msg__title">{{ $t('message_all_notifications') }}</h1>
          <p class="ps-msg__lede">{{ $t('message_center_desc') }}</p>
        </div>
        <div class="ps-msg__hero-actions">
          <button class="basic-btn-outline" @click="markAllRead">
            <AppIcon name="Notifications" :size="14" />
            {{ $t('message_mark_all_read') }}
          </button>
          <button class="basic-btn-outline" @click="clearAllRead">
            <AppIcon name="Close" :size="14" />
            {{ $t('message_clear_read') }}
          </button>
        </div>
      </div>
    </AppGradientHero>

    <div class="ps-msg__layout">
      <aside class="ps-msg__sidebar">
        <AppCard>
          <AppSectionHeader :title="$t('message_filter')" tag="h3" />
          <ul class="ps-msg__cats">
            <li
              v-for="cat in categories"
              :key="cat.id"
              :class="{ 'ps-msg__cat--active': activeCategory === cat.id }"
              @click="activeCategory = cat.id"
            >
              <AppIcon :name="cat.icon" :size="14" />
              <span>{{ $t(cat.labelKey) }}</span>
              <span class="ps-msg__cat-count">{{ countByCategory(cat.id) }}</span>
            </li>
          </ul>
        </AppCard>

        <AppCard accent="gold">
          <AppSectionHeader :title="$t('message_tips')" tag="h3" />
          <ul class="ps-msg__hint-list">
            <li>
              <AppIcon name="Sparkles" :size="14" />
              {{ $t('message_tip_open') }}
            </li>
            <li>
              <AppIcon name="FlashOutline" :size="14" />
              {{ $t('message_tip_filter') }}
            </li>
          </ul>
        </AppCard>
      </aside>

      <section class="ps-msg__main">
        <div class="ps-msg__list-pane">
          <div class="ps-msg__list-head">
            <h3>{{ activeCategoryLabel }}</h3>
            <span class="ps-msg__list-count">{{ $t('common_count_items', { count: filteredMessages.length }) }}</span>
          </div>

          <AppEmptyState
            v-if="!filteredMessages.length"
            :title="$t('message_empty_title')"
            :description="$t('message_empty_desc')"
          />

          <ul v-else class="ps-msg__list">
            <li
              v-for="m in filteredMessages"
              :key="m.id"
              :class="{
                'ps-msg__row--unread': !m.is_read,
                'ps-msg__row--active': selectedId === m.id
              }"
              @click="selectMessage(m)"
            >
              <AppAvatar :id="m.sender.id" :name="messageSender(m)" size="sm" />
              <div class="ps-msg__row-body">
                <h4>{{ messageTitle(m) }}</h4>
                <p>{{ truncate(messageContent(m), 60) }}</p>
                <span class="ps-msg__row-meta">
                  <span>{{ messageSender(m) }}</span>
                  <span>·</span>
                  <span>{{ m.created_at }}</span>
                </span>
              </div>
              <span v-if="!m.is_read" class="ps-msg__row-dot" aria-hidden="true"></span>
            </li>
          </ul>
        </div>

        <div class="ps-msg__detail-pane">
          <transition name="ps-fade" mode="out-in">
            <AppCard v-if="selected" :key="selected.id" class="ps-msg__detail">
              <header class="ps-msg__detail-head">
                <AppAvatar :id="selected.sender.id" :name="messageSender(selected)" size="lg" />
                <div>
                  <h2>{{ messageTitle(selected) }}</h2>
                  <p>
                    <span>{{ messageSender(selected) }}</span>
                    <span>·</span>
                    <span>{{ selected.created_at }}</span>
                  </p>
                </div>
                <AppTagChip :variant="categoryVariant(selected.category)" size="md">
                  {{ categoryLabel(selected.category) }}
                </AppTagChip>
              </header>
              <p class="ps-msg__detail-body">{{ messageContent(selected) }}</p>
              <footer class="ps-msg__detail-foot">
                <button class="basic-btn-outline" @click="deleteMessage">
                  <AppIcon name="Close" :size="14" />
                  {{ $t('message_delete') }}
                </button>
                <button v-if="selected.category === 'private'" class="basic-btn">
                  <AppIcon name="Send" :size="14" />
                  {{ $t('message_reply') }}
                </button>
              </footer>
            </AppCard>
            <AppEmptyState
              v-else
              key="empty"
              :title="$t('message_select_title')"
              :description="$t('message_select_desc')"
            />
          </transition>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { Messages } from '../../api/messages.js'
import { AppCard, AppIcon, AppTagChip, AppSectionHeader, AppGradientHero, AppAvatar, AppEmptyState } from '../../components/ui'

const CATEGORIES = [
  { id: 'all', labelKey: 'message_category_all', icon: 'Layers' },
  { id: 'system', labelKey: 'message_category_system', icon: 'Notifications' },
  { id: 'follow', labelKey: 'message_category_follow', icon: 'People' },
  { id: 'audit', labelKey: 'message_category_audit', icon: 'RibbonOutline' },
  { id: 'private', labelKey: 'message_category_private', icon: 'Mail' }
]

const CATEGORY_META = {
  system: { labelKey: 'message_meta_system', variant: 'subtle' },
  follow: { labelKey: 'message_meta_follow', variant: 'gold' },
  audit: { labelKey: 'message_meta_audit', variant: 'success' },
  private: { labelKey: 'message_meta_private', variant: 'subtle' }
}

export default {
  name: 'MessageView',
  components: {
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
      categories: CATEGORIES,
      activeCategory: 'all',
      messages: [],
      selectedId: ''
    }
  },
  computed: {
    filteredMessages() {
      if (this.activeCategory === 'all') return this.messages
      return this.messages.filter((m) => m.category === this.activeCategory)
    },
    selected() {
      return this.messages.find((m) => m.id === this.selectedId) || null
    },
    activeCategoryLabel() {
      const cat = CATEGORIES.find((c) => c.id === this.activeCategory)
      return cat ? this.$t(cat.labelKey) : this.$t('message_center')
    }
  },
  mounted() {
    this.load()
  },
  methods: {
    load() {
      Messages.getAllReceivedMessages().then(
        (res) => {
          this.messages = (res && res.data) || []
          if (this.messages.length && !this.selectedId) {
            this.selectedId = this.messages[0].id
          }
        },
        () => {}
      )
    },
    selectMessage(m) {
      this.selectedId = m.id
      if (!m.is_read) {
        m.is_read = true
        Messages.setMessageReadById(m.id, { is_read: true })
      }
    },
    countByCategory(id) {
      if (id === 'all') return this.messages.filter((m) => !m.is_read).length
      return this.messages.filter((m) => m.category === id && !m.is_read).length
    },
    markAllRead() {
      Messages.setAllMessageRead().then(() => {
        this.messages.forEach((m) => (m.is_read = true))
        this.$bus.emit('message', { title: this.$t('message_marked_all_read'), content: '', time: 1200 })
      })
    },
    clearAllRead() {
      Messages.deleteAllReadMessages().then(() => {
        this.messages = this.messages.filter((m) => !m.is_read)
        this.$bus.emit('message', { title: this.$t('message_cleared_read'), content: '', time: 1200 })
      })
    },
    deleteMessage() {
      if (!this.selected) return
      const id = this.selected.id
      Messages.deleteMessageById(id).then(() => {
        this.messages = this.messages.filter((m) => m.id !== id)
        this.selectedId = this.messages[0] ? this.messages[0].id : ''
        this.$bus.emit('message', { title: this.$t('message_deleted'), content: '', time: 1200 })
      })
    },
    truncate(text, n) {
      if (!text) return ''
      return text.length > n ? text.slice(0, n) + '…' : text
    },
    messageTitle(message) {
      return message && message.title_key ? this.$t(message.title_key) : (message && message.title) || ''
    },
    messageContent(message) {
      return message && message.content_key ? this.$t(message.content_key) : (message && message.content) || ''
    },
    messageSender(message) {
      const sender = message && message.sender
      if (!sender) return ''
      return sender.display_name_key ? this.$t(sender.display_name_key) : sender.display_name
    },
    categoryLabel(cat) {
      return this.$t((CATEGORY_META[cat] || { labelKey: 'common_notification' }).labelKey)
    },
    categoryVariant(cat) {
      return (CATEGORY_META[cat] || { variant: 'subtle' }).variant
    }
  }
}
</script>

<style scoped>
.ps-msg {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-5) var(--ps-space-6) var(--ps-space-10);
}

.ps-msg__hero { margin-bottom: var(--ps-space-6); }

.ps-msg__hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-space-5);
}

.ps-msg__eyebrow {
  font-size: 11px;
  letter-spacing: 0.22em;
  color: var(--ps-color-accent-strong);
  font-weight: 700;
  margin-bottom: var(--ps-space-2);
}

.ps-msg__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-3xl);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: 4px;
}

.ps-msg__lede {
  color: var(--ps-text-2);
  font-size: var(--ps-fs-sm);
}

.ps-msg__hero-actions {
  display: flex;
  gap: 8px;
}

.ps-msg__hero-actions :deep(.basic-btn-outline) {
  height: 38px;
  gap: 6px;
}

/* ── Layout ──────────────────────────────────────── */
.ps-msg__layout {
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr);
  gap: var(--ps-space-5);
  align-items: flex-start;
}

.ps-msg__sidebar {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-4);
  position: sticky;
  top: calc(var(--ps-nav-height) + var(--ps-space-4));
}

.ps-msg__cats {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ps-msg__cats li {
  display: flex;
  align-items: center;
  gap: var(--ps-space-2);
  padding: 8px 12px;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-2);
  border-radius: var(--ps-radius-md);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-msg__cats li:hover { background: var(--ps-color-primary-soft); color: var(--ps-color-primary); }

.ps-msg__cat--active {
  background: var(--ps-color-primary-soft) !important;
  color: var(--ps-color-primary) !important;
  font-weight: 700;
}

.ps-msg__cats span:first-of-type { flex: 1; }

.ps-msg__cat-count {
  font-family: var(--ps-font-mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--ps-radius-pill);
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary);
}

.ps-msg__cat--active .ps-msg__cat-count {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

.ps-msg__hint-list {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
  font-size: 12px;
  color: var(--ps-text-2);
}

.ps-msg__hint-list li {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.ps-msg__hint-list :deep(.ps-icon) { color: var(--ps-color-accent-strong); margin-top: 2px; }

/* ── Main ─────────────────────────────────────── */
.ps-msg__main {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: var(--ps-space-4);
}

.ps-msg__list-pane {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-3);
  height: calc(100vh - var(--ps-nav-height) - 220px);
  min-height: 480px;
  overflow: auto;
}

.ps-msg__list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px var(--ps-space-3);
  border-bottom: 1px solid var(--ps-border-1);
  margin-bottom: var(--ps-space-2);
}

.ps-msg__list-head h3 {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-md);
  font-weight: 700;
  color: var(--ps-text-1);
}

.ps-msg__list-count {
  font-size: 11px;
  color: var(--ps-text-3);
  font-family: var(--ps-font-mono);
}

.ps-msg__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ps-msg__list li {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: var(--ps-space-3);
  padding: var(--ps-space-3);
  border-radius: var(--ps-radius-md);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-msg__list li:hover {
  background: var(--ps-color-primary-soft);
}

.ps-msg__row--active {
  background: var(--ps-color-primary-soft) !important;
  border-left: 3px solid var(--ps-color-primary);
}

.ps-msg__row-body { flex: 1; min-width: 0; }

.ps-msg__row-body h4 {
  font-size: var(--ps-fs-sm);
  font-weight: 600;
  color: var(--ps-text-1);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-msg__row--unread .ps-msg__row-body h4 {
  font-weight: 700;
}

.ps-msg__row-body p {
  font-size: 12px;
  color: var(--ps-text-2);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.ps-msg__row-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  font-size: 11px;
  color: var(--ps-text-3);
}

.ps-msg__row-dot {
  position: absolute;
  top: 14px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ps-color-accent);
  box-shadow: 0 0 0 2px var(--ps-bg-elevated);
}

/* ── Detail pane ─────────────────────────────── */
.ps-msg__detail-pane {
  min-height: 480px;
}

.ps-msg__detail {
  height: 100%;
}

.ps-msg__detail-head {
  display: flex;
  align-items: center;
  gap: var(--ps-space-4);
  padding-bottom: var(--ps-space-4);
  border-bottom: 1px solid var(--ps-border-1);
  margin-bottom: var(--ps-space-5);
}

.ps-msg__detail-head > div { flex: 1; }

.ps-msg__detail-head h2 {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-xl);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: 2px;
}

.ps-msg__detail-head p {
  font-size: 12px;
  color: var(--ps-text-3);
  display: flex;
  align-items: center;
  gap: 6px;
}

.ps-msg__detail-body {
  font-size: var(--ps-fs-base);
  color: var(--ps-text-1);
  line-height: var(--ps-lh-relaxed);
  white-space: pre-line;
}

.ps-msg__detail-foot {
  margin-top: var(--ps-space-7);
  padding-top: var(--ps-space-4);
  border-top: 1px solid var(--ps-border-1);
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.ps-fade-enter-active, .ps-fade-leave-active {
  transition: opacity var(--ps-motion-fast) var(--ps-ease-out);
}
.ps-fade-enter-from, .ps-fade-leave-to { opacity: 0; }

@media screen and (max-width: 1024px) {
  .ps-msg__layout {
    grid-template-columns: 1fr;
  }
  .ps-msg__sidebar { position: static; }
  .ps-msg__main {
    grid-template-columns: 1fr;
  }
  .ps-msg__list-pane {
    height: 360px;
    min-height: 0;
  }
}

@media screen and (max-width: 720px) {
  .ps-msg { padding: var(--ps-space-4); }
  .ps-msg__hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
