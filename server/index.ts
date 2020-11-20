
require('dotenv').config()
import express from 'express'
import expressPino from 'express-pino-logger'
import helmet from 'helmet'
import * as nunjucks from 'nunjucks'
import * as bodyParser from 'body-parser'
import cors from 'cors'

import * as database from './database'
import * as utils from './utils'

import {
  Config,
} from './config'
import {logger} from './logger'

let db: database.Database

const burnDateLabels = {
  'immediately': 0,
  '30_sec': 1000 * 30,
  '15_min': 1000 * 60 * 15,
  '30_min': 1000 * 60 * 30,
  '1_hour': 1000 * 60 * 60,
  '3_hours': 1000 * 60 * 60 * 3,
  '24_hours': 1000 * 60 * 60 * 24,
}

const getBurnDateFromLabel = (label: string) => {
  return burnDateLabels[label] || 0
}

const validateNote = (note: any) => {
  return (
    Number.isInteger(note.allowedReads) &&
    note.allowedReads > 0 &&
    Number.isInteger(note.burnDate) &&
    note.burnDate > Date.now() &&
    Array.isArray(note.encryptedMessage) &&
    Array.isArray(note.fingerprint) &&
    Array.isArray(note.IV)
  )
}

const initApp = async () => {

  db = Config.initDatabase()
  await db.startDatabase()

  const app = express()
  app.set('view engine', 'njk');

  nunjucks.configure('server/templates', {
    autoescape: true,
    express: app,
    noCache: true
  });
  app.use(bodyParser.urlencoded({
    extended: false,
    limit: '50mb'
  }))

  app.use(bodyParser.json({
    limit: '150mb'
  }))

  app.use(helmet())
  app.use(cors())
  app.use('/assets', express.static(__dirname + '/public'));

  if (Config.enableExpressLogging()) {
    app.use(expressPino({logger}))
  }

  app.get('/about-us', (req: express.Request, res: express.Response) => {
    res.render('pages/about-us');
  })

  app.get(
    '/api/note/:ID/status',
    async function (req: express.Request, res: express.Response) {
      try {
        const {ID} = req.params

        const noteStatus = await db.getNoteStatus(ID)
        logger.info(`Returning status of note with ID ${ID}`)
        res.json(noteStatus)
      } catch (err) {
        logger.error({
          message: `GET /api/note/:ID/status Got error when loading status of note`,
          error: err,
        })
        await utils.errorJSON(err, res)
        // res.sendStatus(500)
      }
    }
  )

  app.get(
    '/api/note/:ID',
    async (req: express.Request, res: express.Response) => {
      try {
        const {ID} = req.params

        const exists = await db.noteExists(ID)
        console.log('exists', exists)
        if (!exists) {
          logger.error(
            `Tried to access Note ${ID} but no such note exists`
          )
          res.sendStatus(404)
          return
        }

        const note = await db.getNote(ID)
        console.log('note', note)
        logger.info(`Retrieved note "${ID}" and sending it back`)
        res.json(note)
      } catch (error) {
        console.error('get note', error)
        logger.error('GET /api/note/:ID', error)
        res.sendStatus(500)
      }
    }
  )

  app.post(
    '/api/note',
    async (req: express.Request, res: express.Response) => {
      try {
        const {
          encryptedMessage,
          messageLength,
          burnDate,
          encryptionScheme,
          files,
        } = req.body
        const burnTime = getBurnDateFromLabel(burnDate)
        const note: database.Note = {
          encryptedMessage,
          messageLength,
          burnDate: burnTime ? Date.now() + burnTime : 0,
          burnTime,
          burnDateValue: burnDate,
          encryptionScheme,
          files,
        }

        // if (!validateNote(note)) {
        //     logger.error({
        //         message: `NOTE: ${note} was not a valid note!`,
        //         note,
        //     })
        //     res.sendStatus(400)
        //     return
        // }

        const ID = await db.storeNote(note)
        logger.info(`Created note: ${ID}`)
        res.json({ID})
      } catch (error) {
        logger.error('POST /api/note', error)
        res.sendStatus(500)
      }
    }
  )

  app.get('/', (req: express.Request, res: express.Response) => {
    try {
      return res.render('pages/home');
    } catch (err) {
      logger.error(
        'User tried to get note at ' +
        req.path +
        ' but got error ' +
        err
      )
      res.sendStatus(500)
    }
  })

  app.get('/:noteId', (req: express.Request, res: express.Response) => {
    try {
      return res.render('pages/home');
    } catch (err) {
      logger.error(
        'User tried to get note at ' +
        req.path +
        ' but got error ' +
        err
      )
      res.sendStatus(500)
    }
  })
  app.get('/:noteId/note-created', (req: express.Request, res: express.Response) => {
    try {
      return res.render('pages/home');
    } catch (err) {
      logger.error(
        'User tried to get note at ' +
        req.path +
        ' but got error ' +
        err
      )
      res.sendStatus(500)
    }
  })

  app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = process.env.NODE_ENV === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('pages/error');
  });

  app.listen(3000, () => {
    logger.info('Listening on port 3000')
  })
}

process.on('SIGINT', async () => {
  logger.info('Caught interrupt signal')
  await db.stopDatabase()
  process.exit()
})

initApp()
