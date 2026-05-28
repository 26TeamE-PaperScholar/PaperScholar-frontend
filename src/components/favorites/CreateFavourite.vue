<template>
    <form class="favorites-main-part" @submit.prevent="updateCreation">
      <button class="cross" type="button" :aria-label="$t('cancel_text')" @click="cancelCreation">
        <AppIcon name="Close" :size="16" />
      </button>
      <span class="favorite-create__icon" aria-hidden="true">
        <AppIcon name="Add" :size="34" />
      </span>
      <div class="creation-block">
        <input
          :placeholder="$t('favourites_name')"
          type="text"
          ref="nameInput"
          v-model="name"
          class="name-input"
          :disabled="submitting"
          @keydown.esc="cancelCreation"
        >
        <button class="complete-creation" type="submit" :disabled="submitting" :aria-label="$t('personal_save')">
          <AppIcon name="Checkmark" :size="18" />
        </button>
      </div>
    </form>
</template>

<script>
import { AppIcon } from '../ui'


export default {
  name: 'CreateFavourite',
  components: { AppIcon },
  props: {
    submitting: {
      type: Boolean,
      default: false
    }
  },
  emits: {
    deleteFavourites: null,
    cancelCreation: null,
    updateCreation: null,
    moveFavourites: null,
    IWantToShow: null
  },
  data() {
    return {
      name: '',
    }
  },
  methods: {
    cancelCreation() {
      this.name = ''
      this.$emit('cancelCreation')
      // this.$refs.container.style.cursor = 'pointer'
    },
    updateCreation() {
      if (this.submitting) return
      this.$emit('updateCreation', this.name)
      this.name = ''
      // 调用接口
    },
  },
  mounted() {
    this.$refs.nameInput.focus()
  }
}

</script>

<style scoped>
    .favorites-main-part {
        position: relative;
        display: grid;
        grid-template-rows: auto auto;
        align-content: center;
        justify-items: center;
        gap: var(--ps-space-3);
        width: 100%;
        min-width: 0;
        min-height: var(--favorite-card-height, 168px);
        padding: var(--ps-space-4);
        border: 1px dashed var(--ps-color-primary);
        border-radius: 8px;
        background: var(--ps-color-primary-soft);
        color: var(--ps-color-primary);
        text-align: center;
        box-shadow: var(--ps-shadow-1);
        overflow: hidden;
    }

    .favorite-create__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 52px;
      height: 52px;
      border-radius: 8px;
      background: var(--ps-bg-elevated);
      color: var(--ps-color-primary);
    }

.cross {
  position: absolute;
  top: var(--ps-space-2);
  right: var(--ps-space-2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--ps-bg-elevated);
  color: var(--ps-text-2);
  cursor: pointer;
}

.complete-creation {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  cursor: pointer;
}

.name-input {
  width: 100%;
  min-width: 0;
  height: 34px;
  box-sizing: border-box;
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-2);
  color: var(--ps-text-1);
  font-size: var(--ps-fs-sm);
  padding: 0 var(--ps-space-2);
  border-radius: 6px;
}

.name-input:focus {
  outline: 0;
  border-color: var(--ps-color-primary);
  box-shadow: var(--ps-shadow-focus);
}

.name-input::placeholder {
  font-size: var(--ps-fs-xs);
  font-weight: 600;
  color: var(--ps-text-3);
}

.creation-block {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  align-items: center;
  gap: var(--ps-space-2);
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

</style>
