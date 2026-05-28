<template>
  <PopoutModal :show="show" size="sm" @close="handleClose">
    <section class="favorite-delete">
      <span class="favorite-delete__icon" aria-hidden="true">
        <AppIcon name="TrashOutline" :size="28" />
      </span>
      <div class="favorite-delete__body">
        <p class="favorite-delete__eyebrow">{{ $t('delete') }}</p>
        <h3>{{ $t('favorite_delete_confirm_title') }}</h3>
        <p class="favorite-delete__name">{{ favoriteName }}</p>
        <p class="favorite-delete__desc">
          {{ $t('favorite_delete_confirm_desc', { count: paperCount }) }}
        </p>
      </div>
      <footer class="favorite-delete__actions">
        <button class="favorite-delete__cancel" type="button" :disabled="deleting" @click="handleClose">
          {{ $t('cancel_text') }}
        </button>
        <button class="favorite-delete__danger" type="button" :disabled="deleting" @click="$emit('confirm')">
          <span v-if="deleting" class="favorite-delete__spinner" aria-hidden="true"></span>
          {{ deleting ? $t('favorite_deleting') : $t('favorite_delete_confirm_action') }}
        </button>
      </footer>
    </section>
  </PopoutModal>
</template>

<script>
import PopoutModal from '../popout-modal/PopoutModal.vue'
import { AppIcon } from '../ui'

export default {
  name: 'FavoriteDeleteConfirmModal',
  components: {
    PopoutModal,
    AppIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    favoriteName: {
      type: String,
      default: ''
    },
    paperCount: {
      type: Number,
      default: 0
    },
    deleting: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'confirm'],
  methods: {
    handleClose() {
      if (this.deleting) return
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.favorite-delete {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--ps-space-4);
  align-items: flex-start;
}

.favorite-delete__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: var(--ps-color-danger-soft);
  color: var(--ps-color-danger);
}

.favorite-delete__body {
  min-width: 0;
}

.favorite-delete__eyebrow {
  margin-bottom: 4px;
  color: var(--ps-color-danger);
  font-size: var(--ps-fs-xs);
  font-weight: 700;
}

.favorite-delete h3 {
  color: var(--ps-text-1);
  font-size: var(--ps-fs-xl);
}

.favorite-delete__name {
  margin-top: var(--ps-space-2);
  color: var(--ps-text-1);
  font-size: var(--ps-fs-sm);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.favorite-delete__desc {
  margin-top: var(--ps-space-2);
  color: var(--ps-text-2);
  font-size: var(--ps-fs-sm);
  line-height: 1.6;
}

.favorite-delete__actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: var(--ps-space-3);
  margin-top: var(--ps-space-2);
}

.favorite-delete__cancel,
.favorite-delete__danger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--ps-space-2);
  height: 38px;
  padding: 0 var(--ps-space-4);
  border-radius: 8px;
  font-size: var(--ps-fs-sm);
  font-weight: 700;
}

.favorite-delete__cancel {
  border: 1px solid var(--ps-border-1);
  background: var(--ps-bg-elevated);
  color: var(--ps-text-2);
}

.favorite-delete__cancel:hover:not(:disabled) {
  background: var(--ps-bg-sunken);
  color: var(--ps-text-1);
}

.favorite-delete__danger {
  background: var(--ps-color-danger);
  color: var(--ps-text-inverse);
}

.favorite-delete__danger:hover:not(:disabled) {
  background: var(--ps-color-danger-strong);
}

.favorite-delete__cancel:disabled,
.favorite-delete__danger:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.favorite-delete__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid color-mix(in srgb, currentColor 28%, transparent);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: favorite-delete-spin 0.8s linear infinite;
}

@keyframes favorite-delete-spin {
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 520px) {
  .favorite-delete {
    grid-template-columns: 1fr;
  }

  .favorite-delete__actions {
    flex-direction: column-reverse;
  }

  .favorite-delete__cancel,
  .favorite-delete__danger {
    width: 100%;
  }
}
</style>
