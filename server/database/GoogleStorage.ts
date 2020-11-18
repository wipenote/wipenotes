import uuid from 'uuid'
import * as generator from 'generate-password';

import {logger} from '../logger'

import {
  NoteId,
  LogId,
  Note,
  NoteOptions,
  Log,
  Database,
  GoogleStorageOptions, GoogleStorageNoteStatusFile, GoogleStorageNoteFullFile,
} from './types'
import _ from 'lodash'
import {generateId, HandledError} from "../utils";
import {Storage} from "@google-cloud/storage";
import path from "path";

/**
 * Database implementation with Redis as backend.
 *
 * Uses [ioredis](https://www.npmjs.com/package/ioredis) as client library.
 *
 * Call `configureRedis(...)` with the same options that you would to ioredis.
 * If calling with no arguments, then just do not call configureRedis.
 * `startDatabase()` will fix that for you.
 */
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

  async storeLog(entry: Log) {
    const id = uuid.v4() as LogId
    const jsonified = JSON.stringify(entry)
    logger.debug(`Storing log ${id} in Redis under log-${id}`)

    // await this.redis.set(`log-${id}`, jsonified)
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

  async getNote(noteId: NoteId, options: NoteOptions) {

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

  async getLog(logId: LogId) {
    // const key = `log-${logId}`
    // const doesExist = await this.redis.exists(key as string)
    // if (!doesExist) {
    //   throw new Error(`Log with Id "${logId}" does not exist.`)
    // }
    //
    // const jsonified = (await this.redis.get(key)) || ''
    // logger.debug(`Log ${logId} was read`)
    // return JSON.parse(jsonified)
    return JSON.parse('')
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

  async hasBeenRead(noteId: NoteId) {
    // const noteExists = await this.redis.exists(`note-${noteId}`)
    // if (!noteExists) {
    //   throw new Error(
    //     `Note with id "${noteId}" does not exist. Cannot check read count.`
    //   )
    // }
    //
    // const note = JSON.parse((await this.redis.get(`note-${noteId}`)) || '')
    // const reads = JSON.parse((await this.redis.get(`read-${noteId}`)) || '')
    // return reads.length >= note.allowedReads
    //
    return false
  }

  async stopDatabase() {
    logger.info(`Disconnecting from redis`)
    // await this.redis.quit()
  }
}
