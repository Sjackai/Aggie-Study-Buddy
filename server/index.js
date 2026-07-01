const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/messages', require('./routes/messages'))
app.use('/api/sessions', require('./routes/sessions'))
app.use('/api/users', require('./routes/users'))
app.use('/api/connections', require('./routes/connections'))
app.use('/api/kudos', require('./routes/kudos'))
app.use('/api/groupchats', require('./routes/groupchats'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/quotes', require('./routes/quotes'))
app.use('/api/upload', require('./routes/upload'))
app.use('/api/daily', require('./routes/daily'))
app.use('/api/games', require('./routes/games'))

app.get('/', (req, res) => {
  res.json({ message: 'Aggie StudyBuddy API is running!' })
})

// Make io accessible to routes
app.set('io', io)

// Socket.io game logic
require('./socket/gameSocket')(io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})