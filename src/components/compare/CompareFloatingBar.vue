<template>
  <transition name="ps-compare-bar">
    <div v-if="count > 0" class="ps-compare-bar" role="region" aria-label="论文对比浮动栏">
      <div class="ps-compare-bar__inner">
        <div class="ps-compare-bar__head">
          <AppIcon name="GitCompareOutline" :size="18" />
          <span class="ps-compare-bar__title">
            对比 <strong>{{ count }}</strong> / {{ maxCompare }}
          </span>
          <span v-if="count < 2" class="ps-compare-bar__hint">再选 1 篇即可发起对比</span>
        </div>

        <ul class="ps-compare-bar__chips">
          <li v-for="p in cart" :key="p.id" class="ps-compare-bar__chip">
            <span class="ps-compare-bar__chip-title" :title="p.title">{{ p.title }}</span>
            <button
              type="button"
              class="ps-compare-bar__chip-remove"
              :aria-label="'移除 ' + p.title"
              @click="remove(p.id)"
            >
              <AppIcon name="Close" :size="12" />
            </button>
          </li>
        </ul>

        <div class="ps-compare-bar__actions">
          <button class="ps-compare-bar__clear" type="button" @click="clear">
            <AppIcon name="Trash" :size="14" inline />
            清空
          </button>
          <button
            class="ps-compare-bar__go"
            type="button"
            :disabled="count < 2"
            @click="gotoCompare"
          >
            进入对比
            <AppIcon name="ChevronForward" :size="14" inline />
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'CompareFloatingBar',
  components: { AppIcon },
  computed: {
    ...mapGetters('compare', ['cart', 'count', 'maxCompare'])
  },
  methods: {
    remove(id) {
      this.$store.dispatch('compare/removeFromCompare', id)
    },
    clear() {
      this.$store.dispatch('compare/clearCompare')
    },
    gotoCompare() {
      if (this.count < 2) return
      const ids = this.cart.map((p) => p.id).join(',')
      this.$router.push({ path: '/paper_compare', query: { ids } })
    }
  }
}
</script>

<style scoped>
.ps-compare-bar {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%);
  z-index: 999;
  width: min(960px, calc(100% - 32px));
  pointer-events: none;
}
.ps-compare-bar__inner {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: saturate(140%) blur(12px);
  border: 1px solid rgba(45, 27, 105, 0.14);
  border-radius: 16px;
  box-shadow:
    0 10px 30px rgba(45, 27, 105, 0.18),
    0 2px 6px rgba(0, 0, 0, 0.06);
}
.ps-compare-bar__head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ps-text-1, #1f1f1f);
  font-size: 13px;
  white-space: nowrap;
}
.ps-compare-bar__title strong {
  color: var(--ps-accent, #2d1b69);
  font-weight: 700;
}
.ps-compare-bar__hint {
  margin-left: 4px;
  color: var(--ps-text-3, #888);
  font-size: 12px;
}
.ps-compare-bar__chips {
  flex: 1;
  list-style: none;
  display: flex;
  gap: 8px;
  padding: 0;
  margin: 0;
  overflow-x: auto;
  min-width: 0;
}
.ps-compare-bar__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px 4px 10px;
  background: rgba(45, 27, 105, 0.06);
  border-radius: 999px;
  font-size: 12px;
  max-width: 280px;
}
.ps-compare-bar__chip-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
}
.ps-compare-bar__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  color: var(--ps-text-3, #777);
}
.ps-compare-bar__chip-remove:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--ps-text-1, #1f1f1f);
}
.ps-compare-bar__actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ps-compare-bar__clear,
.ps-compare-bar__go {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.18s ease;
}
.ps-compare-bar__clear {
  border-color: rgba(0, 0, 0, 0.1);
  background: transparent;
  color: var(--ps-text-2, #555);
}
.ps-compare-bar__clear:hover {
  border-color: rgba(0, 0, 0, 0.2);
  color: var(--ps-text-1, #1f1f1f);
}
.ps-compare-bar__go {
  background: linear-gradient(135deg, #2d1b69, #4b2db8);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(45, 27, 105, 0.32);
}
.ps-compare-bar__go:hover:not(:disabled) {
  filter: brightness(1.08);
}
.ps-compare-bar__go:disabled {
  background: #bdbdbd;
  box-shadow: none;
  cursor: not-allowed;
}

.ps-compare-bar-enter-active,
.ps-compare-bar-leave-active {
  transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.28s ease;
}
.ps-compare-bar-enter-from,
.ps-compare-bar-leave-to {
  transform: translate(-50%, 120%);
  opacity: 0;
}

@media (max-width: 768px) {
  .ps-compare-bar { bottom: 12px; width: calc(100% - 16px); }
  .ps-compare-bar__inner { padding: 10px 12px; gap: 8px; flex-wrap: wrap; }
  .ps-compare-bar__chips { order: 3; flex-basis: 100%; }
  .ps-compare-bar__hint { display: none; }
}
</style>
