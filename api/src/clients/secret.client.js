const fetch = require('node-fetch')

const BASE_URL = process.env.BASE_URL || ''
const AUTH_HEADER = process.env.API_KEY ? `Bearer ${process.env.API_KEY}` : undefined
const HEADERS = { Authorization: AUTH_HEADER }

const getFiles = async () => {
  const res = await fetch(`${BASE_URL}/v1/secret/files`, { headers: HEADERS })

  if (!res.ok) throw new Error(`File list fetch failed: ${res.status}`)

  return res.json()
}

const getFile = async (fileName) => {
  const res = await fetch(
    `${BASE_URL}/v1/secret/file/${encodeURIComponent(fileName)}`,
    { headers: HEADERS },
  )

  if (!res.ok) return null

  return res.text()
}

module.exports = { getFiles, getFile }
