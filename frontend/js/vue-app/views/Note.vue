<template>
  <div class="form">
    <div class="window">
      <div class="form__wrapper-img">

        <div class="form__top">
          <div class="textarea__wrapper">
            <textarea
              v-if="!noteLoading"
              v-model="currentMessage"
              class="textarea"
              id="textarea"
              name="text"
              placeholder="Write your note here"
              readonly
              autofocus />

            <div v-else>
              <b-spinner variant="primary"></b-spinner>
            </div>


            <div v-if="isNoteOpened">
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

            <div v-else-if="noteStatusData && noteStatusData.files">
              <button
                v-for="filename in fileStatuses"
                class="form__filename"
              >
                <span class="form__filename-icon">
                  <img src="/assets/images/attachment.svg" alt="attachment">
                </span>
                {{filename}}
              </button>
            </div>
          </div>
          <button
            class="button__open-text"
            @click="onClickShowNote"
          >
            <img src="/assets/images/eye.svg" alt="eye">
          </button>

        </div>
      </div>
      <div class="form__bottom">
        <div class="form__bottom-left">
          <button class="button__attachment">
            <img src="/assets/images/attachment.svg" alt="attachment">
          </button>
        </div>
        <div class="form__bottom-right">
          <button class="ttl-selector" disabled>
            <span class="ttl-selector-icon"><img src="/assets/images/timer.svg" alt="attachment"></span>
            <span class="ttl-selector-text">Delete immediately</span>
            <span><img class="" src="/assets/images/arrow.svg" alt="arrow"></span>
          </button>
          <form
            id="field-password-input-wrapper"
            class="field__password"
            @submit.prevent="onPasswordEnter"
          >
            <span class="field__password-icon"><img src="/assets/images/lock.svg" alt="lock"></span>
            <input
              id="field-password-input"
              class="field__password__input"
              type="text"
              v-model="notePassword"
              placeholder="Enter password"
              @focus="onPasswordFieldFocus"
              @blur="onPasswordFieldBlur"
              :disabled="isNoteOpened"
            />

            <b-popover
              :show.sync="isShowPasswordPopover"
              target="field-password-input-wrapper"
              placement="topleft"
              triggers=""
            >
              Please, enter password
            </b-popover>
          </form>
        </div>
      </div>

      <div v-if="isShowErrorText" class="form__bottom-error">
        {{errorText}}
      </div>
    </div>
    <button @click="createNewNote" class="button__submit" type="submit">Create a new note</button>

    <b-modal
      id="confirm-modal"
      ref="confirmModal"
      no-close-on-backdrop
      no-close-on-esc
      hide-footer
      hide-header
      hide-header-close
      centered
      :visible="isVisibleConfirmModal"
      body-class="note-confirm-modal__body"
      dialog-class="note-confirm-modal__dialog"
      modal-class="note-confirm-modal"
    >

      <div
        v-if="noteStatusLoading"
        class="note-confirm-modal__content"
      >
        <b-spinner variant="primary"></b-spinner>
      </div>

      <div
        v-else-if="noteStatusData && noteStatusData.hasBurned"
        class="note-confirm-modal__content"
      >
        <div class="note-confirm-modal__actions">
          <button
            class="note-confirm-modal__button note-confirm-modal__read-button button__submit"
            @click="createNewNote"
          >
            Create new note
          </button>
        </div>
      </div>

      <div
        v-else-if="noteStatusError"
        class="note-confirm-modal__content"
      >
        <div class="note-confirm-modal__header">
          {{noteStatusError}}
        </div>

        <div class="note-confirm-modal__actions">
          <button
            class="note-confirm-modal__button note-confirm-modal__read-button button__submit"
            @click="createNewNote"
          >
            Create new note
          </button>
        </div>
      </div>

      <div
        v-else
        class="note-confirm-modal__content"
      >
        <div class="note-confirm-modal__header">The note will be deleted</div>
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
  import axios from 'axios'

  export default {
    name: 'Home',
    props: {},
    data() {
      return {
        message: '',
        noteId: '',
        noteHash: '',
        noteLoading: false,
        noteData: null,
        noteDataEncrypted: null,
        noteError: null,
        noteStatusData: null,
        noteStatusError: null,
        noteStatusLoading: true,
        notePassword: '',
        selectedTTL: '',
        isVisibleConfirmModal: true,
        isNoteOpened: false,
        isShowPasswordPopover: false,
        errorText: '',
        isShowErrorText: false,
      }
    },
    mounted() {
      console.log('router', this.$router, this.$route)

      this.noteId = this.$route.params.noteId
      this.noteHash = this.$route.hash ? this.$route.hash.replace('#', '') : ''
      this.loadNoteStatus()
    },
    computed: {
      currentMessage() {
        const statusData = this.noteStatusData

        if (this.isNoteOpened) {
          return this.noteData && this.noteData.message
        }

        if (!statusData || !statusData.messageLength) {
          return ''
        }

        return new Array(statusData.messageLength).fill('*').join('')
      },
      fileStatuses() {
        return this.noteStatusData && this.noteStatusData.files ?
          new Array(this.noteStatusData.files).fill('***********')
          : []
      },
      files() {
        return this.noteData && this.noteData.files || []
      }
    },
    methods: {
      onPasswordFieldFocus() {
        this.closeShowPasswordPopover()
      },
      onPasswordFieldBlur() {
        this.closeShowPasswordPopover()
      },
      onClickShowNote() {
        this.showNote()
      },
      hideConfirmModal() {
        this.isVisibleConfirmModal = false
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
      createNewNote() {
        this.$router.push({name: 'home'})
      },
      async loadNoteStatus() {
        this.noteStatusLoading = true

        try {
          console.log('getNoteStatus', this.noteId)
          const status = await getNoteStatus({id: this.noteId})
          console.log('getNoteStatus', status)
          this.noteStatusData = status
        } catch (e) {
          console.error('loadNoteStatus', e)
          console.dir(e)
          this.noteStatusError = e.response && e.response.data && e.response.data.message || e.message
        }

        this.noteStatusLoading = false

      },
      async loadNote() {
        this.noteLoading = true

        try {
          const hash = this.noteHash

          console.log('urlencodedKey', hash)
          if (!this.noteDataEncrypted) {
            const response = await axios.get(`/api/note/${this.noteId}`)
            this.noteDataEncrypted = response.data
          }
          const data = await getNote({
            password: this.noteHash,
            encryptedNote: this.noteDataEncrypted
          })
          console.log('getnote', data)
          this.noteData = data
        } catch (e) {
          this.noteLoading = false
          console.error(e.message)
          this.showPageError(e.message)
          throw e
        }

        this.noteLoading = false
      },
      showPasswordPopover() {
        this.isShowPasswordPopover = true
      },
      closeShowPasswordPopover() {
        this.isShowPasswordPopover = false
      },
      async onReadNow() {
        this.$refs.confirmModal.hide()
        if (this.noteHash) {
          await this.loadNote()
          this.isNoteOpened = true
        } else {
          this.showPasswordPopover()
        }

      },
      onReadLater() {
        // this.$router.push({name: 'home'})
        this.hideConfirmModal()
      },
      downloadFile(file) {
        var blob = new Blob([file.data], file.metadata);
        // var objectUrl = URL.createObjectURL(blob);
        // window.open(objectUrl);

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = file.metadata.name
        link.click();
      },
      async showNote() {
        if (this.isNoteOpened) {
          return
        }
        this.closeShowPasswordPopover()
        this.hidePageError()

        if (this.noteLoading) {
          return
        }
        if (!this.noteData) {
          await this.loadNote()
        }
        this.isNoteOpened = true
      },
      async onPasswordEnter() {
        await this.showNote()
      },
      showPageError(text) {
        this.errorText = text
        this.isShowErrorText = true
      },
      hidePageError() {
        this.isShowErrorText = false
      }
    }
  }
</script>
