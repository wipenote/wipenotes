import * as database from "./database";

const databaseConstructorsList = {
  'redis': () => {
    const databaseConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIST_PORT ? +process.env.REDIST_PORT : 6379,
      password: process.env.REDIS_PASSWORD || '',
    }

    return new database.RedisStorage(databaseConfig)
  },
  's3': () => {
    const databaseConfig = {
      accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      region: process.env.S3_REGION as string,
      endpoint: process.env.S3_ENDPOINT as string,
      bucket: process.env.S3_BUCKET as string,
      basePath: process.env.S3_BASE_PATH as string,
    }

    return new database.S3Storage(databaseConfig)
  },
  'google-storage': () => {
    const databaseConfig = {
      keyFilename: process.env.GOOGLE_STORAGE_KEYFILENAME as string,
      bucket: process.env.GOOGLE_STORAGE_BUCKET as string,
    }

    return new database.GoogleStorage(databaseConfig)
  },
}

export const initDatabase = () => {

  const databaseType = process.env.DATABASE_TYPE

  if (!databaseType) {
    throw new Error('Database type did not specify')
  }

  const databaseConstructor = databaseConstructorsList[databaseType]

  if (!databaseConstructor) {
    throw new Error(`Database type=${databaseType} does not supported `)
  }

  return databaseConstructor()
}


export const Config = {
  enableExpressLogging: () => process.env.ENABLE_EXPRESS_LOGGING,

  initDatabase,
}
