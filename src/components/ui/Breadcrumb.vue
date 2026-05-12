<template>
  <nav class="ps-breadcrumb" aria-label="breadcrumb">
    <ol>
      <li v-for="(item, idx) in items" :key="idx">
        <router-link v-if="item.to && idx < items.length - 1" :to="item.to">{{ item.label }}</router-link>
        <a v-else-if="item.href && idx < items.length - 1" :href="item.href">{{ item.label }}</a>
        <span v-else class="ps-breadcrumb__current" :title="item.label">{{ item.label }}</span>
        <span v-if="idx < items.length - 1" class="ps-breadcrumb__sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

<script>
export default {
  name: 'AppBreadcrumb',
  props: {
    items: { type: Array, required: true }
  }
}
</script>

<style scoped>
.ps-breadcrumb ol {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
  padding: 0;
  list-style: none;
}

.ps-breadcrumb li {
  display: inline-flex;
  align-items: center;
  font-size: var(--ps-fs-sm);
  color: var(--ps-text-3);
}

.ps-breadcrumb a {
  color: var(--ps-text-2);
  font-weight: 500;
}

.ps-breadcrumb a:hover {
  color: var(--ps-text-link);
  text-decoration: underline;
}

.ps-breadcrumb__current {
  color: var(--ps-text-1);
  font-weight: 600;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ps-breadcrumb__sep {
  margin: 0 8px;
  color: var(--ps-text-3);
}
</style>
