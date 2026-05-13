const express = require('express')
const cors = require('cors')
const fileRouter = require('./routes/file.route')

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET'],
  }),
)

app.use(express.json())
app.use('/files', fileRouter)

module.exports = app
