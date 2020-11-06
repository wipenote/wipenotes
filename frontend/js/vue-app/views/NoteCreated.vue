<template>
  <fragment>
    <div class="window">
      <div class="window__wrapper">
        <div class="link-to-message">
          <span class="link-to-message__img">
            <img src="/assets/images/copy.svg" alt="copy">
          </span>
          <router-link :to="{ path: relativeLinkUrl }">
            {{linkUrl}}
          </router-link>

        </div>
        <img class="qr" src="/assets/images/qr.png" alt="qr code">
      </div>
      <div class="form__socials-wrapper">
        <a class="button__socials" href="#">
          <img src="/assets/images/facebook.svg" alt="facebook">
        </a>
        <a class="button__socials" href="#">
          <img src="/assets/images/telegram.svg" alt="telegram">
        </a>
        <a class="button__socials" href="#">
          <img src="/assets/images/whatsapp.svg" alt="whatsapp">
        </a>
        <a class="button__socials" href="#">
          <img src="/assets/images/mail.svg" alt="mail">
        </a>
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

  export default {
    name: 'Home',
    props: {},
    data() {
      return {
        message: '',
        files: [],
        noteId: '',
        notePwd: ''
      }
    },
    created() {
      console.log('router', this.$router, this.$route)
      this.noteId = this.$route.params.noteId
      this.notePwd = this.$route.params.notePwd
    },
    computed: {
      relativeLinkUrl() {
        return this.noteId ? `/${this.noteId}#${this.notePwd || ''}` : ''
      },
      linkUrl() {
        return `${window.location.origin}${this.relativeLinkUrl}`
      }
    },
    methods: {
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
      }
    }
  }
</script>
