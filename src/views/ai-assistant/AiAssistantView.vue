<template>
  <div class="ps-ai">
    <AppGradientHero variant="dark" compact class="ps-ai__hero">
      <AppBreadcrumb :items="breadcrumbs" class="ps-ai__crumbs" />
      <div class="ps-ai__hero-grid">
        <div class="ps-ai__hero-text">
          <p class="ps-ai__eyebrow">AI 论文助手</p>
          <h1 class="ps-ai__title">
            带证据片段、来源标注与受限模式提示的
            <span class="ps-ai__title-accent">学术问答</span>
          </h1>
          <p class="ps-ai__lede">
            支持基于一篇或多篇论文上下文的提问。回答会显式标注「AI 生成内容」，并附带证据片段与来源；信息不足时进入受限模式。
          </p>
        </div>
        <div class="ps-ai__hero-actions">
          <button class="ps-ai__cta-ghost" type="button" @click="openSidebar = !openSidebar">
            <AppIcon name="ListOutline" :size="14" inline />
            {{ openSidebar ? '收起会话' : '展开会话' }}
          </button>
          <button class="ps-ai__cta" type="button" @click="startNew()">
            <AppIcon name="AddOutline" :size="14" inline />
            新建会话
          </button>
        </div>
      </div>
    </AppGradientHero>

    <div class="ps-ai__layout" :class="{ 'ps-ai__layout--sidebar-open': openSidebar }">
      <!-- 侧栏：会话列表 -->
      <aside class="ps-ai__sidebar" :aria-label="'历史会话'">
        <header class="ps-ai__sidebar-head">
          <h3>
            <AppIcon name="ChatbubblesOutline" :size="14" inline />
            历史会话
          </h3>
          <button class="ps-ai__sidebar-new" type="button" @click="startNew()" aria-label="新建会话">
            <AppIcon name="AddOutline" :size="14" />
          </button>
        </header>
        <ul v-if="conversations.length" class="ps-ai__cv-list">
          <ConversationListItem
            v-for="cv in conversations"
            :key="cv.id"
            :conversation="cv"
            :active="cv.id === currentId"
            @select="openConv"
            @delete="confirmDelete"
          />
        </ul>
        <p v-else class="ps-ai__cv-empty">还没有历史会话</p>
      </aside>

      <!-- 主面板 -->
      <section class="ps-ai__panel">
        <!-- 上下文论文条 -->
        <div v-if="contextPapers.length" class="ps-ai__context">
          <span class="ps-ai__context-label">
            <AppIcon name="DocumentTextOutline" :size="13" inline />
            上下文论文
          </span>
          <PaperContextChip
            v-for="pid in contextPapers"
            :key="pid"
            :paper-id="pid"
            :paper-title="paperTitles[pid]"
            removable
            @remove="removeContextPaper"
          />
        </div>

        <!-- 会话信息行 -->
        <div v-if="currentConversation" class="ps-ai__convo-bar">
          <span class="ps-ai__convo-title" :title="currentConversation.title">
            {{ currentConversation.title }}
          </span>
          <span class="ps-ai__convo-meta">{{ messages.length }} 条消息</span>
        </div>

        <!-- 消息流 / 欢迎屏 -->
        <div ref="scroller" class="ps-ai__scroller">
          <template v-if="messages.length">
            <AssistantMessage
              v-for="m in messages"
              :key="m.id"
              :message="m"
              :paper-titles="paperTitles"
              :user-initial="userInitial"
              @open-paper="openPaper"
              class="ps-ai__msg"
            />
            <div v-if="pendingSend" class="ps-ai__pending">
              <span class="ps-ai__pending-dot"></span>
              <span class="ps-ai__pending-dot ps-ai__pending-dot--d2"></span>
              <span class="ps-ai__pending-dot ps-ai__pending-dot--d3"></span>
              <span class="ps-ai__pending-text">AI 正在基于论文上下文生成回答…</span>
            </div>
          </template>
          <template v-else>
            <div class="ps-ai__welcome">
              <div class="ps-ai__welcome-icon">
                <AppIcon name="SparklesOutline" :size="28" />
              </div>
              <h2>开始一个新的学术问答</h2>
              <p>
                你可以问方法/数据集/局限性等问题。
                <br />
                绑定具体论文上下文后，回答会附带证据片段与来源；信息不全时进入受限模式。
              </p>
              <ul class="ps-ai__feature-list" aria-label="助手能力">
                <li><AppIcon name="DocumentTextOutline" :size="14" inline /> 基于论文上下文回答，可追溯到段落/表格</li>
                <li><AppIcon name="ShieldCheckmarkOutline" :size="14" inline /> 所有回答显式标注「AI 生成内容」</li>
                <li><AppIcon name="AlertCircleOutline" :size="14" inline /> 信息不足时给出受限模式横幅</li>
              </ul>
            </div>
          </template>
        </div>

        <!-- 输入区 -->
        <ChatComposer
          v-model:value="draft"
          :pending="pendingSend"
          :suggestions="composerSuggestions"
          @send="onSend"
          @pick-suggestion="onPickSuggestion"
          class="ps-ai__composer"
        />
      </section>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import { Compare } from '../../api/compare'
