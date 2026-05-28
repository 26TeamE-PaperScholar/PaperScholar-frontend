<template>
  <div class="ps-msg" :class="['ps-msg--' + role, isRestricted ? 'ps-msg--restricted' : '']">
    <div class="ps-msg__avatar" aria-hidden="true">
      <template v-if="role === 'assistant'">
        <AppIcon name="SparklesOutline" :size="16" />
      </template>
      <template v-else>
        <span class="ps-msg__avatar-text">{{ avatarInitial }}</span>
      </template>
    </div>

    <div class="ps-msg__body">
      <header class="ps-msg__head">
        <span class="ps-msg__role">{{ roleLabel }}</span>
        <AiGenerationBadge v-if="role === 'assistant'" />
        <span class="ps-msg__time">{{ formatTime(message.created_at) }}</span>
      </header>

      <RestrictedBanner
        v-if="role === 'assistant' && isRestricted"
        :papers="restrictedPapers"
        class="ps-msg__restricted"
      />

      <div class="ps-msg__content" v-html="renderedContent"></div>

      <section
        v-if="role === 'assistant' && evidences.length"
        class="ps-msg__evidences"
        :aria-label="$t('assistant_evidence_snippets')"
      >
        <h4 class="ps-msg__section-title">
          <AppIcon name="DocumentTextOutline" :size="13" inline />
          {{ $t('assistant_evidence_snippets') }} <span class="ps-msg__count">{{ evidences.length }}</span>
        </h4>
        <div class="ps-msg__evidence-grid">
          <EvidenceCard
            v-for="(e, i) in evidences"
            :key="e.paper_id + '-' + i"
            :evidence="e"
            :index="i"
            :paper-title="titleOf(e.paper_id)"
            :restricted="isRestricted"
            @open-paper="$emit('open-paper', $event)"
          />
        </div>
      </section>

      <SourceList
        v-if="role === 'assistant'"
        :sources="message.sources || []"
        @open-paper="$emit('open-paper', $event)"
      />
    </div>
  </div>
</template>

<script>
import { marked } from 'marked'
import AppIcon from '../ui/Icon.vue'
import AiGenerationBadge from './AiGenerationBadge.vue'
import RestrictedBanner from './RestrictedBanner.vue'
import EvidenceCard from './EvidenceCard.vue'
import SourceList from './SourceList.vue'

marked.setOptions({ breaks: true, gfm: true })

export default {
  name: 'AssistantMessage',
  components: { AppIcon, AiGenerationBadge, RestrictedBanner, EvidenceCard, SourceList },
  emits: ['open-paper'],
  props: {
    message: { type: Object, required: true },
    /** 用于把 evidence.paper_id 解析到 paper 标题（外部传入 map） */
    paperTitles: { type: Object, default: () => ({}) },
    userInitial: { type: String, default: '' }
  },
  computed: {
    role() {
      return this.message && this.message.role
    },
    roleLabel() {
      if (this.role === 'assistant') return this.$t('assistant_role_label')
      if (this.role === 'user') return this.$t('assistant_user_label')
      return this.role || ''
    },
    avatarInitial() {
      return this.userInitial || this.$t('assistant_user_label')
    },
    evidences() {
      return (this.message && this.message.evidences) || []
    },
    isRestricted() {
      return this.message && this.message.mode === 'restricted'
    },
    restrictedPapers() {
      const seen = new Set()
      const out = []
      for (const e of this.evidences) {
        if (seen.has(e.paper_id)) continue
        seen.add(e.paper_id)
        out.push({ id: e.paper_id, title: this.titleOf(e.paper_id) })
      }
      return out
    },
    renderedContent() {
      if (!this.message || !this.message.content) return ''
      try {
        return marked(this.message.content)
      } catch {
        return this.message.content
      }
    }
  },
  methods: {
    titleOf(id) {
      return this.paperTitles[id] || ''
    },
    formatTime(iso) {
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return iso
      const today = new Date()
      const sameDay = d.toDateString() === today.toDateString()
      const hh = String(d.getHours()).padStart(2, '0')
      const mm = String(d.getMinutes()).padStart(2, '0')
      if (sameDay) return `${hh}:${mm}`
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const dy = String(d.getDate()).padStart(2, '0')
      return `${mo}-${dy} ${hh}:${mm}`
    }
  }
}
</script>

<style scoped>
.ps-msg {
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  border-radius: 14px;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
}
.ps-msg--user {
  background: var(--ps-color-primary-soft);
  border-color: var(--ps-border-1);
}
.ps-msg--assistant {
  background: var(--ps-bg-elevated);
}
.ps-msg--restricted {
  border-color: var(--ps-color-warning);
  background: linear-gradient(180deg, var(--ps-color-warning-soft), transparent 100px);
}

.ps-msg__avatar {
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d1b69, #d4af37);
  color: #fff;
  font-weight: 700;
}
.ps-msg--user .ps-msg__avatar {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary-strong);
  border: 1px solid var(--ps-border-1);
}
.ps-msg__avatar-text { font-size: 14px; }

.ps-msg__body { flex: 1; min-width: 0; }

.ps-msg__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.ps-msg__role {
  font-size: 13px;
  font-weight: 700;
  color: var(--ps-text-1);
}
.ps-msg__time {
  font-size: 11px;
  color: var(--ps-text-3);
  margin-left: auto;
}

.ps-msg__restricted { margin-bottom: 10px; }

.ps-msg__content {
  font-size: 14px;
  line-height: 1.75;
  color: var(--ps-text-1);
  word-break: break-word;
}
.ps-msg__content :deep(p) { margin: 0.4em 0; }
.ps-msg__content :deep(ol),
.ps-msg__content :deep(ul) { padding-left: 1.4em; margin: 0.4em 0; }
.ps-msg__content :deep(li) { margin: 0.2em 0; }
.ps-msg__content :deep(strong) { color: var(--ps-color-primary-strong); }
.ps-msg__content :deep(code) {
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary-strong);
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.92em;
}
.ps-msg__content :deep(pre) {
  background: #1d1d27;
  color: #eaeaea;
  padding: 10px 12px;
  border-radius: 8px;
  overflow-x: auto;
}
.ps-msg__content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.ps-msg__evidences {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed var(--ps-border-1);
}
.ps-msg__section-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--ps-text-2);
  margin: 0 0 8px 0;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.ps-msg__count {
  font-size: 11px;
  padding: 1px 6px;
  background: var(--ps-color-primary-soft);
  color: var(--ps-color-primary-strong);
  border-radius: 999px;
}
.ps-msg__evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
}

@media screen and (max-width: 720px) {
  .ps-msg { padding: 12px 14px; }
  .ps-msg__evidence-grid { grid-template-columns: 1fr; }
}
</style>
