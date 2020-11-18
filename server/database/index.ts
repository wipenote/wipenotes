export { Database, Log, LogId, Note, NoteId, NoteOptions } from './types'

export { InMemoryDatabase } from './InMemoryDatabase'

export { RedisDatabase } from './RedisDatabase'
export { S3Storage } from './S3Storage'
export { GoogleStorage } from './GoogleStorage'

export { unimplementedFunctionsOfDatabase } from './util'
