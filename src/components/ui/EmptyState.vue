<template>
  <div class="ps-empty">
    <div class="ps-empty__illustration" aria-hidden="true">
      <svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ps-empty-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#2D1B69" stop-opacity="0.10" />
            <stop offset="100%" stop-color="#D4AF37" stop-opacity="0.10" />
          </linearGradient>
        </defs>
        <rect x="20" y="20" width="160" height="100" rx="14" fill="url(#ps-empty-grad)" />
        <rect x="36" y="44" width="84" height="6" rx="3" fill="#2D1B69" opacity="0.32" />
        <rect x="36" y="60" width="128" height="4" rx="2" fill="#2D1B69" opacity="0.18" />
        <rect x="36" y="72" width="96" height="4" rx="2" fill="#2D1B69" opacity="0.18" />
        <rect x="36" y="84" width="112" height="4" rx="2" fill="#2D1B69" opacity="0.18" />
        <circle cx="148" cy="46" r="9" fill="#D4AF37" opacity="0.42" />
        <circle cx="148" cy="46" r="3" fill="#D4AF37" />
      </svg>
    </div>
    <h3 v-if="title" class="ps-empty__title">{{ title }}</h3>
    <p v-if="description || $slots.description" class="ps-empty__description">
      <slot name="description">{{ description }}</slot>
    </p>
    <div v-if="$slots.actions" class="ps-empty__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppEmptyState',
  props: {
    title: { type: String, default: '' },
    description: { type: String, default: '' }
  }
}
</script>

<style scoped>
.ps-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--ps-space-9) var(--ps-space-6);
  text-align: center;
  color: var(--ps-text-2);
}

.ps-empty__illustration {
  width: 200px;
  max-width: 80%;
  margin-bottom: var(--ps-space-5);
}

.ps-empty__illustration svg {
  width: 100%;
  height: auto;
  display: block;
}

.ps-empty__title {
  font-family: var(--ps-font-display);
  font-size: var(--ps-fs-xl);
  font-weight: 700;
  color: var(--ps-text-1);
  margin-bottom: var(--ps-space-2);
}

.ps-empty__description {
  font-size: var(--ps-fs-base);
  color: var(--ps-text-2);
  max-width: 460px;
  line-height: var(--ps-lh-normal);
}

.ps-empty__actions {
  margin-top: var(--ps-space-6);
  display: flex;
  gap: var(--ps-space-3);
}
</style>
