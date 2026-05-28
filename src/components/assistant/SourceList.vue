<template>
  <div v-if="sources && sources.length" class="ps-sources">
    <span class="ps-sources__label">
      <AppIcon name="LinkOutline" :size="13" inline />
      {{ $t('assistant_sources') }}
    </span>
    <ol class="ps-sources__list">
      <li v-for="(s, idx) in sources" :key="(s.paper_id || idx) + '-src'" class="ps-sources__item">
        <span class="ps-sources__num">[{{ idx + 1 }}]</span>
        <a
          v-if="s.url"
          :href="s.url"
          target="_blank"
          rel="noopener"
          class="ps-sources__title"
          :title="s.title"
        >{{ s.title }}</a>
        <button
          v-else
          type="button"
          class="ps-sources__title ps-sources__title--btn"
          @click="$emit('open-paper', s.paper_id)"
          :title="s.title"
        >{{ s.title }}</button>
        <span v-if="s.authors && s.authors.length" class="ps-sources__authors">
          — {{ s.authors.join(', ') }}{{ s.authors.length >= 3 ? authorSuffix : '' }}
        </span>
      </li>
    </ol>
  </div>
</template>

<script>
import AppIcon from '../ui/Icon.vue'

export default {
  name: 'SourceList',
  components: { AppIcon },
  emits: ['open-paper'],
  props: {
    sources: { type: Array, default: () => [] }
  },
  computed: {
    authorSuffix() {
      return this.$t('common_et_al_suffix')
    }
  }
}
</script>

<style scoped>
.ps-sources {
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--ps-bg-sunken);
  border: 1px solid var(--ps-border-1);
  border-radius: 8px;
}
.ps-sources__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ps-text-2);
  text-transform: uppercase;
  margin-bottom: 4px;
}
.ps-sources__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.ps-sources__item {
  font-size: 12px;
  line-height: 1.5;
  color: var(--ps-text-2);
}
.ps-sources__num {
  font-family: var(--ps-font-mono, ui-monospace, monospace);
  color: var(--ps-text-3);
  margin-right: 4px;
}
.ps-sources__title {
  color: var(--ps-color-primary);
  text-decoration: none;
  font-weight: 500;
}
.ps-sources__title:hover { text-decoration: underline; }
.ps-sources__title--btn {
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
}
.ps-sources__authors {
  color: var(--ps-text-3);
  font-size: 11.5px;
}
</style>
