<template>
  <li
    class="ps-cv-item"
    :class="{ 'ps-cv-item--active': active }"
    tabindex="0"
    @click="$emit('select', conversation.id)"
    @keydown.enter.prevent="$emit('select', conversation.id)"
  >
    <div class="ps-cv-item__main">
      <h4 class="ps-cv-item__title" :title="conversation.title">{{ conversation.title }}</h4>
      <p class="ps-cv-item__meta">
        <span v-if="conversation.context_papers && conversation.context_papers.length" class="ps-cv-item__papers">
          <AppIcon name="DocumentTextOutline" :size="11" inline />
          {{ conversation.context_papers.length }} 篇上下文
        </span>
        <span v-if="formatted" class="ps-cv-item__time">{{ formatted }}</span>
      </p>
    </div>

    <button
      class="ps-cv-item__del"
      type="button"
      aria-label="删除会话"
      :title="'删除'"
      @click.stop="$emit('delete', conversation.id)"
    >
      <AppIcon name="TrashOutline" :size="13" />
    </button>
  </li>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'ConversationListItem',
  components: { AppIcon },
  emits: ['select', 'delete'],
  props: {
    conversation: { type: Object, required: true },
    active: { type: Boolean, default: false }
  },
  computed: {
    formatted() {
      const iso = this.conversation.last_message_at || this.conversation.created_at
      if (!iso) return ''
      const d = new Date(iso)
      if (Number.isNaN(d.getTime())) return iso
      const now = new Date()
      const diff = (now - d) / 1000
      if (diff < 60) return '刚刚'
      if (diff < 3600) return Math.floor(diff / 60) + ' 分钟前'
      if (diff < 86400) return Math.floor(diff / 3600) + ' 小时前'
      const mo = String(d.getMonth() + 1).padStart(2, '0')
      const dy = String(d.getDate()).padStart(2, '0')
      return `${mo}-${dy}`
    }
  }
}
</script>

<style scoped>
.ps-cv-item {
  list-style: none;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  border: 1px solid transparent;
  background: transparent;
  transition: background 120ms ease, border-color 120ms ease;
}
.ps-cv-item:hover {
  background: var(--ps-color-primary-soft);
}
.ps-cv-item--active {
  background: var(--ps-color-primary-hover);
  border-color: var(--ps-border-1);
}
.ps-cv-item:focus-visible {
  outline: 2px solid var(--ps-color-primary);
  outline-offset: 2px;
}

.ps-cv-item__main { flex: 1; min-width: 0; }
.ps-cv-item__title {
  margin: 0 0 4px 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ps-text-1);
  line-height: 1.35;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ps-cv-item__meta {
  margin: 0;
  font-size: 11px;
  color: var(--ps-text-3);
  display: flex;
  gap: 8px;
  align-items: center;
}
.ps-cv-item__papers {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  color: var(--ps-color-primary);
}
.ps-cv-item__del {
  background: transparent;
  border: 0;
  padding: 4px;
  border-radius: 6px;
  color: var(--ps-text-3);
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms ease, background 120ms ease;
}
.ps-cv-item:hover .ps-cv-item__del,
.ps-cv-item:focus-within .ps-cv-item__del {
  opacity: 1;
}
.ps-cv-item__del:hover {
  background: var(--ps-color-danger-soft);
  color: var(--ps-color-danger);
}
</style>
