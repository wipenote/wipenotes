const { Router } = require('express');
const axios = require('axios').default;
const {logger} = require('../utils/logger')
const utils = require('../utils')

const database = require('./utils/database')

const router = Router();

router.get(
  '/api/note/:ID/status',
  async (req, res) => {
    try {
      const { ID } = req.params
      if (!utils.isUuidV4(ID)) {
        logger.error(`ID "${ID}" is not a valid UUIDv4`)
        res.sendStatus(400)
        return
      }
      
      const exists = await db.noteExists(ID)
      if (!exists) {
        logger.error(
          `Tried to get status of Note ${ID} but no such note exists`
        )
        res.sendStatus(404)
        return
      }
      const hasBurned = await db.hasBurned(ID)
      const hasBeenRead = await db.hasBeenRead(ID)
      
      logger.info(`Returning status of note with ID ${ID}`)
      res.json({
        hasBeenRead,
        hasBurned,
      })
    } catch (err) {
      logger.error({
        message: `GET /api/note/:ID/status Got error when loading status of note`,
        error: err,
      })
      res.sendStatus(500)
    }
  }
)

router.get(
  '/api/note/:ID',
  async (req, res) => {
    try {
      const { ID } = req.params
      if (!isUuidV4(ID)) {
        logger.error(`ID "${ID}" is not a valid UUIDv4`)
        res.sendStatus(400)
        return
      }
      
      const logId = await createLog(req)
      const exists = await db.noteExists(ID)
      console.log('exists', exists)
      if (!exists) {
        logger.error(
          `Tried to access Note ${ID} but no such note exists`
        )
        res.sendStatus(404)
        return
      }
      
      const options = {
        accessInfo: {
          logId,
        },
        addAccess: true,
        checkAllowedReads: true,
        checkBurnDate: true,
      }
      const note = await db.getNote(ID, options)
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

router.post(
  '/api/note',
  async (req, res) => {
    try {
      const {
        encryptedMessage,
        burnDate,
        encryptionScheme,
        files,
      } = req.body
      const note = {
        encryptedMessage,
        burnDate: utils.getBurnDateFromLabel(burnDate),
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
      
      await utils.createLog(req)
      const ID = await db.storeNote(note)
      logger.info(`Created note: ${ID}`)
      res.json({ ID })
    } catch (error) {
      logger.error('POST /api/note', error)
      res.sendStatus(500)
    }
  }
)

// router.use(routes.home, homeRouter);
router.get('*', async (req, res) => {
  return res.render('pages/home');
});

module.exports = router
