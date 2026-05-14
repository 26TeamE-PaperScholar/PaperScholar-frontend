<template>
  <button
    type="button"
    class="ps-compare-add"
    :class="[
      'ps-compare-add--' + size,
      stateClass,
      { 'ps-compare-add--shake': shaking }
    ]"
    :disabled="locked"
    :title="tipText"
    @click.stop="handleClick"
  >
    <AppIcon :name="iconName" :size="iconSize" inline />
    <span v-if="!iconOnly" class="ps-compare-add__label">{{ label }}</span>
  </button>
</template>

<script>
import { mapGetters } from 'vuex'
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'AddToCompareButton',
  components: { AppIcon },
  props: {
    paper: { type: Object, required: true },
    size: { type: String, default: 'sm', validator: (v) => ['xs', 'sm', 'md'].includes(v) },
    iconOnly: { type: Boolean, default: false }
  },
  data() {
    return { shaking: false }
  },
  computed: {
    ...mapGetters('compare', ['contains', 'isFull']),
    inCart() {
      return this.contains(this.paper.id)
    },
    locked() {
      return !this.inCart && this.isFull
    },
    iconSize() {
      return this.size === 'xs' ? 12 : this.size === 'md' ? 16 : 14
    },
    iconName() {
      if (this.inCart) return 'Checkmark'
      if (this.locked) return 'LockClosed'
      return 'GitCompareOutline'
    },
    label() {
      if (this.inCart) return '已加入'
      if (this.locked) return '上限 2 篇'
      return '加入对比'
    },
    tipText() {
      if (this.inCart) return '点击从对比中移除'
      if (this.locked) return '对比上限为 2 篇，请先在底部对比栏移除一项'
      return '加入横向对比'
    },
    stateClass() {
      if (this.inCart) return 'ps-compare-add--active'
      if (this.locked) return 'ps-compare-add--locked'
      return ''
    }
  },
  methods: {
    async handleClick() {
      if (this.inCart) {
        this.$store.dispatch('compare/removeFromCompare', this.paper.id)
        return
      }
      const res = await this.$store.dispatch('compare/addToCompare', this.paper)
      if (!res.ok && res.reason === 'full') {
        this.shaking = true
        setTimeout(() => { this.shaking = false }, 450)
        if (this.$bus) {
          this.$bus.emit('message', {
            title: '对比上限',
            content: '最多对比 2 篇，请先移除一项再加入。',
            time: 1800
          })
        }
      }
    }
  }
}
</script>

<style scoped>
.ps-compare-add {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--ps-border, rgba(45, 27, 105, 0.18));
  background: rgba(255, 255, 255, 0.7);
  color: var(--ps-text-2, #4a4a4a);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.ps-compare-add:hover:not(:disabled) {
  border-color: var(--ps-accent, #2d1b69);
  color: var(--ps-accent, #2d1b69);
  background: rgba(45, 27, 105, 0.05);
}
.ps-compare-add--xs { padding: 2px 8px; font-size: 11px; }
.ps-compare-add--md { padding: 6px 14px; font-size: 13px; }
.ps-compare-add--active {
  background: rgba(212, 175, 55, 0.16);
  border-color: rgba(212, 175, 55, 0.6);
  color: #8b6a13;
}
.ps-compare-add--locked {
  opacity: 0.55;
  cursor: not-allowed;
}
.ps-compare-add--shake {
  animation: ps-compare-shake 0.42s ease;
}
@keyframes ps-compare-shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-3px); }
  40%, 80% { transform: translateX(3px); }
}
.ps-compare-add__label { line-height: 1; }
</style>
