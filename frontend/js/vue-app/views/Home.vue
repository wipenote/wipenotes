<template>
  <div class="form">
    <div
      class="window"
      @dragenter.prevent.stop="dragging = true"
      @dragover.prevent.stop="dragging = true"
    >
      <div class="form__wrapper-img">
        <div class="form__top">
          <div class="textarea__wrapper" @paste="pasteTextarea">
            <div
              style="width: 500px;height: 200px;"
              class="textarea"
              contenteditable="true"
              ref="htmlField"
              v-html="htmlTextField"
              @input="onEditHtmlField">
            </div>

            <textarea
              v-if="isNoteVisible"
              v-model="message"
              ref="messageTextarea"
              class="textarea"
              name="text"
              placeholder="Write your note here"
              autofocus />

            <textarea
              v-else
              v-model="currentMessage"
              class="textarea"
              name="text"
              placeholder="Write your note here"
              :disabled="!isNoteVisible"
              :readonly="!isNoteVisible"
              autofocus />

            <div class="form__file-list">
              <input style="display: none" type="file" ref="files" @change="onFileChange"/>
              <button v-for="file in files" class="form__filename">
                <span class="form__filename-icon-wrapper">
                  <img class="form__filename-icon" v-if="!file.isImage" src="/assets/images/attachment.svg" alt="attachment">
                  <img class="form__filename-icon-image" v-else :src="file.imageData" alt="">
                </span>
                <span class="form__filename-title">
                  {{file.file && file.file.name}}
                </span>
                <span class="form__filename-delete" @click="deleteAttachment(file)">x</span>
              </button>
            </div>
          </div>
          <button @click="toggleNoteVisibility" class="button__open-text">
            <img src="/assets/images/eye.svg" alt="eye">
          </button>

        </div>
      </div>
      <div class="form__bottom">
        <div class="form__bottom-left">
          <button
            id="home-button-attachment"
            class="button__attachment"
            @click="onClickAddAttachment"
            @blur="hideAttachmentPopover"
          >
            <img src="/assets/images/attachment.svg" alt="attachment">
          </button>
          <b-popover
            :show.sync="isShowAttachmentPopover"
            target="home-button-attachment"
            placement="topright"
            triggers=""
          >
            Max file size of attachment is 5MB
          </b-popover>
        </div>
        <div class="form__bottom-right form__bottom-right_desktop">
          <div
            class="ttl-selector"
            :class="{ open: isTTLSelectorOpen }"
            tabindex="0"
            @click="isTTLSelectorOpen = !isTTLSelectorOpen"
            @blur="isTTLSelectorOpen = false"
          >
            <div class="ttl-selector-current">
              <span class="ttl-selector-icon"><img src="/assets/images/timer.svg" alt="attachment"></span>
              <span class="ttl-selector-text">
                {{selectedTTLObjectLabel}}
              </span>
              <span><img class="" src="/assets/images/arrow.svg" alt="arrow"></span>
            </div>
            <ul class="ttl-selector__list">
              <li
                v-for="(ttlObject, index) in ttlList"
                @click="onClickTTLObject(index)"
                class="ttl-selector__list-item"
              >
                <span class="ttl-selector-text">{{ttlObject.label}}</span>
              </li>
            </ul>
          </div>
          <div class="field__password">
            <span class="field__password-icon"><img src="/assets/images/lock.svg" alt="lock"></span>
            <input
              class="field__password__input"
              type="text"
              v-model="selectedPassword"
              placeholder="Enter password"
            />
          </div>
        </div>

        <div class="form__bottom-right form__bottom-right_mobile">
          <button @click="openMobileNoteSettings" class="button__attachment button__attachment_mobile">
            <img src="/assets/images/settings.svg" alt="settings">
          </button>
          <button @click="toggleNoteVisibility" class="button__attachment button__attachment_mobile">
            <img src="/assets/images/eye.svg" alt="open the password">
          </button>
        </div>
      </div>

      <div v-if="noteCreatingError" class="form__bottom-error">
        {{noteCreatingError}}
      </div>

      <div
        v-if="dragging"
        class="drag-overlay"
        @drop.prevent="onDropFile"
        @dragleave="dragging=false"
      >
        Drop files here to upload
      </div>
    </div>
    <button
      @click="createNote"
      class="button__submit"
      type="submit"
      :disabled="isNoteCreating"
    >
      Create note
      <b-spinner v-if="isNoteCreating" small variant="dark"></b-spinner>
    </button>


    <b-modal
      id="confirm-modal"
      ref="confirmModal"
      hide-footer
      hide-header
      centered
      :visible="isVisibleMobileSettingsModal"
      body-class="note-confirm-modal__body"
      dialog-class="note-confirm-modal__dialog"
      modal-class="note-confirm-modal modal-settings"
    >

      <div class="modal__wrapper">
        <h2 class="modal__wrapper-title">Note settings</h2>
        <b-button class="modal__close" @click="closeMobileNoteSettings">
          <img src="/assets/images/cross.svg" alt="close">
        </b-button>
      </div>
      <div
        class="ttl-selector"
        :class="{ open: isTTLSelectorOpen }"
        tabindex="0"
        @click="isTTLSelectorOpen = !isTTLSelectorOpen"
        @blur="isTTLSelectorOpen = false"
      >
        <div class="ttl-selector-current">
          <span class="ttl-selector-icon"><img src="/assets/images/timer-purple.svg" alt="attachment"></span>
          <span class="ttl-selector-text">
            {{selectedTTLObjectLabel}}
          </span>
          <span><img class="" src="/assets/images/arrow-white.svg" alt="arrow"></span>
        </div>
        <ul class="ttl-selector__list">
          <li
            v-for="(ttlObject, index) in ttlList"
            @click="onClickTTLObject(index)"
            class="ttl-selector__list-item"
          >
            <span class="ttl-selector-text">{{ttlObject.label}}</span>
          </li>
        </ul>
      </div>

      <div class="field__password">
        <span class="field__password-icon"><img src="/assets/images/lock-purple.svg" alt="lock"></span>
        <input
          class="field__password__input"
          type="text"
          v-model="selectedPassword"
          placeholder="Enter password"
        />
      </div>
    </b-modal>
  </div>
