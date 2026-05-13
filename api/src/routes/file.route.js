const express = require('express')

const {
  getFileList,
  getAllFilesData,
} = require('../controllers/file.controller')

const router = express.Router()

router.get('/list', getFileList)
router.get('/data', getAllFilesData)

module.exports = router
