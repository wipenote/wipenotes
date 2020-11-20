export const LOG_MODE = 'info'
export const LOG_PLUGIN_FILE = process.env.LOG_PLUGIN_FILE || ''
import pino from 'pino'

export const logger = pino(
  {
    level: LOG_MODE,
    prettyPrint: process.env.NODE_ENV !== 'production',
  }
)
