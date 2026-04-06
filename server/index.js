const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/sessions', require('./routes/sessions'))
app.use('/api/users', require('./routes/users'))
app.use('/api/connections', require('./routes/connections'))

app.get('/', (req, res) => {
  res.json({ message: 'Aggie StudyBuddy API is running!' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})