import { mockChatSuggestions, restrictedSuggestionsForPaper } from '../../mock/chat'

import AssistantMessage from '../../components/assistant/AssistantMessage.vue'
import ConversationListItem from '../../components/assistant/ConversationListItem.vue'
import ChatComposer from '../../components/assistant/ChatComposer.vue'
import PaperContextChip from '../../components/assistant/PaperContextChip.vue'

import {
  AppGradientHero,
  AppBreadcrumb,
  AppIcon
} from '../../components/ui'

export default {
  name: 'AiAssistantView',
  components: {
    AppGradientHero,
    AppBreadcrumb,
    AppIcon,
    AssistantMessage,
    ConversationListItem,
    ChatComposer,
    PaperContextChip
  },
  data() {
    return {
      draft: '',
      openSidebar: true,
      paperTitles: {},
      userInitial: '我'
    }
  },
  computed: {
    ...mapGetters('assistant', [
      'conversations',
      'currentId',
      'currentConversation',
      'messages',
      'contextPapers',
      'pendingSend'
    ]),
    breadcrumbs() {
      return [
        { label: '首页', to: '/' },
        { label: 'AI 论文助手' }
      ]
    },
    composerSuggestions() {
      if (this.messages.length > 0) return []
      if (this.contextPapers.length === 1) {
        return restrictedSuggestionsForPaper(this.contextPapers[0])
      }
      return mockChatSuggestions
    },
    relevantPaperIds() {
      const set = new Set(this.contextPapers || [])
      for (const m of this.messages) {
        for (const e of m.evidences || []) set.add(e.paper_id)
        for (const s of m.sources || []) set.add(s.paper_id)
      }
      return Array.from(set).filter(Boolean)
    }
  },
  watch: {
    relevantPaperIds: {
      handler(ids) { this.refreshPaperTitles(ids) },
      immediate: false
    },
    messages: {
      handler() { this.$nextTick(this.scrollToBottom) },
      deep: false
    },
    pendingSend(v) {
      if (!v) this.$nextTick(this.scrollToBottom)
    }
  },
  async mounted() {
    await this.loadConversations()
    await this.handleQuery()
    this.refreshPaperTitles(this.relevantPaperIds)
    this.$nextTick(this.scrollToBottom)
  },
  methods: {
    ...mapActions('assistant', [
      'loadConversations',
      'openConversation',
      'sendMessage',
      'deleteConversation',
      'startDraftConversation',
      'setContextPapersLocal',
      'updateContextPapers'
    ]),
    async handleQuery() {
      const raw = this.$route.query.context_papers || ''
      const ids = String(raw).split(',').map((s) => s.trim()).filter(Boolean)
      const cvParam = this.$route.query.cv
      if (cvParam) {
        await this.openConversation(cvParam)
        if (ids.length) this.setContextPapersLocal(ids)
        return
      }
      if (ids.length) {
        this.startDraftConversation({ context_papers: ids })
      }
    },
    async openConv(id) {
      if (id === this.currentId) return
      await this.openConversation(id)
      this.$nextTick(this.scrollToBottom)
    },
    async startNew() {
      this.startDraftConversation({ context_papers: this.contextPapers || [] })
      this.draft = ''
      this.$nextTick(this.scrollToBottom)
    },
    async confirmDelete(id) {
      const target = this.conversations.find((c) => c.id === id)
      const label = target ? `「${target.title}」` : '该会话'
      if (!window.confirm(`确认删除${label}吗？此操作不可撤销。`)) return
      await this.deleteConversation(id)
    },
    async onSend(text) {
      const message = String(text || '').trim()
      if (!message) return
      this.draft = ''
      await this.sendMessage({ message, context_papers: this.contextPapers })
    },
    onPickSuggestion(s) {
      this.draft = s
    },
    async removeContextPaper(pid) {
      const next = this.contextPapers.filter((id) => id !== pid)
      if (this.currentId) {
        await this.updateContextPapers({ id: this.currentId, paperIds: next })
      } else {
        this.setContextPapersLocal(next)
      }
    },
    openPaper(id) {
      if (!id) return
      this.$router.push('/paper_detail/' + id)
    },
    async refreshPaperTitles(ids) {
      const need = (ids || []).filter((id) => id && !this.paperTitles[id])
      if (!need.length) return
      try {
        const res = await Compare.getMeta(need)
        const arr = (res && res.data) || []
        const next = { ...this.paperTitles }
        for (const item of arr) {
          if (item && item.id && item.title) next[item.id] = item.title
        }
        this.paperTitles = next
      } catch {
        // 静默失败：标题为空时 UI 退化为显示 id
      }
    },
    scrollToBottom() {
      const el = this.$refs.scroller
      if (!el) return
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
    }
  }
}
</script>

