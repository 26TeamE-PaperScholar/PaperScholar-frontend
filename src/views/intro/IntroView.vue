<template>
  <div class="ps-intro">
    <AppGradientHero variant="soft" class="ps-intro__hero">
      <div class="ps-intro__hero-copy">
        <p class="ps-intro__eyebrow">PAPERSCHOLAR</p>
        <h1 class="ps-intro__title">
          <span class="ps-intro__title-accent">{{ $t('intro_hero_title') }}</span>
        </h1>
      </div>

      <div class="ps-intro__search-shell ps-rise">
        <div class="ps-intro__search-head">
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
              {{ $t(type.labelKey) }}
            </button>
          </div>
          <div class="ps-intro__search-helper">
            <AppKbdHint size="sm">⌘K</AppKbdHint>
            <span>{{ $t('intro_quick_focus') }}</span>
          </div>
        </div>

        <div class="ps-intro__search-input">
          <div class="ps-intro__search-field">
            <AppIcon name="Search" :size="18" />
            <input
              ref="searchInput"
              v-model="searchKeyword"
              type="text"
              :placeholder="placeholderText"
              @keyup.enter="basicSearch"
              @focus="suggestOpen = true"
              @blur="onBlur"
            />
          </div>
          <button class="ps-intro__search-btn" type="button" @click="basicSearch">
            {{ $t('search_text') }}
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

        <div class="ps-intro__search-foot">
          <div class="ps-intro__hot-tags">
            <span class="ps-intro__hot-tags-label">Research themes</span>
            <div class="ps-intro__hot-tags-list">
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
      </div>

      <div class="ps-intro__trust-strip" :aria-label="$t('intro_trust_aria')">
        <span v-for="item in trustIndicators" :key="item.label" class="ps-intro__trust-mini">
          <strong>{{ item.value }}</strong>
          <span>{{ $t(item.labelKey) }}</span>
        </span>
      </div>
    </AppGradientHero>

    <section class="ps-intro__section">
      <AppSectionHeader
        eyebrow="Workflow"
        :title="$t('intro_workflow_title')"
        :subtitle="$t('intro_workflow_subtitle')"
      />
      <div class="ps-intro__feature-grid">
        <AppCard v-for="feature in features" :key="feature.titleKey" :elevation="1">
          <div class="ps-intro__feature-icon">
            <AppIcon :name="feature.icon" :size="22" />
          </div>
          <h3 class="ps-intro__feature-title">{{ $t(feature.titleKey) }}</h3>
          <p class="ps-intro__feature-desc">{{ $t(feature.descKey) }}</p>
        </AppCard>
      </div>
    </section>

    <div
      ref="assistantDock"
      class="ps-intro__assistant-dock"
      :class="{ 'ps-intro__assistant-dock--open': assistantOpen }"
    >
      <transition name="ps-assistant-pop">
        <div
          v-if="assistantOpen"
          class="ps-intro__assistant-pop"
          @keydown.esc="closeAssistant"
        >
          <div class="ps-intro__assistant-pop-head">
            <span>{{ $t('intro_assistant_title') }}</span>
            <button type="button" :aria-label="$t('intro_assistant_close_aria')" @click="closeAssistant">
              <AppIcon name="CloseOutline" :size="16" />
            </button>
          </div>
          <ChatComposer
            ref="assistantComposer"
            v-model:value="assistantDraft"
            :pending="assistantPendingSend"
            :rows="2"
            :suggestions="[]"
            :placeholder="$t('intro_assistant_placeholder')"
            class="ps-intro__assistant-composer"
            @send="submitAssistantPrompt"
          />
        </div>
      </transition>

      <button
        type="button"
        class="ps-intro__assistant-fab"
        :aria-label="assistantOpen ? $t('intro_assistant_collapse_aria') : $t('intro_assistant_open_aria')"
        @click="toggleAssistant"
      >
        <span class="ps-intro__assistant-glow" aria-hidden="true"></span>
        <span class="ps-intro__assistant-icon">
          <AppIcon name="SparklesOutline" :size="22" />
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { AppCard, AppIcon, AppTagChip, AppGradientHero, AppSectionHeader, AppKbdHint } from '../../components/ui'
import ChatComposer from '../../components/assistant/ChatComposer.vue'
import { AutoComplete } from '../../api/autocomplete.js'

