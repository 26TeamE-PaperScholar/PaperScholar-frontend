<template>
    <article
      class="favorites-main-part"
      :class="{
        'favorites-main-part--pending': favourites.pending,
        'favorites-main-part--renaming': isRenaming
      }"
      role="button"
      tabindex="0"
      :aria-disabled="favourites.pending"
      @contextmenu.prevent="handleRightClick"
      @click="handleClick"
      @keyup.enter.self="handleClick"
    >
      <div v-if="!isRenaming" class="favorites-main-part__actions">
        <button
          class="favorites-main-part__action-btn"
          type="button"
          :title="$t('rename')"
          :aria-label="$t('rename')"
          :disabled="favourites.pending"
          @click.stop="triggerRename"
        >
          <AppIcon name="CreateOutline" :size="15" />
        </button>
        <button
          class="favorites-main-part__action-btn favorites-main-part__action-btn--danger"
          type="button"
          :title="$t('delete')"
          :aria-label="$t('delete')"
          :disabled="favourites.pending"
          @click.stop="triggerDelete"
        >
          <AppIcon name="TrashOutline" :size="15" />
        </button>
      </div>
      <span class="favorites-main-part__icon" aria-hidden="true">
        <AppIcon name="BookmarksOutline" :size="38" />
      </span>
      <div class="favorites-main-part__body" v-if="!isRenaming">
        <div ref="name" class="favorites-main-part-name">
          {{ favourites.name }}
        </div>
        <span class="favorites-main-part__meta">{{ paperCountText }}</span>
      </div>
      <form class="renaming-block" v-else @submit.prevent="updateRenaming" @click.stop>
        <input type="text" ref="nameInput" v-model="draftName" class="name-input" @keydown.esc="cancelRenaming">
        <button class="renaming-confirm" type="submit" :aria-label="$t('personal_save')">
          <AppIcon name="Checkmark" :size="18" />
        </button>
      </form>
      <span v-if="favourites.pending" class="favorites-main-part__status">{{ $t('favorite_syncing') }}</span>
    </article>
  
    <div 
        class="menu" 
        v-if="favourites.showContextMenu"
        :style="{ left: x + 'px', top: y + 'px'}"
      >
        <button class="basic-btn block-btn" @click.stop="triggerRename">{{ $t('rename') }}</button>
        <button class="basic-btn block-btn" @click.stop="triggerDelete">{{ $t('delete') }}</button>
    </div>
</template>

<script>
import { normalizeFavoriteName } from '../../utils/personal-page.mjs'
import { AppIcon } from '../ui'

export default {
  
  name: 'FavouriteListItem',
  components: { AppIcon },
  props: {
    favourites: { type: Object, default: () => ({}) }
  },
  emits: {
    deleteFavourites: null,
    cancelCreation: null,
    moveFavourites: null,
    IWantToShow: null,
    showFavoriteDetail: null,
    renameFavourites: null
  },
    data() {
      return {
        // showContextMenu: false,
        x: 0,
        y: 0,
        moveVisible: false,
        isRenaming: false,
        draftName: '',
      }
    },
    mounted() {
      // window.addEventListener('click', this.hideMenu)
      // if (this.type !== 'normal') {
      //   this.$nextTick(() => {
      //     this.$refs.deleted.style.cursor = 'default'
      //   })
      // }
      // this.$bus.on('renameFailRequest', this.handleRenameFailDisplay)
    },
    beforeUnmount() {
      // window.removeEventListener('click', this.hideMenu)
    },
    methods: {
      handleClick() {
        if (this.isRenaming || this.favourites.pending) return
        this.$emit('showFavoriteDetail')
      },
      handleRightClick(event) {
        if (this.favourites.pending) return
        // console.log("111")
        // this.showContextMenu = true
        this.$emit('IWantToShow')
        this.x = event.clientX
        this.y = event.clientY
        // console.log(this.showContextMenu)
        // console.log(this.x)
        // console.log(this.y)
      },
      hideMenu() {
        if (this.showContextMenu) this.showContextMenu = false
      },
      triggerDelete() {
        this.$emit('deleteFavourites')
      },
      triggerRename() {
        if (this.favourites.pending) return
        this.draftName = this.favourites.name
        this.isRenaming = true
        this.$nextTick(() => {
          this.$refs.nameInput.focus()
        })
      },
      updateRenaming() {
        this.isRenaming = false
        const name = normalizeFavoriteName(this.draftName)
        if (!name || name === this.favourites.name) return
        this.$emit('renameFavourites', name)
      },
      cancelRenaming() {
        this.isRenaming = false
      }
    },
    computed: {
      paperCountText() {
        return this.$t('favorite_paper_count', { count: (this.favourites.paper_ids || []).length })
      }
  }
}

