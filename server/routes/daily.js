const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// GET TODAY'S FACT
router.get('/fact', async (req, res) => {
  try {
    const facts = await prisma.hBCUFact.findMany()
    if (facts.length === 0) return res.status(404).json({ error: 'No facts found' })
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    const fact = facts[dayOfYear % facts.length]
    res.json(fact)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch fact' })
  }
})

// GET TODAY IN HBCU HISTORY
router.get('/history', async (req, res) => {
  try {
    const today = new Date()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const todayStr = `${month}-${day}`

    const events = await prisma.historyEvent.findMany({
      where: { date: todayStr },
      orderBy: { year: 'asc' }
    })

    res.json(events)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch history' })
  }
})

// GET TODAY'S NEW SESSIONS
router.get('/sessions', async (req, res) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const sessions = await prisma.session.findMany({
      where: {
        createdAt: { gte: today }
      },
      include: {
        host: { select: { id: true, name: true, avatar: true, borderColor: true } },
        members: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(sessions)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

module.exports = router