const SEARCH_TYPES = [
  { value: 1, labelKey: 'search_type_paper', icon: 'Document' },
  { value: 2, labelKey: 'search_type_scholar', icon: 'Person' },
  { value: 3, labelKey: 'common_journal', icon: 'BookOutline' },
  { value: 4, labelKey: 'search_type_institution', icon: 'School' }
]

const PLACEHOLDERS = {
  1: 'intro_search_placeholder_paper',
  2: 'intro_search_placeholder_scholar',
  3: 'intro_search_placeholder_journal',
  4: 'intro_search_placeholder_institution'
}

const ENTITY_META = {
  work: { icon: 'Document', labelKey: 'intro_entity_work' },
  author: { icon: 'Person', labelKey: 'intro_entity_author' },
  institution: { icon: 'School', labelKey: 'intro_entity_institution' },
  concept: { icon: 'Sparkles', labelKey: 'intro_entity_concept' },
  source: { icon: 'BookOutline', labelKey: 'intro_entity_source' }
}

export default {
  name: 'IntroView',
  components: {
    AppCard,
    AppIcon,
    AppTagChip,
    AppGradientHero,
    AppSectionHeader,
    AppKbdHint,
    ChatComposer
  },
  data() {
    return {
      searchKeyword: '',
      searchType: 1,
      assistantDraft: '',
      assistantOpen: false,
      searchTypes: SEARCH_TYPES,
      hotTags: [
        { id: 'C1', name: 'Retrieval-Augmented Generation' },
        { id: 'C5', name: 'Graph Neural Networks' },
        { id: 'C14', name: 'Quantum Computing' },
        { id: 'C20', name: 'Causal Inference' },
        { id: 'C2', name: 'Multimodal LLM' }
      ],
      trustIndicators: [
        { value: '2.4M', labelKey: 'intro_trust_papers' },
        { value: '386K', labelKey: 'intro_trust_scholars' },
        { value: '12K+', labelKey: 'intro_trust_institutions' }
      ],
      features: [
        {
          icon: 'Search',
          titleKey: 'intro_feature_search_title',
          descKey: 'intro_feature_search_desc'
        },
        {
          icon: 'GitBranch',
          titleKey: 'intro_feature_graph_title',
          descKey: 'intro_feature_graph_desc'
        },
        {
          icon: 'Bookmark',
          titleKey: 'intro_feature_favorite_title',
          descKey: 'intro_feature_favorite_desc'
        },
        {
          icon: 'Sparkles',
          titleKey: 'intro_feature_ai_title',
          descKey: 'intro_feature_ai_desc'
        }
      ],
      suggestOpen: false,
      suggestions: []
    }
  },
  computed: {
    ...mapGetters('assistant', {
      assistantCurrentId: 'currentId',
      assistantPendingSend: 'pendingSend'
    }),
    placeholderText() {
      return this.$t(PLACEHOLDERS[this.searchType] || 'intro_search_placeholder_paper')
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
    document.addEventListener('pointerdown', this.handleAssistantPointerDown)
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleAssistantPointerDown)
  },
  methods: {
    ...mapActions('assistant', {
      assistantSendMessage: 'sendMessage'
    }),
    basicSearch() {
      const k = this.searchKeyword.trim()
      if (!k) return
      this.$router.push({
        path: '/search_result',
        query: {
          search: k,
          per_page: '10',
          page: '1',
          search_type: this.searchType
        }
      })
    },
    searchTag(tag) {
      this.searchKeyword = tag.name
      this.searchType = 1
      this.basicSearch()
    },
    toggleAssistant() {
      this.assistantOpen = !this.assistantOpen
      if (this.assistantOpen) {
        this.$nextTick(() => {
          if (this.$refs.assistantComposer && this.$refs.assistantComposer.focus) {
            this.$refs.assistantComposer.focus()
          }
        })
      }
    },
    closeAssistant() {
      this.assistantOpen = false
    },
    async submitAssistantPrompt(text) {
      const message = String(text || '').trim()
      if (!message) return
      await this.assistantSendMessage({ message })
      const target = this.assistantCurrentId
      this.assistantDraft = ''
      this.assistantOpen = false
      if (target) {
        this.$router.push({ path: '/ai_assistant', query: { cv: target } })
      } else {
        this.$router.push('/ai_assistant')
      }
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
    handleAssistantPointerDown(e) {
      if (!this.assistantOpen) return
      const root = this.$refs.assistantDock
      if (root && !root.contains(e.target)) {
        this.assistantOpen = false
      }
    },
    entityIcon(type) {
      return (ENTITY_META[type] || ENTITY_META.work).icon
    },
    entityLabel(type) {
      return this.$t((ENTITY_META[type] || ENTITY_META.work).labelKey)
    }
  }
}
</script>

<style scoped>
.ps-intro {
  max-width: var(--ps-content-max);
  margin: 0 auto;
  padding: var(--ps-space-6) var(--ps-space-6) var(--ps-space-10);
}

.ps-intro__hero {
  margin-bottom: var(--ps-space-8);
}

.ps-intro__hero-copy {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}

.ps-intro__eyebrow {
  display: inline-block;
  padding: 0 14px 10px;
  font-size: 16px;
  letter-spacing: 0.42em;
  font-weight: 800;
  color: var(--ps-color-primary);
  margin-bottom: var(--ps-space-5);
  text-transform: uppercase;
  position: relative;
  left: 0.2em;
}

.ps-intro__eyebrow::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(45, 27, 105, 0.28), transparent);
}

