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
        OR: [{ fromUserId: req.userId }, { toUserId: req.userId }],
        status: 'accepted'
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

// GET PENDING REQUESTS (sent to me)
router.get('/pending', authMiddleware, async (req, res) => {
  try {
    const pending = await prisma.connection.findMany({
      where: {
        toUserId: req.userId,
        status: 'pending'
      },
      include: {
        fromUser: { select: { id: true, name: true, major: true, year: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(pending)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch pending requests' })
  }
})

// SEND CONNECTION REQUEST
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { toUserId } = req.body

    if (toUserId === req.userId) {
      return res.status(400).json({ error: 'You cannot connect with yourself' })
    }

    const existing = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromUserId: req.userId, toUserId },
          { fromUserId: toUserId, toUserId: req.userId }
        ]
      }
    })
    if (existing) return res.status(400).json({ error: 'Connection already exists' })

    const connection = await prisma.connection.create({
      data: { fromUserId: req.userId, toUserId, status: 'pending' }
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

// DECLINE CONNECTION
router.put('/:id/decline', authMiddleware, async (req, res) => {
  try {
    await prisma.connection.delete({
      where: { id: req.params.id }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline connection' })
  }
})

module.exports = router