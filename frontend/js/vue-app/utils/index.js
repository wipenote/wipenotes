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
  const key = password ? await secrets.createKeyFromPassword(password): await secrets.generateKey()
  console.log('key', key)
  const note = {
    encryptedMessage: await secrets.encryptMessage(message, key),
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

const getNote = async ({id, key}) => {
  const {data} = await axios.get(`/api/note/${id}`)
  const note = data
  
  console.log('getNote', note)
  note.encryptedMessage.data = new Uint8Array(note.encryptedMessage.data).buffer
  note.encryptedMessage.IV = new Uint8Array(note.encryptedMessage.IV)
  
  let decryptedMessage = ''
  try {
    decryptedMessage = await secrets.decryptMessage(key, {
      encryptedMessage: note.encryptedMessage.data,
      IV: note.encryptedMessage.IV,
    })
  } catch (e) {
    throw new Error('Password is invalid. Please, try again')
  }
  
  const files = []
  
  for (let file of note.files) {
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
    files.push({
      data: fileData,
      metadata,
    })
  }
  console.log('decrypted', decryptedMessage)
  return {
    message: decryptedMessage,
    files,
    burnDate: note.burnDate,
  }
}

const getNoteStatus = async ({id}) => {
  const {data} = await axios.get(`/api/note/${id}/status`)
  return data
}

export {
  secrets,
  createNote,
  getNote,
  getNoteStatus,
  
}
