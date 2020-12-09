import axios from 'axios';
import * as secrets from './secrets'
import {urlencodeKey} from "./secrets";


const apiPost = (path, body) => {
  // const url = `${window.location.origin}${path}`
  return fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

const apiGet = (path) => {
  return fetch(path, {
    method: 'GET',
  })
}

const createNote = async ({
  message,
  password,
  files,
  burnDate,
  }) => {
  console.log('msg', message, 'pwd', password, 'files', files, 'burnD', burnDate)
  const key = await secrets.createKeyFromPassword(password)
  console.log('encryptScheme', secrets.getEncryptionScheme())
  console.log('key', key)
  console.log('encrypt msg', message ? await secrets.encryptMessage(message, key) : null)
  console.log('encrypt files', await Promise.all(
    files.map(file => secrets.encryptFile(file, key))
  ))
  const note = {
    encryptedMessage: message ? await secrets.encryptMessage(message, key) : null,
    messageLength: message.length,
    files: await Promise.all(
      files.map(file => secrets.encryptFile(file, key))
    ),
    burnDate,
    encryptionScheme: secrets.getEncryptionScheme(),
  }
  console.log('POSTing note to API')
  const {data} = await axios.post('/api/note', note)
  
  const encodedKey = await urlencodeKey(key)
  
  return {
    noteId: data.ID,
    encodedKey
  }
}

const getNote = async ({password, encryptedNote}) => {
  let key = await secrets.createKeyFromPassword(password)
  
  let decryptedMessage = ''
  
  if (encryptedNote.encryptedMessage) {
    encryptedNote.encryptedMessage.data = new Uint8Array(encryptedNote.encryptedMessage.data).buffer
    encryptedNote.encryptedMessage.IV = new Uint8Array(encryptedNote.encryptedMessage.IV)
  
    try {
      decryptedMessage = await secrets.decryptMessage(key, {
        encryptedMessage: encryptedNote.encryptedMessage.data,
        IV: encryptedNote.encryptedMessage.IV,
      })
    } catch (e) {
      throw new Error('Password is invalid. Please, try again')
    }
  }
  
  const files = []
  
  for (let file of encryptedNote.files) {
    const fileData = await secrets.decryptData(key, {
      encryptedMessage: new Uint8Array(file.file.data).buffer,
      IV: new Uint8Array(file.file.IV)
    })
    
    const fileMetaJSON = await secrets.decryptMessage(key, {
      encryptedMessage: new Uint8Array(file.metadata.data).buffer,
      IV: new Uint8Array(file.metadata.IV)
    })
    
    let metadata = {}
    try {
      metadata = JSON.parse(fileMetaJSON)
    } catch (e) {
      console.error(e)
    }
    console.log('filedata', fileData, metadata)
    const isImage = metadata.type.startsWith('image/')
    files.push({
      file: {
        data: fileData,
        metadata,
      },
      isImage: isImage,
      imageData: isImage ? await getFileBufferDataUrl(fileData, metadata): ''
    })
  }
  console.log('decrypted', decryptedMessage, files)
  return {
    message: decryptedMessage,
    files,
    burnDate: encryptedNote.burnDate,
  }
}

const getNoteStatus = async ({id}) => {
  const {data} = await axios.get(`/api/note/${id}/status`)
  return data
}

function getFileBufferDataUrl(file, metadata) {
  const arrayBufferView = new Uint8Array(file);
  const blob = new Blob([arrayBufferView.buffer], metadata);
  const urlCreator = window.URL || window.webkitURL;
  return urlCreator.createObjectURL( blob );
}

function getFileDataURL(file) {
  if (!file) {
    return
  }
  
  console.log(file)
  const reader = new FileReader();
  
  const contentPromise = new Promise((resolve, reject) => {
    reader.onloadend = function () {
      resolve(reader.result);
    }
  })
  
  reader.readAsDataURL(file);
  
  return contentPromise
}

function getTTLList() {
  return [
    { value: 'immediately', label: 'Delete immediately'},
    { value: '30_sec', label: '30 seconds'},
    { value: '15_min', label: '15 minutes'},
    { value: '30_min', label: '30 minutes'},
    { value: '1_hour', label: '1 hour'},
    { value: '3_hours', label: '3 hours'},
    { value: '24_hours', label: '24 hours'}
  ]
}

const emailRegexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
function validateEmail(email) {
  return emailRegexp.test(String(email).toLowerCase());
}

function validateUrl(url) {
  try {
    const targetUrl = new URL(url);
    console.log('targetUrl', targetUrl)
    if (!targetUrl) return false
    if (targetUrl.protocol !== 'http:' && targetUrl.protocol !== 'https:') {
      return false
    }
  } catch (_) {
    return false;
  }
  
  return true;
}

export {
  secrets,
  createNote,
  getNote,
  getNoteStatus,
  getFileDataURL,
  getTTLList,
  validateEmail,
  validateUrl,
}
