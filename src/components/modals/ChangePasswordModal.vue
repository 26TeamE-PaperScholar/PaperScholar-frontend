<template>
    <PopoutModal :show="show" @close="handleClose">
        <div class="container">
        <h3>{{ $t('change_password_text') }}<span>{{ $t('change_password_prompt') }}</span></h3>
        <input
            type="password" class="basic-input" 
            :placeholder="$t('old_password')" v-model="oldPassword">
        <input 
            type="password" class="basic-input" 
            :placeholder="$t('new_password')" 
            v-model="newPassword"
        >
        <input 
            type="password" class="basic-input" 
            :placeholder="$t('confirm_password')" 
            v-model="confirmPassword"
            @keyup.enter="changePassword"
        >
        <div class="btn-box">
            <button class="basic-btn-outline" @click="handleClose()" :disabled="isSubmitting">{{ $t('cancel_text') }}</button>
            <button class="basic-btn" @click="changePassword" :disabled="isSubmitting">{{ isSubmitting ? $t('submitting_text') : $t('confirm_text') }}</button>
        </div>
        </div>
    </PopoutModal>
</template>
  
<script>
import PopoutModal from '../popout-modal/PopoutModal.vue'

import i18n from '../../language'

import VueCookies from 'vue-cookies'
import { Account } from '../../api/accounts.js'

export default {
    name: 'ChangePasswordModal',
    emits: ['close'],
    data() {
        return {
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
            isSubmitting: false
        }
    },
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    components: {
        PopoutModal,
        i18n
    },
    methods: {
        handleClose(force = false) {
            if (this.isSubmitting && force !== true) return
            this.$emit('close')
        },
        resetForm() {
            this.oldPassword = ''
            this.newPassword = ''
            this.confirmPassword = ''
        },
        getErrorMessage(error) {
            const data = error && error.response && error.response.data
            if (!data) return this.$t('change_password_retry_hint')
            if (typeof data === 'string') return data
            if (data.detail) return data.detail
            if (data.message) return data.message
            const firstKey = Object.keys(data)[0]
            const firstValue = firstKey ? data[firstKey] : ''
            if (Array.isArray(firstValue)) return firstValue.join('；')
            if (typeof firstValue === 'string') return firstValue
            return this.$t('change_password_check_hint')
        },
        changePassword() {
            if (this.isSubmitting) return
            if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
                this.$bus.emit('message', { title: this.$t('change_password_failure'), content: this.$t('change_password_required_hint'), time: 1800 })
                return
            }
            if (this.newPassword !== this.confirmPassword) {
                this.$bus.emit('message', { title: this.$t('change_password_failure'), content: this.$t('different_password'), time: 1800 })
                return
            }

            const data = {
                old_password: this.oldPassword,
                password: this.newPassword,
                password_confirm: this.confirmPassword
            }
            this.isSubmitting = true
            Account.passwordChange(data).then(
                () => {
                    this.$bus.emit('message', { title: this.$t('change_password_success'), content: this.$t('change_password_relogin_hint'), time: 1800 })
                    this.resetForm()
                    this.handleClose(true)
                    this.$store.commit('setIsLoggedIn', false)
                    VueCookies.remove('user_id')
                    this.$router.push({ path: '/auth', query: { mode: 'login' } })
                },
                error => {
                    this.$bus.emit('message', { title: this.$t('change_password_failure'), content: this.getErrorMessage(error), time: 2200 })
                }
            ).finally(() => {
                this.isSubmitting = false
            })
        }
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
}

.container>* {
min-width: 60%;
}

.container>h3 {
display: flex;
justify-content: center;
margin-bottom: 30px;
}

.container>h3,
.container>h3 * {
font-size: 35px;
font-weight: bold;
}

.container>input {
width: 70%;
height: 60px;
font-size: 24px;
padding-left: 20px;
padding-right: 20px;
}

.container>input::placeholder {
color: var(--theme-mode-high-contrast);
}

.container>input {
margin-bottom: 20px;
}


.container>span {
width: 70%;
font-size: 16px;
margin-bottom: 25px;
}

.btn-box {
width: 70%;
display: flex;
justify-content: space-around;
}

.btn-box button {
width: 120px;
height: 50px;
font-size: 24px;
}

@media screen and (max-width: 768px) {
.container>h3 {
    padding-top: 10px;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 30px
}

.container>h3 span {
    display: none;
}

.container>input {
    height: 40px;
    font-size: 18px;
    padding-left: 10px;
}

.container>input:first-of-type {
    margin-bottom: 20px;
}

.container>input,
.container>span,
.btn-box {
    min-width: 80%;
}

.btn-box button {
    width: 80px;
    height: 30px;
    font-size: 16px;
}

.container>span,
.container>span>a {
    font-size: 14px;
}
}

</style>
