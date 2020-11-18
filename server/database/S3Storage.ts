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
  GoogleStorageOptions,
  S3StorageOptions,
  S3StorageNoteStatusFile, S3StorageNoteFullFile
} from './types'
import _ from 'lodash'
import {generateId, HandledError} from "../utils";
import path from "path";

const AWS = require('aws-sdk');
const {Readable} = require("stream")

/**
 * Database implementation with Redis as backend.
 *
 * Uses [ioredis](https://www.npmjs.com/package/ioredis) as client library.
 *
 * Call `configureRedis(...)` with the same options that you would to ioredis.
 * If calling with no arguments, then just do not call configureRedis.
 * `startDatabase()` will fix that for you.
 */
export class S3Storage implements Database {
  private storage: Storage
  private options: S3StorageOptions

  constructor(options: S3StorageOptions) {
    if (options.basePath && options.basePath.slice(0, 1) === '/') {
      options.basePath = options.basePath.slice(1)
    }

    this.storage = new AWS.S3({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      region: options.region,
      endpoint: options.endpoint,
      bucket: options.bucket,
    });
    this.options = options
  }

  async startDatabase() {
  }

  async storeNote(note: Note) {
    let id = generateId()

    // encryptedMessage,
    //   messageLength,
    //   burnDate: burnTime ? Date.now() + burnTime : 0,
    //   burnTime,
    //   burnDateValue: burnDate,
    //   encryptionScheme,
    //   files,

    const noteInfoObject: S3StorageNoteStatusFile = {
      messageLength: note.messageLength,
      filesLength: Array.isArray(note.files) ? note.files.length : 0,
      burnDate: note.burnDate,
      burnTime: note.burnTime,
      burnDateValue: note.burnDateValue,
    }

    const noteFullObject: S3StorageNoteFullFile = {
      ...noteInfoObject,
      encryptedMessage: note.encryptedMessage,
      encryptionScheme: note.encryptionScheme,
      files: note.files,
    }

    const infoNoteFilename = path.join(this.options.basePath, id, `${id}_info.json`)
    const fullNoteFilename = path.join(this.options.basePath, id, `${id}_full.json`)

    const fullNote = await this.storage.upload(
      {
        Body: Buffer.from(JSON.stringify(noteFullObject)),
        ContentType: 'application/json',
        Bucket: this.options.bucket,
        Key: fullNoteFilename,
      }
    )
      .promise()

    const noteStatus = await this.storage.upload(
      {
        Body: Buffer.from(JSON.stringify(noteInfoObject)),
        ContentType: 'application/json',
        Bucket: this.options.bucket,
        Key: infoNoteFilename,
      }
    )
      .promise()

    return id
  }

  async storeLog(entry: Log) {
    const id = uuid.v4() as LogId
    // const jsonified = JSON.stringify(entry)
    logger.debug(`Storing log ${id} in Redis under log-${id}`)

    return id
  }

  async getNoteStatus(noteId: NoteId) {
    let isObjectExist = false
    try {
      const existObject = await this.storage.headObject({
        Bucket: this.options.bucket,
        Key: path.join(this.options.basePath, noteId, `${noteId}_info.json`),
      })
        .promise()

      isObjectExist = true
    } catch (e) {
      console.error(e)
    }

    if (!isObjectExist) {
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted.`, 404)
    }

    const data = await this.storage
      .getObject({
        Bucket: this.options.bucket,
        Key: path.join(this.options.basePath, noteId, `${noteId}_info.json`),
      })
      .promise()
    // .createReadStream()

    // const doesExist = await this.redis.exists(`note-${noteId}`)

    const note: S3StorageNoteStatusFile = JSON.parse(data.Body.toString('utf-8') || '')

    if (!note) {
      return {
        hasBurned: true,
      }
    }
    const currentTime = Date.now()
    if (note.burnDate && currentTime >= note.burnDate) {
      // await this.redis.del(`note-${noteId}`)
      await this.deleteNoteObjects(noteId)

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

    let note: S3StorageNoteFullFile

    try {
      const noteData = await this.storage
        .getObject({
          Bucket: this.options.bucket,
          Key: path.join(this.options.basePath, noteId, `${noteId}_full.json`),
        })
        .promise()

      note = JSON.parse(noteData.Body.toString('utf-8') || '')
    } catch (e) {
      console.error(e)
      throw new HandledError(`Note with Id "${noteId}" does not exist.`)
    }

    const currentTime = Date.now()
    if (note.burnDate && currentTime >= note.burnDate) {

      // await this.redis.del(`note-${noteId}`)
      await this.deleteNoteObjects(noteId)

      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted`, 404)
    } else {
      await this.deleteNoteObjects(noteId)
    }

    return note
  }

  async deleteNoteObjects(noteId) {
    return this.storage.deleteObjects({
      Bucket: this.options.bucket,
      Delete: {
        Objects: [
          {Key: path.join(this.options.basePath, noteId, `${noteId}_info.json`)},
          {Key: path.join(this.options.basePath, noteId, `${noteId}_full.json`)},
        ]
      },
    })
      .promise()
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
    return JSON.parse('{}')
  }

  async noteExists(noteId: NoteId) {
    // return !!(await this.redis.exists(`note-${noteId}`))
    return true
  }

  async hasBurned(noteId: NoteId) {
    // const noteExists = await this.redis.exists(`note-${noteId}`)
    // if (!noteExists) {
    //   throw new Error(
    //     `Note with id "${noteId}" does not exist. Cannot check if burnt.`
    //   )
    // }

    // const note = JSON.parse((await this.redis.get(`note-${noteId}`)) || '')
    // return note.burnDate < Date.now()
    return false
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
    return true
  }

  async stopDatabase() {
  }
}
