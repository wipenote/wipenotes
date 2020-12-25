<template>
  <fragment>
    <div class="window">
      <div class="window__wrapper window__wrapper_note-created">
        <div>
          <div class="link-to-message">
          <span
              class="link-to-message__copy"
              @click="copyLinkPlusPassword"
          >
            <img src="/assets/images/copy.svg" alt="copy">
          </span>
            <div class="link-to-message__wrapper">
              <p class="link-to-message__type">Link + Pass:</p>
              <router-link class="link-to-message__router" :to="{ path: relativeLinkUrlPlusPassword }" target="_blank">
                {{linkUrlPlusPassword}}
              </router-link>
            </div>
          </div>
          <div class="link-to-message">
          <span
              class="link-to-message__copy"
              @click="copyLink"
          >
            <img src="/assets/images/copy.svg" alt="copy">
          </span>
            <div class="link-to-message__wrapper">
              <p class="link-to-message__type">Link:</p>
              <router-link class="link-to-message__router" :to="{ path: relativeLinkUrl }" target="_blank">
                {{linkUrl}}
              </router-link>
            </div>
          </div>
          <div class="link-to-message" v-if="notePwd">
          <span
              class="link-to-message__copy"
              @click="copyPassword"
          >
            <img src="/assets/images/copy.svg" alt="copy">
          </span>
            <div class="link-to-message__wrapper">
              <p class="link-to-message__type">Pass:</p>
              <p  class="link-to-message__password">{{notePwd}}</p>
            </div>
          </div>
        </div>

        <qrcode-vue
            v-if="linkUrl"
            :value="linkUrl"
            :size="200"
            level="H"
        />

      </div>




      <div class="form__socials-wrapper">
        <a class="button__socials" :href="fbLink" target="_blank">
          <img src="/assets/images/facebook.svg" alt="facebook">
        </a>
        <a class="button__socials" :href="telegramLink">
          <img src="/assets/images/telegram.svg" alt="telegram">
        </a>
        <a class="button__socials" :href="whatsAppLink">
          <img src="/assets/images/whatsapp.svg" alt="whatsapp">
        </a>
        <a class="button__socials" :href="emailLink">
          <img src="/assets/images/mail.svg" alt="mail">
        </a>
      </div>

    </div>
    <button @click="createNewNote" class="button__submit" type="submit">Create a new note</button>
    <b-toast id="my-toast" variant="warning" solid>
      <template #toast-title>
        <div class="d-flex flex-grow-1 align-items-baseline">
          <b-img blank blank-color="#ff5555" class="mr-2" width="12" height="12"></b-img>
          <strong class="mr-auto">Notice!</strong>
          <small class="text-muted mr-2">42 seconds ago</small>
        </div>
      </template>
      This is the content of the toast.
      It is short and to the point.
    </b-toast>
  </fragment>
</template>

<script>
  import {
    secrets,
    createNote,
    getNote,
    getNoteStatus,
  } from '../utils'
  import QrcodeVue from 'qrcode.vue'

  export default {
    name: 'Home',
    components: {
      QrcodeVue,
    },
    data() {
      return {
        message: '',
        files: [],
        noteId: '',
        notePwd: ''
      }
    },
    mounted() {
      console.log('router', this.$router, this.$route)
      this.noteId = this.$route.params.noteId
      this.notePwd = this.$route.params.notePwd || this.$route.hash.replace('#', '')
      this.$clipboard(this.getLinkUrl())
    },
    computed: {
      relativeLinkUrl() {
        return this.noteId ? `/${this.noteId}` : ''
      },
      relativeLinkUrlPlusPassword() {
        return this.noteId ? `/${this.noteId}#${this.notePwd}` : ''
      },
      linkUrl() {
        return `${window.location.origin}${this.relativeLinkUrl}`
      },
      linkUrlPlusPassword() {
        return `${window.location.origin}${this.relativeLinkUrl}#${this.notePwd}`
      },
      encodedUrlLink() {
        return encodeURIComponent(this.linkUrl)
      },
      fbLink() {
        return`https://www.facebook.com/sharer/sharer.php?u=${this.encodedUrlLink}`
      },
      emailLink() {
        return `mailto:?&body=${this.encodedUrlLink}`
      },
      telegramLink() {
        return `tg://msg_url?url=${this.encodedUrlLink}`
      },
      whatsAppLink() {
        return `whatsapp://send?text=${this.encodedUrlLink}`
      }
    },
    methods: {
      getLinkUrl() {
        const origin = window.location.origin
        return `${origin}${this.noteId ? `/${this.noteId}${this.notePwd ? '#' + this.notePwd : ''}` : ''}`
      },
      goToNote() {
        const hash = this.notePwd ? `#${this.notePwd}` : ''
        this.$router.push({path: `/${this.noteId}${hash}`})
      },
      handleFilesUpload(){
        console.log('this.$refs.files.files', this.$refs.files.files)
        this.files = this.$refs.files.files;
      },
      onClickAddAttachment() {
        this.$refs.files.click()
      },
      getNote() {
        // setCreatedNoteId('1234')
        const {noteId, encodedKey} = createNote({
          message: this.message,
          files: this.files.map(file => file.file),
          burnDate: this.selectedTTL,
        })
      },
      onClickSelectedTTL() {
        this.$refs.selectTTL.click()
      },
      createNewNote() {
        this.$router.push({name: 'home'})
      },
      copyLink() {
        this.$clipboard(this.linkUrl)
        this.$bvToast.toast('Link has been copied', {
          // title: `Copied successfully`,
          variant: 'success',
          solid: true,
          autoHideDelay: 3000,
        })

        // this.$bvToast.show('my-toast')

      },
      copyLinkPlusPassword() {
        this.$clipboard(this.linkUrlPlusPassword)
        this.$bvToast.toast('Link has been copied', {
          // title: `Copied successfully`,
          variant: 'success',
          solid: true,
          autoHideDelay: 3000,
        })

        // this.$bvToast.show('my-toast')

      },
      copyPassword() {
        this.$clipboard(this.notePwd)
        this.$bvToast.toast('Password has been copied', {
          // title: `Copied successfully`,
          variant: 'success',
          solid: true,
          autoHideDelay: 3000,
        })

        // this.$bvToast.show('my-toast')

      },
      shareFacebook() {
        const shareLink = encodeURIComponent(this.linkUrl)
        const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`
      }
    }
  }
</script>