</script>

<style scoped>
  .favorites-main-part,
  .favorites-main-part * {
    transition: background var(--ps-motion-fast) var(--ps-ease-out),
      color var(--ps-motion-fast) var(--ps-ease-out),
      border-color var(--ps-motion-fast) var(--ps-ease-out),
      transform var(--ps-motion-fast) var(--ps-ease-out),
      box-shadow var(--ps-motion-fast) var(--ps-ease-out);
  }
    .favorites-main-part {
        position: relative;
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: var(--ps-space-3);
        width: 100%;
        min-height: var(--favorite-card-height, 168px);
        padding: var(--ps-space-7) var(--ps-space-4) var(--ps-space-4);
        border: 1px solid var(--ps-border-1);
        border-radius: 8px;
        background: var(--ps-bg-elevated);
        color: var(--ps-text-1);
        text-align: left;
        cursor: pointer;
        box-shadow: var(--ps-shadow-1);
        overflow: hidden;
    }
    .favorites-main-part:hover{
      border-color: var(--ps-color-primary);
      background: var(--ps-color-primary-soft);
      transform: translateY(-1px);
      box-shadow: var(--ps-shadow-2);
    }

    .favorites-main-part--pending {
      cursor: wait;
      opacity: 0.72;
    }

    .favorites-main-part__actions {
      position: absolute;
      top: var(--ps-space-2);
      right: var(--ps-space-2);
      z-index: 2;
      display: inline-flex;
      gap: 6px;
    }

    .favorites-main-part__action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--ps-border-1);
      border-radius: 8px;
      background: color-mix(in srgb, var(--ps-bg-elevated) 92%, transparent);
      color: var(--ps-text-2);
      box-shadow: var(--ps-shadow-1);
    }

    .favorites-main-part__action-btn:hover:not(:disabled) {
      border-color: var(--ps-color-primary);
      background: var(--ps-bg-elevated);
      color: var(--ps-color-primary);
      transform: translateY(-1px);
    }

    .favorites-main-part__action-btn--danger:hover:not(:disabled) {
      border-color: var(--ps-color-danger);
      color: var(--ps-color-danger);
    }

    .favorites-main-part__action-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }

    .favorites-main-part__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 8px;
      color: var(--ps-color-primary);
      background: var(--ps-color-primary-soft);
    }

    .favorites-main-part__body {
      min-width: 0;
    }

    .favorites-main-part--renaming {
      grid-template-columns: 1fr;
      padding-top: var(--ps-space-4);
    }

    .favorites-main-part .favorites-main-part-name {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      color: var(--ps-text-1);
      font-size: var(--ps-fs-base);
      font-weight: 700;
      line-height: 1.35;
      overflow: hidden;
      overflow-wrap: anywhere;
      text-overflow: ellipsis;
    }

    .favorites-main-part__meta,
    .favorites-main-part__status {
      display: inline-flex;
      margin-top: 6px;
      color: var(--ps-text-3);
      font-size: var(--ps-fs-xs);
      line-height: 1.3;
    }

  .menu {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-2);
  min-width: 108px;
  padding: var(--ps-space-2);
  background: var(--ps-bg-elevated);
  border: 1px solid var(--ps-border-1);
  box-shadow: var(--ps-shadow-3);
  border-radius: 8px;
  position: fixed;
  z-index: 1200;
}

.block-btn {
  display: flex;
  width: 100%;
  height: 32px;
  padding: 0 var(--ps-space-3);
  border-radius: 6px;
  font-size: var(--ps-fs-xs);
}

.renaming-block {
  display: flex;
  width: 100%;
  min-width: 0;
  height: 38px;
  gap: var(--ps-space-2);
  align-items: center;
}

.renaming-block input {
  flex: 1;
  min-width: 0;
  height: 36px;
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

.renaming-confirm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
}

</style>