<style scoped>
.ps-ai {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - var(--ps-nav-height, 64px));
  background: var(--ps-bg-page, #f8f7fb);
}

.ps-ai__hero { flex: none; }
.ps-ai__crumbs { margin-bottom: var(--ps-space-3, 12px); }
.ps-ai__hero-grid {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: var(--ps-space-4, 16px);
}
.ps-ai__eyebrow {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--ps-hero-eyebrow);
  text-transform: uppercase;
}
.ps-ai__title {
  margin: 0;
  font-size: clamp(22px, 3vw, 30px);
  font-weight: 700;
  color: var(--ps-hero-text-strong);
  line-height: 1.25;
}
.ps-ai__title-accent {
  background: linear-gradient(90deg, #ffe4a1, #d4af37);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-left: 6px;
}
.ps-ai__lede {
  margin: 8px 0 0 0;
  max-width: 720px;
  color: var(--ps-hero-text-muted);
  font-size: 13.5px;
  line-height: 1.6;
}
.ps-ai__hero-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ps-ai__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, var(--ps-color-accent, #d4af37), #b78c1f);
  color: #1a1a1a;
  border: 0;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}
.ps-ai__cta:hover { transform: translateY(-1px); }
.ps-ai__cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--ps-hero-action-bg);
  color: var(--ps-hero-text-strong);
  border: 1px solid var(--ps-hero-action-border);
  padding: 7px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 12.5px;
  cursor: pointer;
}
.ps-ai__cta-ghost:hover { background: var(--ps-hero-action-bg-hover); }

