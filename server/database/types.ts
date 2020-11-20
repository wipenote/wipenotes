/**
 * Id of note.
 */
export type NoteId = string

export interface Note {
    encryptedMessage: {
        data: number[]
        IV: number[]
    }
    messageLength: number
    files: Array<{
        data: number[]
        IV: number[]
    }>
    burnTime: number
    burnDate: number
    burnDateValue: string
    encryptionScheme?: any
}

export interface NoteStatus {
  hasBurned: boolean
  files?: number
  messageLength?: number
  burnDate?: string
}

export interface Database {
    startDatabase(): Promise<any>

    storeNote(note: Note): Promise<NoteId>

    getNote(noteId: NoteId): Promise<Note>

    getNoteStatus(noteId: NoteId): Promise<NoteStatus>

    noteExists(noteId: NoteId): Promise<boolean>

    hasBurned(noteId: NoteId): Promise<boolean>

    stopDatabase(): Promise<any>
}

export type GoogleStorageOptions = {
  keyFilename: string
  bucket: string
}

export type S3StorageOptions = {
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  endpoint: string,
  bucket: string,
  basePath: string,
}

export type S3StorageNoteStatusFile = {
  messageLength: number
  filesLength: number
  burnTime: number
  burnDate: number
  burnDateValue: string
}

export type S3StorageNoteFullFile = {
  encryptedMessage: {
    data: number[]
    IV: number[]
  }
  messageLength: number
  files: Array<{
    data: number[]
    IV: number[]
  }>
  burnTime: number
  burnDate: number
  burnDateValue: string
  encryptionScheme?: any
}

export type GoogleStorageNoteStatusFile = {
  messageLength: number
  filesLength: number
  burnTime: number
  burnDate: number
  burnDateValue: string
}

export type GoogleStorageNoteFullFile = {
  encryptedMessage: {
    data: number[]
    IV: number[]
  }
  messageLength: number
  files: Array<{
    data: number[]
    IV: number[]
  }>
  burnTime: number
  burnDate: number
  burnDateValue: string
  encryptionScheme?: any
}
