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
      if (this.inCart) return this.$t('compare_add_joined')
      if (this.locked) return this.$t('compare_add_limit')
      return this.$t('compare_add_label')
    },
    tipText() {
      if (this.inCart) return this.$t('compare_add_remove_tip')
      if (this.locked) return this.$t('compare_add_limit_tip')
      return this.$t('compare_add_tip')
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
            title: this.$t('compare_limit_title'),
            content: this.$t('compare_limit_content'),
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
  border: 1px solid var(--ps-border-1);
  background: var(--ps-bg-elevated);
  color: var(--ps-text-2);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}
.ps-compare-add:hover:not(:disabled) {
  border-color: var(--ps-color-primary);
  color: var(--ps-color-primary);
  background: var(--ps-color-primary-soft);
}
.ps-compare-add--xs { padding: 2px 8px; font-size: 11px; }
.ps-compare-add--md { padding: 6px 14px; font-size: 13px; }
.ps-compare-add--active {
  background: var(--ps-color-warning-soft);
  border-color: var(--ps-color-warning);
  color: var(--ps-color-warning-strong);
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
