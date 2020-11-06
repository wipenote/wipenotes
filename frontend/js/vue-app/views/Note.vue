<template>
  <div class="form">
    <div class="window">
      <div class="form__wrapper-img">

        <div class="form__top">
          <div class="textarea__wrapper">
            <textarea
              v-model="message"
              class="textarea"
              id="textarea"
              name="text"
              placeholder="Write your note here"
              readonly
              autofocus />

            <div>
              <button
                v-for="file in files"
                class="form__filename"
                @click="downloadFile(file)"
              >
                <span class="form__filename-icon">
                  <img src="/assets/images/attachment.svg" alt="attachment">
                </span>
                {{file.metadata.name}}
              </button>
            </div>
          </div>
          <button class="button__open-text">
            <img src="/assets/images/eye.svg" alt="eye">
          </button>

        </div>
      </div>
      <div class="form__bottom">
        <div class="form__bottom-left">
          <button
            class="button__attachment"
            @click="onClickAddAttachment"
          >
            <img src="/assets/images/attachment.svg" alt="attachment">
          </button>
          <button class="button__attachment"><img src="/assets/images/picture.svg" alt="attach a photo"></button>
        </div>
        <div class="form__bottom-right">
          <select style="display: none" v-model="selectedTTL" ref="selectTTL">
            <option value="immediately">Delete immediately</option>
            <option value="30_sec">30_sec</option>
            <option value="15_min">15 min</option>
            <option value="30_min">30 min</option>
            <option value="1_hour">1 hour</option>
            <option value="3_hours">3 hours</option>
            <option value="24_hours">24 hours</option>
          </select>
          <button class="button__timer" @click="onClickSelectedTTL">
            <span class="button__timer-icon"><img src="/assets/images/timer.svg" alt="attachment"></span>
            <span class="button__timer-text">Delete immediately</span>
            <span><img class="" src="/assets/images/arrow.svg" alt="arrow"></span>
          </button>
          <button class="field__password">
            <span class="field__password-icon"><img src="/assets/images/lock.svg" alt="lock"></span>
            <input class="field__password__input" type="text" v-model="selectedPassword" placeholder="Enter password" />
          </button>
        </div>
      </div>
    </div>
    <button @click="createNewNote" class="button__submit" type="submit">Create a new note</button>

    <b-modal
      ref="confirmModal"
      no-close-on-backdrop
      no-close-on-esc
      hide-footer
      hide-header
      hide-header-close
      centered
      :visible="isVisibleConfirmModal"
    >
      <div class="note-confirm-modal__content">
        <div class="note-confirm-modal__header">The note will be deleted 10 seconds after reading</div>
        <div class="note-confirm-modal__actions">
          <button
            class="note-confirm-modal__button note-confirm-modal__read-button button__submit"
            @click="onReadNow"
          >
            Read now
          </button>
          <button
            class="note-confirm-modal__button note-confirm-modal__later-button"
            @click="onReadLater"
          >
            Later
          </button>
        </div>
      </div>
    </b-modal>
  </div>
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
        notePwd: '',
        noteHash: '',
        noteLoading: '',
        noteData: {},
        selectedPassword: '',
        selectedTTL: '',
        isVisibleConfirmModal: true,
      }
    },
    mounted() {
      console.log('router', this.$router, this.$route)

      this.noteId = this.$route.params.noteId
      this.noteHash = this.$route.hash ? this.$route.hash.replace('#', '') : ''
      this.notePwd = this.$route.params.notePwd
    },
    computed: {
      linkUrl() {
        return this.noteId ? `${window.location.origin}/${this.noteId}#${this.notePwd || ''}` : ''
      }
    },
    methods: {
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
        const note = createNote({
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
      async onReadNow() {
        this.$refs.confirmModal.hide()
        await this.loadNote()

      },
      async loadNote() {
        this.noteLoading = true

        try {
          const urlencodedKey = this.noteHash
          const key = await secrets.urldecodeKey(urlencodedKey)
          console.log('urlencodedKey', urlencodedKey)
          console.log('key', key)
          const data = await getNote({id: this.noteId, key })
          console.log('getnote', data)
          this.noteData = data
          this.message = data.message
          this.files = data.files
        } catch (e) {
          console.error(e)
        }

        this.noteLoading = false

      },
      onReadLater() {
        this.$router.push({name: 'home'})
      },
      downloadFile(file) {
        var blob = new Blob([file.data], file.metadata);
        // var objectUrl = URL.createObjectURL(blob);
        // window.open(objectUrl);

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = file.metadata.name
        link.click();
      }
    }
  }
</script>
