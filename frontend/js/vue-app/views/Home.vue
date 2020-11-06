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
      postFormData: new FormData(),
      selectedTTL: 'immediately',
      selectedPassword: ''
    }
  },
  methods: {
    submitFiles(){
      let formData = new FormData();
      for( var i = 0; i < this.files.length; i++ ){
        let file = this.files[i];
        formData.append('files[' + i + ']', file);
      }
      /*
      axios.post( '/multiple-files',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      ).then(function(){
        console.log('SUCCESS!!');
      })
        .catch(function(){
          console.log('FAILURE!!');
        });
        */
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
        params: {noteId: noteId, notePwd: encodedKey}
      })
    },
    onClickSelectedTTL() {
      this.$refs.selectTTL.click()
    },
  }
}
</script>