.ps-intro__title {
  color: var(--ps-text-1);
}

.ps-intro__title-accent {
  display: block;
  margin-top: 0;
  font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', serif;
  font-size: clamp(32px, 4.5vw, 56px);
  font-weight: 400;
  letter-spacing: -0.01em;
  color: var(--ps-text-1);
  text-wrap: balance;
  line-height: 1.08;
}

.ps-intro__search-shell {
  margin-top: var(--ps-space-7);
  margin-left: auto;
  margin-right: auto;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-xl);
  padding: var(--ps-space-4);
  box-shadow: 0 28px 48px -36px rgba(20, 23, 22, 0.20);
  max-width: 880px;
  backdrop-filter: blur(10px);
}

/* 暗色主题下该卡仍是浅玻璃：内部不用全局「浅色字」token，否则与浅色底对比不足 */
:root[data-theme='dark'] .ps-intro__search-shell {
  border-color: var(--ps-border-on-light-surface);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__type-toggle {
  border-color: var(--ps-border-on-light-surface);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__type-btn {
  color: var(--ps-text-on-light-surface-2);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__type-btn:hover {
  color: var(--ps-text-on-light-surface-1);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__type-btn--active {
  background: var(--ps-text-on-light-surface-1);
  color: var(--ps-text-inverse);
  box-shadow: 0 6px 16px -14px rgba(15, 14, 26, 0.45);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-helper {
  color: var(--ps-text-on-light-surface-3);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-input {
  border-color: var(--ps-border-on-light-surface);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-field :deep(.ps-icon) {
  color: var(--ps-text-on-light-surface-3);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-input input {
  color: var(--ps-text-on-light-surface-1);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-input:focus-within {
  border-color: var(--ps-color-primary-on-light-surface);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-input input::placeholder {
  color: var(--ps-text-on-light-surface-3);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-btn {
  background: var(--ps-color-primary-on-light-surface);
  box-shadow: 0 10px 28px -16px rgba(45, 27, 105, 0.55);
}

:root[data-theme='dark'] .ps-intro__search-shell .ps-intro__search-btn:hover {
  background: var(--ps-color-primary-strong-on-light-surface);
  box-shadow: var(--ps-shadow-violet);
}

.ps-intro__search-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-space-4);
  margin-bottom: var(--ps-space-4);
}

.ps-intro__type-toggle {
  display: flex;
  gap: var(--ps-space-1);
  padding: 4px;
  background: rgba(244, 242, 237, 0.88);
  border-radius: var(--ps-radius-pill);
  width: fit-content;
  border: 1px solid var(--ps-border-1);
}

.ps-intro__type-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
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
  background: var(--ps-bg-elevated);
  color: var(--ps-text-1);
  box-shadow: 0 6px 16px -14px rgba(20, 23, 22, 0.28);
}

.ps-intro__search-helper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--ps-text-3);
  font-size: 12px;
  white-space: nowrap;
}

.ps-intro__search-input {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  padding: 8px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid var(--ps-border-1);
  border-radius: calc(var(--ps-radius-xl) - 6px);
  transition: border-color var(--ps-motion-base) var(--ps-ease-out),
    box-shadow var(--ps-motion-base) var(--ps-ease-out);
}

.ps-intro__search-input:focus-within {
  border-color: var(--ps-color-primary);
  box-shadow: var(--ps-shadow-focus);
}

.ps-intro__search-field {
  display: flex;
  align-items: center;
  gap: var(--ps-space-3);
  min-width: 0;
  flex: 1;
  padding: 0 var(--ps-space-4);
}

.ps-intro__search-field :deep(.ps-icon) {
  color: var(--ps-text-3);
}

.ps-intro__search-input input {
  flex: 1;
  border: 0;
  outline: 0;
  font-size: var(--ps-fs-lg);
  height: 48px;
  background: transparent;
  color: var(--ps-text-1);
  min-width: 0;
}

.ps-intro__search-input input::placeholder { color: var(--ps-text-3); }

.ps-intro__search-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
  flex-shrink: 0;
  min-width: 108px;
  height: 48px;
  padding: 0 20px;
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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  flex: 1;
}

.ps-intro__hot-tags-label {
  font-size: 11px;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: var(--ps-text-muted-on-light-surface);
  text-transform: uppercase;
}

.ps-intro__hot-tags-list {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.ps-intro__hot-tags-list :deep(.ps-chip) {
  width: auto;
}

/* 研究主题芯片：outline + clickable 在 TagChip 内会把 border 收成透明，这里统一写回圆角描边（明暗主题同一套浅底 token） */
.ps-intro__hot-tags-list :deep(.ps-chip--outline) {
  color: var(--ps-color-primary-on-light-surface);
  border-color: var(--ps-color-primary-on-light-surface);
}

.ps-intro__hot-tags-list :deep(.ps-chip--outline.ps-chip--clickable) {
  border: 1px solid var(--ps-color-primary-on-light-surface);
}

.ps-intro__hot-tags-list :deep(.ps-chip--clickable:hover) {
  background: var(--ps-color-primary-hover-on-light-surface);
}

.ps-intro__search-foot {
  display: flex;
  align-items: flex-start;
  gap: var(--ps-space-5);
  margin-top: var(--ps-space-4);
}

.ps-intro__trust-strip {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
  color: var(--ps-text-3);
}

.ps-intro__trust-mini {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  font-size: 11px;
  white-space: nowrap;
  opacity: 0.82;
}

.ps-intro__trust-mini strong {
  font-size: 12px;
  font-weight: 600;
  color: var(--ps-text-2);
}

.ps-intro__trust-mini span {
  letter-spacing: 0.01em;
}

/* ── Section common ─────────────────────────────────────── */
.ps-intro__section {
  margin-top: var(--ps-space-10);
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

.ps-intro__assistant-dock {
  position: fixed;
  right: 28px;
  bottom: 28px;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.ps-intro__assistant-pop {
  width: min(420px, calc(100vw - 108px));
  padding: 14px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(212, 175, 55, 0.24);
  border-radius: 18px;
  box-shadow: 0 24px 44px -26px rgba(45, 27, 105, 0.22);
  backdrop-filter: blur(14px);
}

.ps-intro__assistant-pop-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.ps-intro__assistant-pop-head span {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ps-text-2);
}

.ps-intro__assistant-pop-head button {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  color: var(--ps-text-3);
}

.ps-intro__assistant-pop-head button:hover {
  background: rgba(45, 27, 105, 0.08);
  color: var(--ps-color-primary);
}

.ps-intro__assistant-composer :deep(.ps-composer__suggestions) {
  display: none;
}

.ps-intro__assistant-composer :deep(.ps-composer__hint) {
  display: none;
}

.ps-intro__assistant-composer :deep(.ps-composer__box) {
  border-radius: 14px;
}

.ps-intro__assistant-composer :deep(.ps-composer__input) {
  min-height: 52px;
  font-size: 13px;
}

.ps-intro__assistant-composer :deep(.ps-composer__actions) {
  justify-content: flex-end;
}

.ps-intro__assistant-fab {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(212, 175, 55, 0.28);
  border-radius: 50%;
  box-shadow: 0 20px 36px -24px rgba(45, 27, 105, 0.34);
  backdrop-filter: blur(14px);
  transition: transform var(--ps-motion-base) var(--ps-ease-out),
    box-shadow var(--ps-motion-base) var(--ps-ease-out),
    border-color var(--ps-motion-base) var(--ps-ease-out);
}

.ps-intro__assistant-fab:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 175, 55, 0.42);
  box-shadow: 0 24px 44px -24px rgba(45, 27, 105, 0.4);
}

.ps-intro__assistant-glow {
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.18), transparent 62%);
  opacity: 0.9;
  pointer-events: none;
}

.ps-intro__assistant-icon {
  position: relative;
  z-index: 1;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ps-color-primary);
  background: linear-gradient(135deg, rgba(45, 27, 105, 0.08), rgba(212, 175, 55, 0.18));
  box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.14);
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

.ps-assistant-pop-enter-active,
.ps-assistant-pop-leave-active {
  transition: opacity var(--ps-motion-fast) var(--ps-ease-out),
    transform var(--ps-motion-fast) var(--ps-ease-out);
}

.ps-assistant-pop-enter-from,
.ps-assistant-pop-leave-to {
  opacity: 0;
  transform: translateX(8px) translateY(4px);
}

/* ── Responsive ────────────────────────────────────────── */
@media screen and (max-width: 980px) {
  .ps-intro__search-head,
  .ps-intro__search-foot {
    flex-direction: column;
    align-items: stretch;
  }
  .ps-intro__search-helper {
    justify-content: flex-start;
  }
  .ps-intro__trust-strip {
    justify-content: center;
  }
}

@media screen and (max-width: 720px) {
  .ps-intro {
    padding: var(--ps-space-5) var(--ps-space-4) var(--ps-space-9);
  }
  .ps-intro__eyebrow {
    font-size: 13px;
    letter-spacing: 0.28em;
    padding-bottom: 8px;
  }
  .ps-intro__title-accent {
    font-size: 30px;
  }
  .ps-intro__search-shell { padding: var(--ps-space-3); }
  .ps-intro__type-toggle { width: 100%; overflow-x: auto; }
  .ps-intro__search-input {
    flex-direction: column;
    align-items: stretch;
  }
  .ps-intro__search-field {
    padding: 0 var(--ps-space-3);
  }
  .ps-intro__search-btn {
    width: 100%;
  }
  .ps-intro__trust-strip {
    gap: 10px 14px;
    margin-top: 12px;
  }
  .ps-intro__trust-mini {
    font-size: 10px;
  }
  .ps-intro__trust-mini strong {
    font-size: 11px;
  }
  .ps-intro__assistant-dock {
    right: 16px;
    bottom: 16px;
    gap: 10px;
  }
  .ps-intro__assistant-pop {
    position: fixed;
    right: 16px;
    bottom: 84px;
    width: calc(100vw - 32px);
    max-width: 420px;
  }
  .ps-intro__assistant-fab {
    width: 56px;
    height: 56px;
  }
  .ps-intro__assistant-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
