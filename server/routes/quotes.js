const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const dayThemes = [
  'Monday Motivation',
  'Tuesday Focus',
  'Wednesday Wisdom',
  'Thursday Grind',
  'Friday Energy',
  'Saturday Scholar',
  'Sunday Reset'
]

router.get('/today', async (req, res) => {
  try {
    const today = new Date()
    const dayOfWeek = today.getDay()

    const themeIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1
    const todayTheme = dayThemes[themeIndex]

    const quotes = await prisma.quote.findMany({
      where: { dayTheme: todayTheme }
    })

    if (quotes.length === 0) return res.status(404).json({ error: 'No quote found' })

    const start = new Date(today.getFullYear(), 0, 0)
    const diff = today - start
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24))
    const quote = quotes[dayOfYear % quotes.length]

    res.json(quote)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch quote' })
  }
})

module.exports = router