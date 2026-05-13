const fileService = require('../services/file.service')

/**
 * Retrieves a list of files.
 */
const getFileList = async (req, res) => {
  try {
    const files = await fileService.getFileList()

    res.json(files)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

/**
 * Retrieves all files data.
 */
const getAllFilesData = async (req, res) => {
  try {
    const { fileName } = req.query

    const data = await fileService.getAllFilesData(fileName || null)

    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

/**
 * Exporting the controller methods.
 */
module.exports = {
  getFileList,
  getAllFilesData,
}
