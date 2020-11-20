import uuid from 'uuid'
import Redis, {RedisOptions} from 'ioredis'
import * as generator from 'generate-password';

import {logger} from '../logger'

import {NoteId, Note, Database} from './types'
import _ from 'lodash'
import {generateId, HandledError} from "../utils";

export class RedisStorage implements Database {
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
    let id = generateId()

    const doesExist = await this.redis.exists(`note-${id}`)
    if (doesExist) {
      id = generateId()
    }

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

  async getNoteStatus(noteId: NoteId) {
    const doesExist = await this.redis.exists(`note-${noteId}`)
    if (!doesExist) {
      throw new HandledError(`Note with Id "${noteId}" does not exist or was deleted.`, 404)
    }

    const keyValue = await this.redis.get(`note-${noteId}`)

    const note: Note = JSON.parse(keyValue || '')

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
      files: note.files && note.files.length || 0,
      messageLength: note.messageLength,
      burnDate: note.burnDateValue,
    }
  }

  async getNote(noteId: NoteId) {

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

  async stopDatabase() {
    logger.info(`Disconnecting from redis`)
    await this.redis.quit()
  }
}
