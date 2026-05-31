<template>
  <div class="favourite-list" :class="{ 'favourite-list--loading': loadingFavorites }" ref="container">
    <CreateFavourite
      v-if="isCreating"
      @cancelCreation="cancelCreation"
      @updateCreation="updateCreation"
    >
    </CreateFavourite>
    <FavouriteListItemChoosable 
      v-for="(info, index) in favouritesInfo" :key="info.id || index"
      :favourites="favouritesInfo[index]" 
      :paperId="paperId"
      :paper="paper"
      :busy="choosingFavoriteId === String(info.id)"
      @IWantToShow="letItShow(index)"
      @deleteFavourites="handleDelete(index)"
      @renameFavourites="handleRename(index, $event)"
      @choose="moveToList(index)"
    />
  </div>
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
import FavouriteListItemChoosable from './FavouriteListItemChoosable.vue'
import FavoriteDeleteConfirmModal from '../modals/FavoriteDeleteConfirmModal.vue'
import { favoritePaperCountOf, normalizeFavoriteId, paperIdOf } from '../../utils/personal-page.mjs'
import {
  deleteFavoriteFolder,
  movePaperToFavorite,
  isFavoriteAlreadyCollectedError,
  renameFavoriteFolder,
  resolveFavoriteFolderPaperCount
} from '../../utils/favorite-store.mjs'
// import FavorateContentModal from '../modals/FavorateContentModal.vue'
export default {
  name: 'FavoriteListChoosable',
  props: {
    isCreating: { type: Boolean, default: false },
    favouritesInfo: { type: Array, default: () => [] },
    fid: { type: [String, Number], default: '' },
    paperId: { type: [String, Number], default: '' },
    paper: { type: Object, default: () => ({}) },
    loadingFavorites: { type: Boolean, default: false }
  },
  components: {
    FavouriteListItemChoosable,
    CreateFavourite,
    FavoriteDeleteConfirmModal,
    // FavorateContentModal
  },
  emits: {
    cancelCreation: null,
    updateCreation: null,
    chooseList: null
  },
  data() {
    return {
      isPopout: false,
      popoutInfo: {
        name: '',
        id: '',
      },
      favorateContentModalShouldShow: false,
      choosingFavoriteId: '',
      favoriteToDelete: {},
      deleteConfirmShouldShow: false,
      deletingFavoriteId: '',
      checkingFavoriteId: ''
    }
  },
  mounted() {
    window.addEventListener('click', this.closeAllContextMenu)
  },
  beforeUnmount() {
    window.removeEventListener('click', this.closeAllContextMenu)
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
    showFavoriteDetail(index) {
      this.favorateContentModalShouldShow = true
    },
    favoriteContainsPaper(favorite) {
      const paperId = paperIdOf(this.paperId)
      return Boolean(paperId && favorite && (favorite.paper_ids || []).map(String).includes(String(paperId)))
    },
    moveToList(index) {
      const userId = this.$cookies.get('user_id')
      const favorite = this.favouritesInfo[index]
      const targetId = normalizeFavoriteId(favorite && favorite.id)
      const sourceId = normalizeFavoriteId(this.fid)
      if (!userId || !favorite || favorite.pending || !this.paperId || !targetId || this.choosingFavoriteId) return
      if (this.favoriteContainsPaper(favorite) && (!sourceId || sourceId === targetId)) {
        this.$bus.emit('message', { title: this.$t('favorite_already_collected'), content: favorite.name, time: 1500 })
        return
      }
      this.choosingFavoriteId = targetId
      const paper = this.paper && Object.keys(this.paper).length ? this.paper : this.paperId
      movePaperToFavorite(userId, favorite.id, paper, this.fid).then(
        () => {
          this.$bus.emit('message', { title: this.$t('favorite_collect_success'), content: favorite.name, time: 1500 })
          this.$emit('chooseList', favorite)
        },
        (error) => {
          if (isFavoriteAlreadyCollectedError(error)) {
            this.$bus.emit('message', { title: this.$t('favorite_already_collected'), content: favorite.name, time: 1500 })
            return
          }
          this.$bus.emit('message', { title: this.$t('favorite_collect_failed'), content: this.$t('common_retry_later'), time: 1800 })
        }
      ).finally(() => {
        this.choosingFavoriteId = ''
      })
    }
  }
}
</script>

<style scoped>
.favourite-list {
  --favorite-card-min: 148px;
  --favorite-card-height: 156px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--favorite-card-min), 1fr));
  gap: var(--ps-space-4);
  align-items: stretch;
  width: 100%;
  min-width: 0;
  max-height: min(54vh, 480px);
  overflow-y: auto;
  padding: 2px;
}

.favourite-list--loading {
  opacity: 0.72;
}

@media screen and (max-width: 520px) {
  .favourite-list {
    --favorite-card-min: 132px;
    max-height: 52vh;
    gap: var(--ps-space-3);
  }
}
</style>
