export const LOG_FILE = process.env.LOG_FILE || ''
export const LOG_MODE = process.env.LOG_MODE || 'info'
export const LOG_PLUGIN_FILE = process.env.LOG_PLUGIN_FILE || ''
import pino from 'pino'

export const logger = pino(
    {
        level: LOG_MODE,
        prettyPrint: process.env.NODE_ENV !== 'production',
    }
)

if (LOG_PLUGIN_FILE) {
    try {
        const logPlugin = require(LOG_PLUGIN_FILE) as LogPlugin
        logPlugin.applyPlugin(logger)
    } catch (err) {
        logger.error({
            message: `Could not load logPlugin from: ${LOG_PLUGIN_FILE}`,
            error: err,
        })
    }
}

/**
 * Interface that any log plugin has to conform to.
 */
export interface LogPlugin {
    /**
     * Takes a single argument, the winston logger, and applies anything in the
     * plugin to that logger.
     */
    applyPlugin(logger: pino.Logger)
}
