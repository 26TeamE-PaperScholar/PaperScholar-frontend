<template>
  <span class="ps-kbd" :class="size === 'sm' ? 'ps-kbd--sm' : ''"><slot>{{ keys }}</slot></span>
</template>

<script>
export default {
  name: 'AppKbdHint',
  props: {
    keys: { type: String, default: '' },
    size: { type: String, default: 'md' }
  }
}
</script>

<style scoped>
.ps-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 6px;
  font-family: var(--ps-font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--ps-text-2);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-bottom-width: 2px;
  border-radius: var(--ps-radius-sm);
  white-space: nowrap;
  line-height: 1;
}

.ps-kbd--sm {
  min-width: 18px;
  height: 18px;
  font-size: 10px;
  padding: 0 4px;
}
</style>
