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
    files.push({
      data: fileData,
      metadata,
    })
  }
  console.log('decrypted', decryptedMessage)
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

export {
  secrets,
  createNote,
  getNote,
  getNoteStatus,
  
}
