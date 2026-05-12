<template>
  <div class="ps-skeleton-card">
    <Skeleton width="62%" :height="18" />
    <Skeleton width="40%" :height="12" />
    <div class="ps-skeleton-card__body">
      <Skeleton width="100%" :height="10" />
      <Skeleton width="92%" :height="10" />
      <Skeleton width="78%" :height="10" />
    </div>
    <div class="ps-skeleton-card__footer">
      <Skeleton :width="64" :height="20" :radius="10" />
      <Skeleton :width="64" :height="20" :radius="10" />
      <Skeleton :width="80" :height="20" :radius="10" />
    </div>
  </div>
</template>

<script>
import Skeleton from './Skeleton.vue'

export default {
  name: 'AppSkeletonCard',
  components: { Skeleton }
}
</script>

<style scoped>
.ps-skeleton-card {
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-lg);
  padding: var(--ps-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-3);
}

.ps-skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
  margin-top: var(--ps-space-3);
}

.ps-skeleton-card__footer {
  display: flex;
  gap: var(--ps-space-2);
  margin-top: var(--ps-space-3);
}
</style>
