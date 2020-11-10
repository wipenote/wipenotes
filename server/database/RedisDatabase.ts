import uuid from 'uuid'
import Redis, {RedisOptions} from 'ioredis'
import {logger} from '../logger'

import {NoteId, LogId, Note, NoteOptions, Log, Database} from './types'
import _ from 'lodash'
import {HandledError} from "../utils";

/**
 * Database implementation with Redis as backend.
 *
 * Uses [ioredis](https://www.npmjs.com/package/ioredis) as client library.
 *
 * Call `configureRedis(...)` with the same options that you would to ioredis.
 * If calling with no arguments, then just do not call configureRedis.
 * `startDatabase()` will fix that for you.
 */
export class RedisDatabase implements Database {
  private redis: Redis.Redis

  constructor(options?: RedisOptions) {
    this.redis = new Redis(options)
  }

  async startDatabase() {
    if (!_.includes(['connecting', 'connected'], this.redis.status)) {
      logger.info(`Connecting to redis`)
      await this.redis.connect()
    }
  }

  async storeNote(note: Note) {
    const id = uuid.v4() as NoteId
    const jsonified = JSON.stringify(note)
    logger.debug(`Storing note ${id} in Redis under note-${id}`)
    if (note.burnTime) {
      await this.redis.set(`note-${id}`, jsonified, 'EX', note.burnDate)
      await this.redis.set(`read-${id}`, '[]', 'EX', note.burnDate)
    } else {
      await this.redis.set(`note-${id}`, jsonified)
      await this.redis.set(`read-${id}`, '[]')
    }
    return id
  }

  async storeLog(entry: Log) {
    const id = uuid.v4() as LogId
    const jsonified = JSON.stringify(entry)
    logger.debug(`Storing log ${id} in Redis under log-${id}`)
    await this.redis.set(`log-${id}`, jsonified)
    return id
  }

  async getNoteStatus(noteId: NoteId) {
    const doesExist = await this.redis.exists(`note-${noteId}`)
    if (!doesExist) {
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted.`, 404)
    }

    const keyValue = await this.redis.get(`note-${noteId}`)

    const note = JSON.parse(keyValue || '')

    if (!note) {
      return {
        hasBurned: true,
      }
    }
    const currentTime = Date.now()
    if (note.burnDate && currentTime >= note.burnDate) {
      await this.redis.del(`note-${noteId}`)
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted`, 404)
    }

    return {
      hasBurned: false,
      files: note.files.length,
      messageLength: note.messageLength,
    }
  }

  async getNote(noteId: NoteId, options: NoteOptions) {

    const doesExist = await this.redis.exists(`note-${noteId}`)
    if (!doesExist) {
      throw new HandledError(`Note with Id "${noteId}" does not exist.`)
    }

    const keyValue = await this.redis.get(`note-${noteId}`)
    if (!keyValue) {
      throw new HandledError('Note does not exist')
    }

    const note = JSON.parse(keyValue || '')

    const currentTime = Date.now()
    if (note.burnDate && currentTime >= note.burnDate) {
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted`, 404)
    } else {
      await this.redis.del(`note-${noteId}`)
    }

    return note
  }

  async getLog(logId: LogId) {
    const key = `log-${logId}`
    const doesExist = await this.redis.exists(key as string)
    if (!doesExist) {
      throw new Error(`Log with Id "${logId}" does not exist.`)
    }

    const jsonified = (await this.redis.get(key)) || ''
    logger.debug(`Log ${logId} was read`)
    return JSON.parse(jsonified)
  }

  async noteExists(noteId: NoteId) {
    return !!(await this.redis.exists(`note-${noteId}`))
  }

  async hasBurned(noteId: NoteId) {
    const noteExists = await this.redis.exists(`note-${noteId}`)
    if (!noteExists) {
      throw new Error(
        `Note with id "${noteId}" does not exist. Cannot check if burnt.`
      )
    }

    const note = JSON.parse((await this.redis.get(`note-${noteId}`)) || '')
    return note.burnDate < Date.now()
  }

  async hasBeenRead(noteId: NoteId) {
    const noteExists = await this.redis.exists(`note-${noteId}`)
    if (!noteExists) {
      throw new Error(
        `Note with id "${noteId}" does not exist. Cannot check read count.`
      )
    }

    const note = JSON.parse((await this.redis.get(`note-${noteId}`)) || '')
    const reads = JSON.parse((await this.redis.get(`read-${noteId}`)) || '')
    return reads.length >= note.allowedReads
  }

  async stopDatabase() {
    logger.info(`Disconnecting from redis`)
    await this.redis.quit()
  }
}
