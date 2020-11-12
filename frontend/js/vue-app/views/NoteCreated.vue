<template>
  <fragment>
    <div class="window">
      <div class="window__wrapper">
        <div class="link-to-message">
          <span
            class="link-to-message__copy"
            @click="copyLink"
          >
            <img src="/assets/images/copy.svg" alt="copy">
          </span>
          <router-link :to="{ path: relativeLinkUrl }">
            {{linkUrl}}
          </router-link>

        </div>
        <qrcode-vue
          v-if="linkUrl"
          :value="linkUrl"
          :size="200"
          level="H"
        />

      </div>
    </div>
    <button @click="createNewNote" class="button__submit" type="submit">Create a new note</button>
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
        return this.noteId ? `/${this.noteId}${this.notePwd ? '#' + this.notePwd : ''}` : ''
      },
      linkUrl() {
        return `${window.location.origin}${this.relativeLinkUrl}`
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
        return `https://telegram.me/share/url?url=${this.encodedUrlLink}`
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
      getFileDataURL(file) {
        if (!file) {
          return
        }

        const reader = new FileReader();

        const contentPromise = new Promise((resolve, reject) => {
          reader.onloadend = function () {
            resolve(reader.result);
          }
        })

        if (file) {
          reader.readAsDataURL(file);
        }

        return contentPromise
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
      },
      shareFacebook() {
        const shareLink = encodeURIComponent(this.linkUrl)
        const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`
      }
    }
  }
</script>
