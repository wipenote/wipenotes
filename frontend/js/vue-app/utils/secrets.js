import * as hex from './hex'

const KEYSTYLE = 'raw'
export const ENCRYPT_PARAMS = {
  name: 'AES-GCM',
  length: 256,
}
export const FINGERPRINT_MODE = 'SHA-512'

const pwdSalt = new Uint8Array([141, 223, 161, 6, 64, 2, 170, 90]);

export const createKeyFromPassword = async (pwd = '') => {
  var encoder = new TextEncoder('utf-8');
  var passphraseKey = encoder.encode(pwd);
  
  // You should firstly import your passphrase Uint8array into a CryptoKey
  const key = await window.crypto.subtle.importKey(
    'raw',
    passphraseKey,
    {name: 'PBKDF2'},
    false,
    ['deriveBits', 'deriveKey']
  )
  
  return window.crypto.subtle.deriveKey(
    { "name": 'PBKDF2',
      "salt": pwdSalt,
      // don't get too ambitious, or at least remember
      // that low-power phones will access your app
      "iterations": 10,
      "hash": FINGERPRINT_MODE
    },
    key,
    
    // Note: for this demo we don't actually need a cipher suite,
    // but the api requires that it must be specified.
    // For AES the length required to be 128 or 256 bits (not bytes)
    ENCRYPT_PARAMS,
    
    // Whether or not the key is extractable (less secure) or not (more secure)
    // when false, the key can only be passed as a web crypto object, not inspected
    true,
    
    // this web crypto object will only be allowed for these functions
    [ "encrypt", "decrypt" ]
  )
}

const sameArray = (array1, array2) => {
  return (
    array1.length === array2.length &&
    array1.every((elem, idx) => elem === array2[idx])
  )
}

const getRandomIV = () => {
  const array = new Uint8Array(48)
  window.crypto.getRandomValues(array)
  return array
}

const fingerprint = async (message) => {
  const data = new TextEncoder().encode(message)
  const hash = await window.crypto.subtle.digest(FINGERPRINT_MODE, data)
  return hash
}

export const generateKey = async () => {
  return await window.crypto.subtle.generateKey(ENCRYPT_PARAMS, true, [
    'encrypt',
    'decrypt',
  ])
}

export const urlencodeKey = async (key) => {
  const exported = await window.crypto.subtle.exportKey(KEYSTYLE, key)
  const array = new Uint8Array(exported)
  const asJSArray = Array.prototype.slice.call(array)
  return hex.hexEncode(asJSArray)
}

export const urldecodeKey = async (val) => {
  const parsedArray = hex.hexDecode(val)
  const asUint8 = new Uint8Array(parsedArray)
  return await window.crypto.subtle.importKey(
    KEYSTYLE,
    asUint8,
    ENCRYPT_PARAMS.name,
    true,
    ['encrypt', 'decrypt']
  )
}

export const encryptMessage = async (message, key) => {
  const IV = getRandomIV()
  const encoder = new TextEncoder()
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPT_PARAMS.name,
      iv: IV,
      length: ENCRYPT_PARAMS.length,
    },
    key,
    encoder.encode(message)
  )
  
  const encryptedUint8 = new Uint8Array(encrypted)
  
  console.log('encryptMessage', encrypted, encryptedUint8, Array.prototype.slice.call(encryptedUint8))
  
  return {
    data: Array.prototype.slice.call(encryptedUint8),
    IV: Array.prototype.slice.call(IV),
  }
}

export const decryptData = async (key, params) => {
  const { encryptedMessage, IV } = params
  
  return await window.crypto.subtle.decrypt(
    {
      name: ENCRYPT_PARAMS.name,
      iv: IV,
      length: ENCRYPT_PARAMS.length,
    },
    key,
    encryptedMessage
  )
}

export const decryptMessage = async (key, params) => {
  const decrypted = await decryptData(key, params)
  
  const decodedMessage = new TextDecoder().decode(decrypted)
  // const decryptDigest = new Uint32Array(await fingerprint(decodedMessage))
  // const origDigest = new Uint32Array(digest)
  // if (!sameArray(decryptDigest, origDigest)) {
  //   // Technically AES-GCM already contains an integrity check but I want to
  //   // extend the api so that it records what algorithms have been used
  //   // for key derivation and encryption. Therefore I do not want to rely on AES-GCM
  //
  //   throw new Error('Digests are not matching. Wrong message obtained...')
  // }
  //
  return decodedMessage
}

export const encryptFile = async (file, key) => {
  const IV = getRandomIV()
  
  const reader = new FileReader();
  
  const readerPromise = new Promise((resolve, reject) => {
    reader.onload = function(e) {
      resolve(e.target.result)
    }
  })
  
  reader.readAsArrayBuffer(file);
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: ENCRYPT_PARAMS.name,
      iv: IV,
      length: ENCRYPT_PARAMS.length,
    },
    key,
    await readerPromise,
  )
  
  const fileMetadata = {
    name: file.name,
    lastModified: file.lastModified,
    size: file.size,
    type: file.type,
  }
  console.log('encryptFile', encrypted, file, fileMetadata)
  const encryptedUint8 = new Uint8Array(encrypted)
  const encryptedFileMetadata = await encryptMessage(JSON.stringify(fileMetadata), key)
  
  return {
    file: {
      data: Array.prototype.slice.call(encryptedUint8),
      IV: Array.prototype.slice.call(IV),
    },
    metadata: encryptedFileMetadata
  }
}

export const getEncryptionScheme = () => ({
  encrypt: ENCRYPT_PARAMS,
  fingerprint: FINGERPRINT_MODE,
  keystyle: KEYSTYLE,
})