.ps-ai__layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--ps-space-5, 20px);
  max-width: var(--ps-content-max, 1200px);
  width: 100%;
  margin: 0 auto;
  padding: var(--ps-space-5, 20px) var(--ps-space-6, 24px);
  min-height: 0;
}
.ps-ai__layout--sidebar-open {
  grid-template-columns: 280px 1fr;
}

.ps-ai__sidebar {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: 14px;
  padding: 14px 10px;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 200px);
  overflow: hidden;
}
.ps-ai__layout:not(.ps-ai__layout--sidebar-open) .ps-ai__sidebar {
  display: none;
}
.ps-ai__sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 10px 8px;
  border-bottom: 1px solid var(--ps-border-1);
  margin-bottom: 8px;
}
.ps-ai__sidebar-head h3 {
  font-size: 12.5px;
  margin: 0;
  letter-spacing: 0.04em;
  font-weight: 700;
  color: var(--ps-text-2);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.ps-ai__sidebar-new {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 0;
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary-strong);
  cursor: pointer;
}
.ps-ai__sidebar-new:hover { background: var(--ps-color-primary-hover); }
.ps-ai__cv-list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.ps-ai__cv-empty {
  margin: 24px 8px;
  font-size: 12.5px;
  color: var(--ps-text-3);
  text-align: center;
}

.ps-ai__panel {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: 14px;
  padding: 14px 18px 14px 18px;
  display: flex;
  flex-direction: column;
  min-height: 480px;
  max-height: calc(100vh - 200px);
}

.ps-ai__context {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--ps-border-1);
  margin-bottom: 10px;
}
.ps-ai__context-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ps-text-2);
}

.ps-ai__convo-bar {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 8px;
  margin-bottom: 4px;
}
.ps-ai__convo-title {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--ps-text-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ps-ai__convo-meta {
  font-size: 12px;
  color: var(--ps-text-3);
  flex: none;
}

.ps-ai__scroller {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 4px 12px 4px;
  min-height: 0;
}
.ps-ai__msg { animation: ps-ai-msg-in 0.16s ease-out; }
@keyframes ps-ai-msg-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: none; }
}

.ps-ai__pending {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--ps-text-2);
  padding: 8px 12px;
  background: var(--ps-color-primary-soft);
  border: 1px solid var(--ps-border-1);
  border-radius: 10px;
  align-self: flex-start;
}
.ps-ai__pending-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ps-color-primary);
  animation: ps-ai-bounce 1.2s infinite ease-in-out;
}
.ps-ai__pending-dot--d2 { animation-delay: 0.15s; }
.ps-ai__pending-dot--d3 { animation-delay: 0.3s; }
@keyframes ps-ai-bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
.ps-ai__pending-text { margin-left: 4px; }

.ps-ai__welcome {
  margin: auto;
  text-align: center;
  max-width: 480px;
  padding: 32px 20px;
}
.ps-ai__welcome-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px auto;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ps-color-primary, #2d1b69), var(--ps-color-accent, #d4af37));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(45, 27, 105, 0.2);
}
.ps-ai__welcome h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: var(--ps-text-1);
}
.ps-ai__welcome p {
  margin: 0 0 16px 0;
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--ps-text-2);
}
.ps-ai__feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
  max-width: 360px;
  margin: 0 auto;
}
.ps-ai__feature-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--ps-text-2);
}

.ps-ai__composer {
  flex: none;
  margin-top: 10px;
}

@media screen and (max-width: 980px) {
  .ps-ai__layout {
    grid-template-columns: 1fr;
  }
  .ps-ai__sidebar {
    display: none;
    max-height: 320px;
  }
  .ps-ai__layout--sidebar-open .ps-ai__sidebar {
    display: flex;
  }
}
@media screen and (max-width: 720px) {
  .ps-ai__panel { padding: 12px; max-height: calc(100vh - 240px); }
  .ps-ai__hero-grid { grid-template-columns: 1fr; }
  .ps-ai__hero-actions { justify-content: flex-start; }
}
</style>
