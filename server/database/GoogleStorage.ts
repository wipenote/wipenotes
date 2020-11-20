import {logger} from '../logger'
import {
  NoteId,
  Note,
  Database,
  GoogleStorageOptions, GoogleStorageNoteStatusFile, GoogleStorageNoteFullFile,
} from './types'
import {generateId, HandledError} from '../utils';
import {Storage} from '@google-cloud/storage';

export class GoogleStorage implements Database {
  private storage: Storage
  private bucket: string

  constructor(options: GoogleStorageOptions) {
    this.storage = new Storage(options);
    this.bucket = options.bucket
  }

  async startDatabase() {}

  async storeNote(note: Note) {
    let id = generateId()

    const filename = `${id}.json`
    const bucket = await this.storage.bucket(this.bucket)

    const noteInfoObject: GoogleStorageNoteStatusFile = {
      messageLength: note.messageLength,
      filesLength: Array.isArray(note.files) ? note.files.length : 0,
      burnDate: note.burnDate,
      burnTime: note.burnTime,
      burnDateValue: note.burnDateValue,
    }

    const noteFullObject: GoogleStorageNoteFullFile = {
      ...noteInfoObject,
      encryptedMessage: note.encryptedMessage,
      encryptionScheme: note.encryptionScheme,
      files: note.files,
    }

    const infoNoteFilename = `${id}_info.json`
    const fullNoteFilename = `${id}_full.json`

    const fullNote = await bucket
      .file(fullNoteFilename)
      .save(JSON.stringify(noteFullObject))

    const infoNote = await bucket
      .file(infoNoteFilename)
      .save(JSON.stringify(noteInfoObject))


    return id
  }

  async getNoteStatus(noteId: NoteId) {
    const isNoteExist = await this.noteExists(noteId)
    if (!isNoteExist) {
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted.`, 404)
    }

    const infoNoteFilename = `${noteId}_info.json`
    const bucket = await this.storage.bucket(this.bucket)

    const infoNote = await bucket
      .file(infoNoteFilename)
      .download()
    const infoNoteFileData = infoNote[0]
    console.log('infonote', infoNote)
    const note: GoogleStorageNoteStatusFile = JSON.parse(infoNoteFileData.toString('utf-8') || '')

    if (!note) {
      return {
        hasBurned: true,
      }
    }
    const currentTime = Date.now()
    if (note.burnDate && currentTime >= note.burnDate) {
      await this.deleteNoteFiles(noteId)
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted`, 404)
    }

    return {
      hasBurned: false,
      files: note.filesLength,
      messageLength: note.messageLength,
      burnDate: note.burnDateValue,
    }
  }

  async getNote(noteId: NoteId) {

    let note: GoogleStorageNoteFullFile

    try {
      const bucket = await this.storage.bucket(this.bucket)

      const infoNoteFile = await bucket.file(`${noteId}_full.json`).download()
      const infoNoteFileData = infoNoteFile[0]

      note = JSON.parse(infoNoteFileData.toString('utf-8') || '')
    } catch (e) {
      console.error(e)
      throw new HandledError(`Note with Id "${noteId}" does not exist.`)
    }

    const currentTime = Date.now()
    if (note.burnDate && currentTime >= note.burnDate) {

      await this.deleteNoteFiles(noteId)
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted`, 404)
    } else {
      await this.deleteNoteFiles(noteId)
    }

    return note
  }

  async deleteNoteFiles(noteId: NoteId) {
    const bucket = await this.storage.bucket(this.bucket)

    const infoNoteFile = bucket.file(`${noteId}_info.json`);
    const fullNoteFile = bucket.file(`${noteId}_full.json`);

    return await Promise.all([
      infoNoteFile.delete(),
      fullNoteFile.delete(),
    ])
  }

  async noteExists(noteId: NoteId) {
    const bucket = await this.storage.bucket(this.bucket)

    const infoNoteFile = await bucket.file(`${noteId}_info.json`).exists();
    return infoNoteFile[0]
  }

  async hasBurned(noteId: NoteId) {
    const bucket = await this.storage.bucket(this.bucket)

    const infoNoteFile = await bucket.file(`${noteId}_info.json`).exists();
    if (!infoNoteFile) {
      throw new Error(`Note with id "${noteId}" does not exist. Cannot check if burnt.`)
    }

    const infoNoteFileData = await bucket.file(`${noteId}_info.json`).download()
    const note = JSON.parse(infoNoteFileData[0].toString('utf-8') || '')
    return note.burnDate < Date.now()
  }

  async stopDatabase() {
    logger.info(`Disconnecting from redis`)
    // await this.redis.quit()
  }
}
