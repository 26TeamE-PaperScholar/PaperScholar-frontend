<template>
  <PopoutModal :show="show" size="lg" @close="handleClose">
    <section class="favorite-modal">
      <header class="favorite-modal__header">
        <div class="favorite-modal__title-group">
          <p class="favorite-modal__eyebrow">{{ $t('paper_collect') }}</p>
          <h3>{{ $t('choose_favorite') }}</h3>
        </div>
        <button
          class="favorite-modal__create-btn"
          type="button"
          :disabled="isCreating || creatingFavorite"
          @click="startCreation"
        >
          <AppIcon name="Add" :size="16" />
          {{ $t('create_favourites') }}
        </button>
      </header>

      <div v-if="loadingFavorites && !favouritesInfo.length" class="favorite-modal__loading">
        <span class="favorite-modal__spinner" aria-hidden="true"></span>
        {{ $t('favorite_loading') }}
      </div>

      <FavouriteListChoosable 
        :fid="fid"
        :paperId="paperId"
        :loadingFavorites="loadingFavorites"
        @cancelCreation="cancelCreation"
        @updateCreation="updateCreation"
        @chooseList="handleClose"
        :isCreating="isCreating"
        :favouritesInfo="favouritesInfo"
      />
      <div v-if="!loadingFavorites && !isCreating && !favouritesInfo.length" class="favorite-modal__empty">
        <AppIcon name="BookmarksOutline" :size="28" />
        <span>{{ $t('personal_empty_favorites_title') }}</span>
      </div>
    </section>
  </PopoutModal>
</template>

<script>
import PopoutModal from '../popout-modal/PopoutModal.vue'
import FavouriteListChoosable from '../favorites/FavouriteListChoosable.vue'
import { AppIcon } from '../ui'

import {
  normalizeFavoriteChoices,
  normalizeFavoriteName,
  shouldFetchOnShowChange
} from '../../utils/personal-page.mjs'
import {
  createFavoriteFolder,
  refreshFavoriteFolders,
  subscribeFavoriteFolders
} from '../../utils/favorite-store.mjs'

export default {
  name: 'ChooseFavoriteModal',
  components: {
    PopoutModal,
    FavouriteListChoosable,
    AppIcon
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    fid: {
      type: String,
      default: ''
    },
    paperId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      favouritesInfo: [],
      isCreating: false,
      loadingFavorites: false,
      creatingFavorite: false,
      unsubscribeFavorites: null,
      subscribedUserId: ''
    }
  },
  watch: {
    show: {
      immediate: true,
      handler(show, oldShow) {
        if (!shouldFetchOnShowChange(show, oldShow)) return
        this.fetchData()
      }
    }
  },
  beforeUnmount() {
    this.releaseFavoriteSubscription()
  },
  emits: ['close'],
  methods: {
    currentUserId() {
      return this.$cookies.get('user_id')
    },
    bindFavoriteSubscription(userId) {
      if (!userId || this.subscribedUserId === String(userId)) return
      this.releaseFavoriteSubscription()
      this.subscribedUserId = String(userId)
      this.unsubscribeFavorites = subscribeFavoriteFolders(userId, (items) => {
        this.favouritesInfo = normalizeFavoriteChoices(items)
      })
    },
    releaseFavoriteSubscription() {
      if (this.unsubscribeFavorites) this.unsubscribeFavorites()
      this.unsubscribeFavorites = null
      this.subscribedUserId = ''
    },
    fetchData() {
      const userId = this.currentUserId()
      if (!userId || this.loadingFavorites) return
      this.bindFavoriteSubscription(userId)
      this.loadingFavorites = true
      refreshFavoriteFolders(userId, { force: true }).then(
          () => {},
          () => { this.favouritesInfo = [] }
        )
        .finally(() => {
          this.loadingFavorites = false
        })
    },
    handleClose() {
      this.$emit('close')
    },
    startCreation() {
      if (this.creatingFavorite) return
      this.isCreating = true
    },
    cancelCreation() {
      this.isCreating = false
    },
    updateCreation(name) {
      const normalizedName = normalizeFavoriteName(name)
      if (!normalizedName) {
        this.$bus.emit('message', { title: this.$t('favorite_name_required'), content: '', time: 1500 })
        return
      }
      const userId = this.currentUserId()
      if (!userId || this.creatingFavorite) return
      this.isCreating = false
      this.creatingFavorite = true
      this.bindFavoriteSubscription(userId)
      createFavoriteFolder(userId, normalizedName).then(
        (created) => {
          this.$bus.emit('message', { title: this.$t('favorite_created'), content: created.name, time: 1500 })
        },
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_create_failed'), content: this.$t('common_retry_later'), time: 1500 })
        }
      ).finally(() => {
        this.creatingFavorite = false
      })
    },
    returnToMainPage() {
      this.$router.push('/'); 
    },
  }
}
</script>

<style scoped>
.favorite-modal {
  display: flex;
  flex-direction: column;
  gap: var(--ps-space-5);
  min-width: 0;
}

.favorite-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ps-space-4);
  padding-right: 44px;
}

.favorite-modal__title-group {
  min-width: 0;
}

.favorite-modal__eyebrow {
  margin-bottom: 4px;
  font-size: var(--ps-fs-xs);
  font-weight: 700;
  color: var(--ps-color-primary);
}

.favorite-modal h3 {
  font-size: var(--ps-fs-3xl);
  color: var(--ps-text-1);
}

.favorite-modal__create-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-width: max-content;
  height: 38px;
  padding: 0 var(--ps-space-4);
  border-radius: 8px;
  background: var(--ps-color-primary);
  color: var(--ps-text-inverse);
  font-size: var(--ps-fs-sm);
  font-weight: 700;
  box-shadow: var(--ps-shadow-1);
  transition: background var(--ps-motion-fast) var(--ps-ease-out),
    transform var(--ps-motion-fast) var(--ps-ease-out),
    box-shadow var(--ps-motion-fast) var(--ps-ease-out);
}

.favorite-modal__create-btn:hover:not(:disabled) {
  background: var(--ps-color-primary-strong);
  box-shadow: var(--ps-shadow-violet);
  transform: translateY(-1px);
}

.favorite-modal__create-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: var(--ps-shadow-1);
}

.favorite-modal__create-btn:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.favorite-modal__loading,
.favorite-modal__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ps-space-2);
  min-height: 96px;
  color: var(--ps-text-2);
  font-size: var(--ps-fs-sm);
}

.favorite-modal__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--ps-border-2);
  border-top-color: var(--ps-color-primary);
  border-radius: 50%;
  animation: favorite-spin 0.8s linear infinite;
}

@keyframes favorite-spin {
  to { transform: rotate(360deg); }
}

@media screen and (max-width: 640px) {
  .favorite-modal__header {
    align-items: flex-start;
    flex-direction: column;
    padding-right: 40px;
  }

  .favorite-modal__create-btn {
    width: 100%;
  }
}

</style>
