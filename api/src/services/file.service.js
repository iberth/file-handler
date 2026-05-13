const fetch = require('node-fetch')

// TODO: Move to env variables.
const BASE_URL = 'https://echo-serv.tbxnet.com'
const AUTH_HEADER = 'Bearer aSuperSecretKey'
const HEADERS = { Authorization: AUTH_HEADER }

const HEX_RE = /^[0-9a-f]{32}$/i
const INT_RE = /^-?\d+$/

const parseCSV = (rawText, fileName) => {
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

const fetchFileData = async (fileName) => {
  try {
    const res = await fetch(
      `${BASE_URL}/v1/secret/file/${encodeURIComponent(fileName)}`,
      { headers: HEADERS },
    )

    if (!res.ok) return null

    const text = await res.text()
    const lines = parseCSV(text, fileName)

    if (lines.length === 0) return null

    return { file: fileName, lines }
  } catch {
    return null
  }
}

const getFileList = async () => {
  const res = await fetch(`${BASE_URL}/v1/secret/files`, { headers: HEADERS })

  if (!res.ok) throw new Error(`File list fetch failed: ${res.status}`)

  const data = await res.json()

  return data
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
