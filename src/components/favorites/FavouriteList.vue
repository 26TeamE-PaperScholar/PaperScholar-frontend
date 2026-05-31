<template>
  <!-- <button>Create</button> -->
      <!-- <CreateFav v-if=isCreating /> -->
      <!-- 
        - input
        - button: check cross
        - emit
       -->
  <div class="favourite-list" ref="container">
    <CreateFavourite
    v-if="isCreating"
    @cancelCreation="cancelCreation"
    @updateCreation="updateCreation"></CreateFavourite>
    <FavouriteListItem 
      v-for="(info, index) in favouritesInfo" :key="info.id || index"
      :favourites="favouritesInfo[index]" 
      @showFavoriteDetail="showFavoriteDetail(info)"
      @prefetchFavoriteDetail="prefetchFavoriteDetail(info)"
      @IWantToShow="letItShow(index)"
      @deleteFavourites="handleDelete(index)"
      @renameFavourites="handleRename(index, $event)"
    />
  </div>

  <!-- <PopoutModal :show="isPopout" @close="isPopout = false">
    <h3>{{ popoutInfo.name }}</h3>
    <div class="favourite-list" ref="container-1"> -->
    <!-- <FavouriteListItem 
      v-for="(info, index) in favouritesInfo" :key="index"
      :favourites="favouritesInfo[index]" 
      @showFavoriteDetail="showFavoriteDetail(index)"
      @IWantToShow="letItShow(index)"
      @deleteFavourites="handleDelete(index)"
    /> -->

  <!-- </div>
  </PopoutModal> -->
  <FavorateContentModal :favoriteId="favoriteId" :favorite="selectedFavorite" :show="favorateContentModalShouldShow" @close="favorateContentModalShouldShow = false"/>
  <FavoriteDeleteConfirmModal
    :show="deleteConfirmShouldShow"
    :favoriteName="favoriteToDelete.name"
    :paperCount="favoritePaperCount(favoriteToDelete)"
    :deleting="deletingFavoriteId === String(favoriteToDelete.id || '')"
    @close="cancelDeleteConfirm"
    @confirm="confirmDeleteFavorite"
  />
</template>

