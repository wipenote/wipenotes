/**
 * Id of single note.
 */
export type NoteId = string

/**
 * Id of a single log.
 */
export type LogId = string

/**
 * Note written by user to be saved in the database.
 */
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

/**
 * Log of user access to site.
 */
export interface Log {
    accessUrl: string
    ip: string
    timeOfAccess: number
}

/**
 * Options for retrieving notes.
 */
export interface NoteOptions {
    accessInfo?: any
    addAccess?: boolean
    checkAllowedReads?: boolean
    checkBurnDate?: boolean
}

/**
 * Interface towards database.
 */
export interface Database {
    startDatabase(): Promise<any>

    storeNote(note: Note): Promise<NoteId>

    storeLog(entry: Log): Promise<LogId>

    getNote(noteId: NoteId, options: NoteOptions): Promise<Note>

    getLog(logId: LogId): Promise<Log>

    noteExists(noteId: NoteId): Promise<boolean>

    hasBurned(noteId: NoteId): Promise<boolean>

    hasBeenRead(noteId: NoteId): Promise<boolean>

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
