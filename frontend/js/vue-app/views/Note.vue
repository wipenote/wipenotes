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
                <span class="form__filename-icon-wrapper">
                  <img v-if="!file.isImage"
                       class="form__filename-icon"
                       src="/assets/images/attachment.svg"
                       alt="attachment"
                  >
                  <img v-else class="form__filename-icon-image" :src="file.imageData" alt="">
                </span>
                {{file.file.metadata.name}}
              </button>
            </div>

            <div v-else-if="noteStatusData && noteStatusData.files">
              <button
                v-for="filename in fileStatuses"
                class="form__filename"
              >
                <span class="form__filename-icon-wrapper">
                  <img class="form__filename-icon" src="/assets/images/attachment.svg" alt="attachment">
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
        <div class="form__bottom-right form__bottom-right_desktop">
          <div class="ttl-selector">
            <div class="ttl-selector-current">
              <span class="ttl-selector-icon"><img src="/assets/images/timer.svg" alt="attachment"></span>
              <span class="ttl-selector-text">
                {{currentTTLLabel}}
              </span>
              <span><img class="" src="/assets/images/arrow.svg" alt="arrow"></span>
            </div>
          </div>
          <form
            id="field-password-input-wrapper"
            class="field__password"
            @submit.prevent="onPasswordEnter"
          >
            <span class="field__password-icon"><img src="/assets/images/lock.svg" alt="lock"></span>
            <input
              id="field-password-input"
              class="field__password__input"
              type="password"
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

        <div class="form__bottom-right form__bottom-right_mobile">
          <button @click="onClickShowNote" class="button__attachment button__attachment_mobile">
            <img src="/assets/images/eye.svg" alt="open the password">
          </button>
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
      modal-class="note-confirm-modal modal-note"
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
    getNoteStatus, getTTLList,
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
        ttlList: getTTLList(),
        isVisibleConfirmModal: true,
        isNoteOpened: false,
        isShowPasswordPopover: false,
        errorText: '',
        isShowErrorText: false,
        isVisibleMobileSettingsModal: false,
      }
    },
    mounted() {
      console.log('router', this.$router, this.$route)

      this.noteId = this.$route.params.noteId
      this.noteHash = this.$route.hash ? this.$route.hash.replace('#', '') : ''
      this.notePassword = this.noteHash
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
      currentTTLLabel() {
        if (!this.noteStatusData || !this.noteStatusData.burnDate) {
          return ''
        }

        const ttlItem = this.ttlList.find(ttl => ttl.value === this.noteStatusData.burnDate)

        return ttlItem && ttlItem.label
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
          let hash

          if (this.noteHash) {
            hash = this.noteHash
          } else {
            hash = this.notePassword
          }
          console.log('urlencodedKey', hash)
          if (!this.noteDataEncrypted) {
            const response = await axios.get(`/api/note/${this.noteId}`)
            this.noteDataEncrypted = response.data
          }
          this.noteData = await getNote({
            password: hash,
            encryptedNote: this.noteDataEncrypted
          })
          console.log('getnote', this.noteData)
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
        // var blob = new Blob([file.data], file.metadata);
        // var objectUrl = URL.createObjectURL(blob);
        // window.open(objectUrl);

        const link = document.createElement('a');
        // link.href = window.URL.createObjectURL(blob);
        link.href = file.imageData;
        link.download = file.file.metadata.name
        link.click();
      },
      async showNote() {
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
      },
      openMobileNoteSettings() {
        this.isVisibleMobileSettingsModal = true
      },
      closeMobileNoteSettings() {
        this.isVisibleMobileSettingsModal = false
      },
      toggleNoteVisibility() {
        this.isNoteVisible = !this.isNoteVisible
      },
    }
  }
</script>
