const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET MY CONNECTIONS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const connections = await prisma.connection.findMany({
      where: {
        OR: [{ fromUserId: req.userId }, { toUserId: req.userId }]
      },
      include: {
        fromUser: { select: { id: true, name: true, major: true, avatar: true } },
        toUser: { select: { id: true, name: true, major: true, avatar: true } }
      }
    })
    res.json(connections)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch connections' })
  }
})

// SEND CONNECTION REQUEST
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { toUserId } = req.body

    const existing = await prisma.connection.findFirst({
      where: { fromUserId: req.userId, toUserId }
    })
    if (existing) return res.status(400).json({ error: 'Request already sent' })

    const connection = await prisma.connection.create({
      data: { fromUserId: req.userId, toUserId }
    })
    res.json(connection)
  } catch (err) {
    res.status(500).json({ error: 'Failed to send connection request' })
  }
})

// ACCEPT CONNECTION
router.put('/:id/accept', authMiddleware, async (req, res) => {
  try {
    const connection = await prisma.connection.update({
      where: { id: req.params.id },
      data: { status: 'accepted' }
    })
    res.json(connection)
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept connection' })
  }
})

module.exports = router