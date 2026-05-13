const secretClient = require('../clients/secret.client')

const HEX_RE = /^[0-9a-f]{32}$/i
const INT_RE = /^-?\d+$/

const parseCSV = (rawText) => {
  const lines = rawText.split('\n')
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()

    if (!line) continue

    const parts = line.split(',')

    if (parts.length !== 4) continue

    const [, text, number, hex] = parts

    if (!text) continue
    if (!INT_RE.test(number)) continue
    if (!HEX_RE.test(hex)) continue

    rows.push({ text, number: parseInt(number, 10), hex })
  }

  return rows
}

const getFileList = async () => {
  return secretClient.getFiles()
}

const fetchFileData = async (fileName) => {
  try {
    const rawText = await secretClient.getFile(fileName)

    if (!rawText) return null

    const lines = parseCSV(rawText)

    if (lines.length === 0) return null

    return { file: fileName, lines }
  } catch {
    return null
  }
}

const getAllFilesData = async (filterName) => {
  const { files } = await getFileList()

  const targets = filterName ? files.filter((f) => f === filterName) : files

  const results = await Promise.all(targets.map(fetchFileData))

  return results.filter(Boolean)
}

module.exports = {
  parseCSV,
  getFileList,
  getAllFilesData,
}