</template>

<script>
  import {
    secrets,
    createNote,
    getNote,
    getNoteStatus, getFileDataURL, getTTLList, validateEmail,
  } from '../utils'
import * as generator from 'generate-password'

export default {
  name: 'Home',
  props: {},
  data() {
    return {
      message: '',
      files: [],
      isNoteVisible: true,
      postFormData: new FormData(),
      ttlList: getTTLList(),
      selectedTTLIndex: 0,
      selectedPassword: '',
      isTTLSelectorOpen: false,
      isNoteCreating: false,
      noteCreatingError: '',
      isShowAttachmentPopover: false,
      attachmentPopoverText: '',
      isVisibleMobileSettingsModal: false,
      dragging: false,
      htmlTextField: '',
    }
  },
  mounted() {
    if (this.$route.params.replyMessage) {
      this.message = this.$route.params.replyMessage
    }

    console.log('ref', this.$refs.htmlField)

    if (this.$refs.messageTextarea) {
      this.$nextTick(() => {
        this.$refs.messageTextarea.focus()

        if (typeof this.$refs.messageTextarea.selectionStart == "number") {
          this.$refs.messageTextarea.selectionStart = this.$refs.messageTextarea.selectionEnd = this.$refs.messageTextarea.value.length;
        } else if (typeof this.$refs.messageTextarea.createTextRange != "undefined") {
          this.$refs.messageTextarea.focus();
          var range = this.$refs.messageTextarea.createTextRange();
          range.collapse(false);
          range.select();
        }
      })
    }

  },
  computed: {
    selectedTTLObjectLabel() {
      const selectedTTLObject = this.ttlList[this.selectedTTLIndex]
      return selectedTTLObject ? selectedTTLObject.label: ''
    },
    selectedTTLObjectValue() {
      const selectedTTLObject = this.ttlList[this.selectedTTLIndex]
      return selectedTTLObject ? selectedTTLObject.value: ''
    },
    currentMessage() {
      return this.isNoteVisible ? this.message : new Array(this.message.length).fill('*').join('')
    }
  },
  watch: {
    selectedPassword(newVal) {
      let re = /[^A-Za-z0-9]/gi;
      this.$set(this, 'selectedPassword', newVal.replace(re, ''));
    }
  },
  methods: {
    getPos() {
      // for contentedit field
      if (this.isContentEditable) {
        // this.target.focus()
        let _range = document.getSelection().getRangeAt(0)
        let range = _range.cloneRange()
        range.selectNodeContents(this.$refs.htmlField)
        range.setEnd(_range.endContainer, _range.endOffset)
        return range.toString().length;
      }
      // for texterea/input element
      return this.$refs.htmlField.selectionStart
    },

    placeCaretAtEnd(el) {
      el.focus();
      if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      } else if (typeof document.body.createTextRange != "undefined") {
        const textRange = document.body.createTextRange();
        textRange.moveToElementText(el);
        textRange.collapse(false);
        textRange.select();
      }
    },
    getRecognizedWordHtml(word) {
      if (validateEmail(word)) {
        return `<a class="link" href="mailto:${word}">${word}</a>`
      }

      return `<span>${word}</span>`
    },
    onEditHtmlField(e) {

      // this.myHtmlCode = e.target.innerHTML;
      console.log('Html:', e.target.innerHTML);
      console.log('Text:', e.target.innerText);
      const words = e.target.innerText.split(' ')

      const recognizedWordsList = []

      for (let word of words) {
        recognizedWordsList.push(this.getRecognizedWordHtml(word))
      }

      this.htmlTextField = recognizedWordsList.join(' ')
      console.log('pos', e.target.selectionStart)
      console.log('target', e.target)
      this.$nextTick(() => {
        this.placeCaretAtEnd(this.$refs.htmlField)
      })
    },
    onDragOver(e) {
      console.log('dragover')
    },
    onDropFile(e) {
      this.dragging = false
      let droppedFiles = e.dataTransfer.files;
      console.log(e.dataTransfer.files)
      if(!droppedFiles || !droppedFiles.length) return;
      this.addFileAttachments(e.dataTransfer.files)
      // this tip, convert FileList to array, credit: https://www.smashingmagazine.com/2018/01/drag-drop-file-uploader-vanilla-js/
      // ([...droppedFiles]).forEach(f => {
      //   this.files.push(f);
      // });
    },
    onClickTTLObject(index) {
      this.selectedTTLIndex = index
    },
    submitFiles(){
      let formData = new FormData();
      for( var i = 0; i < this.files.length; i++ ){
        let file = this.files[i];
        formData.append('files[' + i + ']', file);
      }
    },
    handleFilesUpload(){
      console.log('this.$refs.files.files', this.$refs.files.files)
      this.files = this.$refs.files.files;
    },
    showAttachmentPopover(text) {
      this.attachmentPopoverText = text
      this.isShowAttachmentPopover = true
    },
    hideAttachmentPopover() {
      this.isShowAttachmentPopover = false
    },
    async onFileChange(event) {
      await this.addFileAttachments(event.target.files)
    },
    async addFileAttachments(files) {
      console.log(files)

      for (const file of files){
        if (file.size > 1024 * 1024 * 5) {
          this.showAttachmentPopover()
          return
        }

        this.postFormData.append('images[]', file);
        const isImage = file.type.startsWith('image/')

        // Max filesize = 5mb
        this.files.push({
          file,
          isImage: isImage,
          imageData: isImage ? await getFileDataURL(file): ''
        })

      }
      console.log('this.postFormData', this.postFormData)
    },
    onClickAddAttachment() {
      this.$refs.files.value = ''
      this.$refs.files.click()
    },
    deleteAttachment(targetFile) {
      this.files = this.files.filter(file => file !== targetFile)
    },
    async createNote() {
      this.noteCreatingError = ''

      if (!this.files.length && !this.message) {
        this.noteCreatingError = 'Please, attach a file or create a message'
        return
      }

      this.isNoteCreating = true

      const password = this.selectedPassword || generator.generate({
        length: 10,
        numbers: true
      });

      try {
        const {noteId, encodedKey} = await createNote({
          message: this.message,
          files: this.files.map(file => file.file),
          burnDate: this.selectedTTLObjectValue,
          password,
        })
        console.log('create note', noteId, encodedKey)
        this.$router.push({
          name: 'note-created',
          params: {noteId: noteId, notePwd: password},
          hash: `#${password}`
        })
      } catch (e) {
        console.error(e)
        this.noteCreatingError = e.response && e.response.data && e.response.data.message || e.message
      }
      this.isNoteCreating = false
    },
    onClickSelectedTTL() {
      this.$refs.selectTTL.click()
    },
    toggleNoteVisibility() {
      this.isNoteVisible = !this.isNoteVisible
    },
    openMobileNoteSettings() {
      this.isVisibleMobileSettingsModal = true
    },
    closeMobileNoteSettings() {
      this.isVisibleMobileSettingsModal = false
    },
    async pasteTextarea(pasteEvent, callback) {
      pasteEvent.preventDefault()
      if (pasteEvent.clipboardData === false){
        if (typeof(callback) == "function"){
          callback(undefined);
        }
      }

      var items = pasteEvent.clipboardData.items;

      if (items === undefined){
        if (typeof(callback) == "function"){
          callback(undefined);
        }
      }

      const attachments = []

      for (var i = 0; i < items.length; i++) {
        var blob = items[i].getAsFile();

        if (blob) {
          attachments.push(blob)
        }
      }

      this.addFileAttachments(attachments)
    }
  }
}
</script>
