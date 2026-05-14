<template>
  <div class="ps-composer" :class="{ 'ps-composer--disabled': disabled }">
    <div v-if="suggestions && suggestions.length && !value" class="ps-composer__suggestions">
      <button
        v-for="(s, i) in suggestions"
        :key="i"
        type="button"
        class="ps-composer__chip"
        @click="$emit('pick-suggestion', s)"
      >{{ s }}</button>
    </div>

    <div class="ps-composer__box">
      <textarea
        ref="ta"
        class="ps-composer__input"
        :value="value"
        :placeholder="placeholder"
        :rows="rows"
        @input="onInput"
        @keydown.enter.exact.prevent="submit"
        @keydown.shift.enter.exact="onShiftEnter"
      />
      <div class="ps-composer__actions">
        <span class="ps-composer__hint">Enter 发送 · Shift+Enter 换行</span>
        <button
          class="ps-composer__send"
          type="button"
          :disabled="disabled || !canSend"
          @click="submit"
          aria-label="发送"
        >
          <span v-if="pending" class="ps-composer__spinner" aria-hidden="true"></span>
          <AppIcon v-else name="ArrowUpOutline" :size="16" />
          <span class="ps-composer__send-label">{{ pending ? '生成中…' : '发送' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'ChatComposer',
  components: { AppIcon },
  emits: ['update:value', 'send', 'pick-suggestion'],
  props: {
    value: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    pending: { type: Boolean, default: false },
    placeholder: { type: String, default: '向 AI 论文助手提问，例如：帮我对比这两篇方法的差异…' },
    rows: { type: Number, default: 3 },
    suggestions: { type: Array, default: () => [] }
  },
  computed: {
    canSend() {
      return !this.pending && (this.value || '').trim().length > 0
    }
  },
  methods: {
    onInput(e) {
      this.$emit('update:value', e.target.value)
    },
    onShiftEnter() {
      // 允许换行（textarea 默认行为）
    },
    submit() {
      if (!this.canSend) return
      this.$emit('send', this.value)
    },
    focus() {
      if (this.$refs.ta) this.$refs.ta.focus()
    }
  }
}
</script>

<style scoped>
.ps-composer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ps-composer__suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.ps-composer__chip {
  border: 1px solid rgba(45, 27, 105, 0.18);
  background: var(--ps-bg-elevated, #fff);
  color: var(--ps-color-primary-strong, #2d1b69);
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 120ms ease;
}
.ps-composer__chip:hover {
  background: var(--ps-color-primary-soft, rgba(45, 27, 105, 0.08));
}

.ps-composer__box {
  border: 1px solid var(--ps-border-1, rgba(0, 0, 0, 0.12));
  background: var(--ps-bg-elevated, #fff);
  border-radius: 12px;
  padding: 10px 12px 8px 12px;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.ps-composer__box:focus-within {
  border-color: var(--ps-color-primary, #2d1b69);
  box-shadow: 0 0 0 3px rgba(45, 27, 105, 0.08);
}

.ps-composer__input {
  width: 100%;
  background: transparent;
  resize: vertical;
  border: 0;
  outline: 0;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ps-text-1, #1f1f1f);
  min-height: 64px;
}
.ps-composer__input::placeholder { color: var(--ps-text-3, #888); }

.ps-composer__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}
.ps-composer__hint {
  font-size: 11px;
  color: var(--ps-text-3, #888);
}

.ps-composer__send {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 0;
  background: linear-gradient(135deg, var(--ps-color-primary, #2d1b69), var(--ps-color-accent, #d4af37));
  color: #fff;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  box-shadow: var(--ps-shadow-1, 0 2px 8px rgba(45, 27, 105, 0.12));
  transition: opacity 120ms ease, transform 120ms ease;
}
.ps-composer__send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ps-composer__send:not(:disabled):hover { transform: translateY(-1px); }

.ps-composer__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top-color: #fff;
  animation: ps-spin 0.7s linear infinite;
}
@keyframes ps-spin { to { transform: rotate(360deg); } }

.ps-composer--disabled { opacity: 0.6; pointer-events: none; }

@media screen and (max-width: 720px) {
  .ps-composer__hint { display: none; }
  .ps-composer__send-label { display: none; }
}
</style>