<script>
import CreateFavourite from './CreateFavourite.vue'
import FavouriteListItem from './FavouriteListItem.vue'
import FavorateContentModal from '../modals/FavorateContentModal.vue'
import FavoriteDeleteConfirmModal from '../modals/FavoriteDeleteConfirmModal.vue'
import { favoritePaperCountOf } from '../../utils/personal-page.mjs'
import { deleteFavoriteFolder, getFavoriteFolderContent, renameFavoriteFolder, resolveFavoriteFolderPaperCount } from '../../utils/favorite-store.mjs'
export default {
  name: 'FavouriteList',
  props: ['isCreating', 'favouritesInfo'],
  components: {
    FavouriteListItem,
    CreateFavourite,
    FavorateContentModal,
    FavoriteDeleteConfirmModal
  },
  emits: {
    cancelCreation: null,
    updateCreation: null,
  },
  data() {
    return {
      isPopout: false,
      popoutInfo: {
        name: '',
        id: '',
      },
      favoriteId: '',
      selectedFavorite: {},
      favorateContentModalShouldShow: false,
      favoriteToDelete: {},
      deleteConfirmShouldShow: false,
      deletingFavoriteId: '',
      checkingFavoriteId: '',
      warmCacheTimer: null,
      prefetchingFavoriteIds: new Set()
    }
  },
  watch: {
    favouritesInfo: {
      immediate: true,
      handler(items) {
        this.scheduleWarmFavoriteCache(items)
      }
    }
  },
  mounted() {
    window.addEventListener('click', this.closeAllContextMenu)
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeAllContextMenu)
    if (this.warmCacheTimer) window.clearTimeout(this.warmCacheTimer)
  },
  methods: {
    handleDelete(index) {
      this.closeAllContextMenu()
      const userId = this.$cookies.get('user_id')
      const favorite = this.favouritesInfo[index]
      const favoriteId = favorite && favorite.id
      if (!userId || !favorite || favorite.pending || this.deletingFavoriteId || this.checkingFavoriteId) return
      this.checkingFavoriteId = String(favoriteId)
      resolveFavoriteFolderPaperCount(favorite, userId).then((count) => {
        if (this.checkingFavoriteId !== String(favoriteId)) return
        if (count > 0) {
          this.favoriteToDelete = { ...favorite, paper_count: count }
          this.deleteConfirmShouldShow = true
          return
        }
        this.deleteFavoriteNow(favorite, false)
      }).finally(() => {
        if (this.checkingFavoriteId === String(favoriteId)) this.checkingFavoriteId = ''
      })
    },
    favoritePaperCount(favorite) {
      return favoritePaperCountOf(favorite)
    },
    cancelDeleteConfirm() {
      if (this.deletingFavoriteId) return
      this.deleteConfirmShouldShow = false
      this.favoriteToDelete = {}
    },
    confirmDeleteFavorite() {
      if (!this.favoriteToDelete || !this.favoriteToDelete.id) return
      this.deleteFavoriteNow(this.favoriteToDelete, true)
    },
    deleteFavoriteNow(favorite, force) {
      const userId = this.$cookies.get('user_id')
      if (!userId || !favorite || !favorite.id || this.deletingFavoriteId) return
      this.deletingFavoriteId = String(favorite.id)
      deleteFavoriteFolder(userId, favorite.id, { force }).then(
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_deleted'), content: favorite.name, time: 1500 })
          if (this.favoriteToDelete && String(this.favoriteToDelete.id) === String(favorite.id)) {
            this.deleteConfirmShouldShow = false
            this.favoriteToDelete = {}
          }
        },
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_delete_failed'), content: this.$t('common_retry_later'), time: 1500 })
        }
      ).finally(() => {
        this.deletingFavoriteId = ''
      })
    },
    handleRename(index, name) {
      const userId = this.$cookies.get('user_id')
      const favorite = this.favouritesInfo[index]
      if (!userId || !favorite || favorite.pending) return
      renameFavoriteFolder(userId, favorite.id, name).then(
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_renamed'), content: name, time: 1500 })
        },
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_rename_failed'), content: this.$t('common_retry_later'), time: 1500 })
        }
      )
    },
    letItShow(index) {
      this.favouritesInfo[index].showContextMenu = true
      for (let i = 0 ; i < this.favouritesInfo.length; i++) {
        if (i !== index) {
          this.favouritesInfo[i].showContextMenu = false
        }
      }
    },
    closeAllContextMenu() {
      for (let i = 0 ; i < this.favouritesInfo.length; i++) {
        this.favouritesInfo[i].showContextMenu = false
      }
    },
    cancelCreation() {
      this.$emit('cancelCreation')
    },
    updateCreation(name) {
      this.$emit('updateCreation', name)
    },
    scheduleWarmFavoriteCache(items) {
      if (this.warmCacheTimer) window.clearTimeout(this.warmCacheTimer)
      const list = (items || []).filter((favorite) => favorite && favorite.id && !favorite.pending).slice(0, 4)
      if (!list.length) return
      const run = () => list.forEach((favorite) => this.prefetchFavoriteDetail(favorite))
      this.warmCacheTimer = window.setTimeout(run, 300)
    },
    prefetchFavoriteDetail(favorite) {
      const userId = this.$cookies.get('user_id') || 'current'
      if (!favorite || !favorite.id) return
      const id = String(favorite.id)
      if (this.prefetchingFavoriteIds.has(id)) return
      this.prefetchingFavoriteIds.add(id)
      getFavoriteFolderContent(userId, favorite).then(() => {}, () => {})
        .finally(() => {
          this.prefetchingFavoriteIds.delete(id)
        })
    },
    showFavoriteDetail(favorite) {
      // this.popoutInfo = this.favouritesInfo[index]
      // this.isPopout = true
      this.selectedFavorite = favorite || {}
      this.favoriteId = favorite && favorite.id
      this.favorateContentModalShouldShow = true
    },
  }
}
</script>

<style scoped>
.favourite-list {
  --favorite-card-min: 180px;
  --favorite-card-height: 168px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--favorite-card-min), 1fr));
  gap: var(--ps-space-4);
  align-items: stretch;
  width: 100%;
  min-width: 0;
}

@media screen and (max-width: 720px) {
  .favourite-list {
    --favorite-card-min: 150px;
    gap: var(--ps-space-3);
  }
}

@media screen and (max-width: 420px) {
  .favourite-list {
    grid-template-columns: 1fr;
  }
}
</style>
