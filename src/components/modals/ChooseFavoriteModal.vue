<template>
  <PopoutModal :show="show" @close="handleClose">
    <div class="container">
      <h3>{{ $t('choose_favorite') }} </h3>
      <FavouriteListChoosable 
        :fid="fid"
        :paperId="paperId"
        @cancelCreation="cancelCreation"
        @updateCreation="updateCreation"
        :isCreating="isCreating"
        :favouritesInfo="favouritesInfo"
      />
      <button class="favourites-creation" @click="isCreating = true">
        {{ $t('create_favourites') }}
      </button>  
    </div>
  </PopoutModal>
</template>

<script>
import PopoutModal from '../popout-modal/PopoutModal.vue'
import i18n from '../../language'
import FavouriteListChoosable from '../favorites/FavouriteListChoosable.vue'

import { User } from '../../api/users'
import { normalizeFavoriteChoices, shouldFetchOnShowChange } from '../../utils/personal-page.mjs'

export default {
  name: 'ChooseFavoriteModal',
  components: {
    PopoutModal,
    FavouriteListChoosable,
    i18n
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
      loadingFavorites: false
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
  emits: ['close'],
  methods: {
    fetchData() {
      const userId = this.$cookies.get('user_id')
      if (!userId || this.loadingFavorites) return
      this.loadingFavorites = true
      User.getFavoriteList(userId).then(
          (response) => {
            this.favouritesInfo = normalizeFavoriteChoices((response && response.data) || [])
          },
          () => {
            this.favouritesInfo = []
          }
        )
        .finally(() => {
          this.loadingFavorites = false
        })
    },
    handleClose() {
      this.$emit('close')
    },
    cancelCreation() {
      this.isCreating = false
    },
    updateCreation(name) {
      this.isCreating = false
      const userId = this.$cookies.get('user_id') || 0
      const data = { name }
      User.createFavorite(userId, data).then(
        (response) => {
          const created = (response && response.data) || {}
          this.favouritesInfo.unshift({
            id: created.id || `F-mock-${Date.now()}`,
            name: created.name || name,
            showContextMenu: false
          })
        },
        () => {}
      )
    },
    returnToMainPage() {
      this.$router.push('/'); 
    },
  }
}
</script>

<style scoped>
.container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  max-width: 700px;
  overflow: hidden;
  position: relative;
}
.container>h3 {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  min-width: 60%;
}

.container>h3,
.container>h3 * {
  font-size: 40px;
  font-weight: bold;
}

.favourites-creation {
  position: absolute;
  top: 50px;
  right: 0;
  font-size: 16px;
  background: transparent;
  color: var(--theme-color);
}

.favourites-creation:hover {
  text-decoration: underline;
}

</style>
