<template>
    <div class="favourite-list" ref="container">
      <FavouriteListItem 
        v-for="(info, index) in favouritesInfo" :key="info.id || index"
        :favourites="favouritesInfo[index]" 
        @showFavoriteDetail="showFavoriteDetail(index)"
        @IWantToShow="letItShow(index)"
        @deleteFavourites="handleDelete(index)"
        @renameFavourites="handleRename(index, $event)"
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
  import FavouriteListItem from './FavouriteListItem.vue'
  import FavoriteDeleteConfirmModal from '../modals/FavoriteDeleteConfirmModal.vue'
  import { favoritePaperCountOf } from '../../utils/personal-page.mjs'
  import { deleteFavoriteFolder, renameFavoriteFolder, resolveFavoriteFolderPaperCount } from '../../utils/favorite-store.mjs'
  export default {
    name: 'FavouriteList',
    props: ['isCreating', 'favouritesInfo'],
    components: {
      FavouriteListItem,
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
        this.popoutInfo = this.favouritesInfo[index]
        this.isPopout = true
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
  </style>
