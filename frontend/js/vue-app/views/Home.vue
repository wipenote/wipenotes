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
              autofocus />

            <div>
              <input style="display: none" type="file" ref="files" @change="onFileChange"/>
              <button v-for="file in files" class="form__filename">
                <span class="form__filename-icon">
                  <img src="/assets/images/attachment.svg" alt="attachment">
                </span>
                  {{file.file.name}}
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
            class="button__attachment"
            @click="onClickAddAttachment"
          >
            <img src="/assets/images/attachment.svg" alt="attachment">
          </button>
        </div>
        <div class="form__bottom-right">
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
            <input class="field__password__input" type="text" v-model="selectedPassword" placeholder="Enter password" />
          </div>
        </div>
      </div>
    </div>
    <button @click="createNote" class="button__submit" type="submit">Create note</button>
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
      isNoteVisible: true,
      postFormData: new FormData(),
      ttlList: [
        { value: '30_sec', label: '30 sec'},
        { value: 'immediately', label: 'Delete immediately'},
        { value: '15_min', label: '15 minutes'},
        { value: '30_min', label: '30 minutes'},
        { value: '1_hour', label: '1 hour'},
        { value: '3_hours', label: '3 hours'},
        { value: '24_hours', label: '24 hours'}
      ],
      selectedTTLIndex: 0,
      selectedPassword: '',
      isTTLSelectorOpen: false,
    }
  },
  computed: {
    selectedTTLObjectLabel() {
      const selectedTTLObject = this.ttlList[this.selectedTTLIndex]
      return selectedTTLObject ? selectedTTLObject.label: ''
    }
  },
  methods: {
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
    async onFileChange(event) {
      console.log(event.target.files)

      for(const file of event.target.files){
        this.postFormData.append('images[]', file);
        const isImage = file.type.startsWith('image/')

        this.files.push({
          file,
          isImage: isImage,
          imageData: isImage ? await this.getFileDataURL(file): ''
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
        // setCreatedNoteId('1234')
      const {noteId, encodedKey} = await createNote({
        message: this.message,
        files: this.files.map(file => file.file),
        burnDate: this.selectedTTL,
      })
      console.log('create note', noteId, encodedKey)
      this.$router.push({
        name: 'note-created',
        params: {noteId: noteId, notePwd: encodedKey},
        hash: `#${encodedKey}`
      })
    },
    onClickSelectedTTL() {
      this.$refs.selectTTL.click()
    },
    toggleNoteVisibility() {
      this.isNoteVisible = !this.isNoteVisible
    }
  }
}
</script>
