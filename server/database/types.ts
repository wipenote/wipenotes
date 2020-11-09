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
