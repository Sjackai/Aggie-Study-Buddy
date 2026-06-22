const crypto = require('crypto')

const SECRET = process.env.JWT_SECRET || 'fallback-secret'
const WINDOW_SECONDS = 30

// Generate a time-based token for a session, changes every 30 seconds
function generateQRToken(sessionId) {
  const timeStep = Math.floor(Date.now() / 1000 / WINDOW_SECONDS)
  const data = `${sessionId}-${timeStep}`
  const hash = crypto.createHmac('sha256', SECRET).update(data).digest('hex')
  return hash.substring(0, 16)
}

// Verify a token is valid for the current or previous time window (grace period)
function verifyQRToken(sessionId, token) {
  const currentStep = Math.floor(Date.now() / 1000 / WINDOW_SECONDS)
  for (let i = -1; i <= 1; i++) {
    const data = `${sessionId}-${currentStep + i}`
    const hash = crypto.createHmac('sha256', SECRET).update(data).digest('hex')
    if (hash.substring(0, 16) === token) return true
  }
  return false
}

module.exports = { generateQRToken, verifyQRToken, WINDOW_SECONDS }