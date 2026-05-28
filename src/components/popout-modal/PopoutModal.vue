<template>
  <teleport to="body">
    <transition name="ps-modal">
      <div v-if="show" class="ps-modal-mask" @mousedown.self="handleClose">
        <div class="ps-modal" :class="'ps-modal--' + size">
          <button class="ps-modal__close" type="button" :aria-label="$t('common_close')" @click="handleClose">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  name: 'PopoutModal',
  props: {
    show: { type: Boolean, default: false },
    size: { type: String, default: 'md' }
  },
  emits: ['close'],
  watch: {
    show(v) {
      if (typeof document === 'undefined') return
      document.body.style.overflow = v ? 'hidden' : ''
    }
  },
  beforeUnmount() {
    if (typeof document !== 'undefined') document.body.style.overflow = ''
  },
  methods: {
    handleClose() {
      this.$emit('close')
    }
  }
}
</script>

<style>
.ps-modal-mask {
  position: fixed;
  inset: 0;
  background: var(--ps-bg-overlay, rgba(11, 11, 31, 0.55));
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--ps-space-5);
}

.ps-modal {
  position: relative;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  border-radius: var(--ps-radius-xl);
  box-shadow: var(--ps-shadow-3);
  padding: var(--ps-space-6) var(--ps-space-7);
  width: min(560px, 100%);
  max-height: calc(100vh - var(--ps-space-9));
  overflow: auto;
}

.ps-modal--sm { width: min(420px, 100%); }
.ps-modal--lg { width: min(720px, 100%); }
.ps-modal--xl { width: min(960px, 100%); }

.ps-modal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: var(--ps-text-2);
  background: var(--ps-bg-sunken);
  cursor: pointer;
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    color var(--ps-motion-fast) var(--ps-ease-out);
  z-index: 10;
}

.ps-modal__close:hover {
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

/* ── Transition ─────────────────────────────────── */
.ps-modal-enter-active,
.ps-modal-leave-active {
  transition: opacity var(--ps-motion-base) var(--ps-ease-out);
}

.ps-modal-enter-active .ps-modal,
.ps-modal-leave-active .ps-modal {
  transition: opacity var(--ps-motion-base) var(--ps-ease-out),
    transform var(--ps-motion-base) var(--ps-ease-out);
}

.ps-modal-enter-from,
.ps-modal-leave-to { opacity: 0; }

.ps-modal-enter-from .ps-modal,
.ps-modal-leave-to .ps-modal {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

@media screen and (max-width: 720px) {
  .ps-modal { padding: var(--ps-space-5); }
}
</style>
