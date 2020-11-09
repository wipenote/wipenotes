import * as secrets from './secrets'
import {urlencodeKey} from "./secrets";


const apiPost = (path, body) => {
  // const url = `${window.location.origin}${path}`
  const url = `http://localhost:3000${path}`
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

const apiGet = (path) => {
  const url = `http://localhost:3000${path}`
  return fetch(url, {
    method: 'GET',
  })
}


const createNote = async ({
  message,
  files,
  burnDate
  }) => {
  const key = await secrets.generateKey()
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
  const response = await apiPost('/api/note', note)
  const { ID } = await response.json()
  
  const encodedKey = await urlencodeKey(key)
  
  return {
    noteId: ID,
    encodedKey
  }
}

const getNote = async ({id, key}) => {
  const response = await apiGet(`/api/note/${id}`)
  if (!response.ok) {
    throw new Error(`Getting ${id} did not work!`)
  }
  const note = await response.json()
  
  console.log('getNote', note)
  note.encryptedMessage.data = new Uint8Array(note.encryptedMessage.data).buffer
  note.encryptedMessage.IV = new Uint8Array(note.encryptedMessage.IV)
  
  
  const decryptedMessage = await secrets.decryptMessage(key, {
    encryptedMessage: note.encryptedMessage.data,
    IV: note.encryptedMessage.IV,
  })
  
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

const getNoteStatus = async (id) => {
  const response = await apiGet(`/api/note/${id}/status`)
  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`Note ${id} did not exist`)
      return {
        exists: false,
        hasBurned: null,
        hasBeenRead: null,
      }
    }
    throw new Error(`Getting status for ${id} did not work!`)
  }
  const status = await response.json()
  
  const { hasBurned, hasBeenRead } = status
  
  console.log(`Status for note ${id} is:`, status)
  return {
    exists: true,
    hasBurned,
    hasBeenRead,
  }
}

export {
  secrets,
  createNote,
  getNote,
  getNoteStatus,
  
}
