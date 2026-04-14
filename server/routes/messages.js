const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// Helper — check if two users are connected
const areConnected = async (userId1, userId2) => {
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { fromUserId: userId1, toUserId: userId2, status: 'accepted' },
        { fromUserId: userId2, toUserId: userId1, status: 'accepted' }
      ]
    }
  })
  return !!connection
}

// GET MY THREADS (accepted messages only)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, isRequest: false },
          { receiverId: req.userId, isRequest: false },
          { senderId: req.userId, isRequest: true, accepted: true },
          { receiverId: req.userId, isRequest: true, accepted: true }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, major: true } },
        receiver: { select: { id: true, name: true, major: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const threads = {}
    messages.forEach(msg => {
      const otherId = msg.senderId === req.userId ? msg.receiverId : msg.senderId
      const otherUser = msg.senderId === req.userId ? msg.receiver : msg.sender
      if (!threads[otherId]) {
        threads[otherId] = {
          userId: otherId,
          name: otherUser.name,
          major: otherUser.major,
          messages: [],
          lastMessage: null,
          unread: 0
        }
      }
      threads[otherId].messages.push(msg)
      if (!threads[otherId].lastMessage) {
        threads[otherId].lastMessage = msg
      }
      if (msg.receiverId === req.userId && !msg.read) {
        threads[otherId].unread++
      }
    })

    res.json(Object.values(threads))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// GET MESSAGE REQUESTS
router.get('/requests', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        receiverId: req.userId,
        isRequest: true,
        accepted: false,
        declined: false
      },
      include: {
        sender: { select: { id: true, name: true, major: true, year: true, isPrivate: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group by sender
    const requests = {}
    messages.forEach(msg => {
      if (!requests[msg.senderId]) {
        requests[msg.senderId] = {
          userId: msg.senderId,
          name: msg.sender.name,
          major: msg.sender.major,
          year: msg.sender.year,
          messages: [],
          firstMessage: null
        }
      }
      requests[msg.senderId].messages.push(msg)
      if (!requests[msg.senderId].firstMessage) {
        requests[msg.senderId].firstMessage = msg
      }
    })

    res.json(Object.values(requests))
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch requests' })
  }
})
router.get('/search/users', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json([])

    console.log('Search query:', q, 'userId:', req.userId)

    const users = await prisma.user.findMany({
      where: {
        id: { not: req.userId },
        name: { contains: q, mode: 'insensitive' }
      },
      select: {
        id: true,
        name: true,
        major: true,
        year: true,
        isPrivate: true
      },
      take: 10
    })

    console.log('Results:', users.map(u => u.name))
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to search users' })
  }
})
// GET THREAD WITH A SPECIFIC USER
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.userId }
        ],
        declined: false
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark as read
    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.userId,
        read: false
      },
      data: { read: true }
    })

    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch thread' })
  }
})

// SEND A MESSAGE
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { receiverId, text } = req.body

    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    })
    if (!receiver) return res.status(404).json({ error: 'User not found' })

    const connected = await areConnected(req.userId, receiverId)

    // Check if already has an accepted thread
    const existingAccepted = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: req.userId, receiverId, accepted: true },
          { senderId: receiverId, receiverId: req.userId, accepted: true }
        ]
      }
    })

    const isRequest = !connected && !existingAccepted

    const message = await prisma.message.create({
      data: {
        senderId: req.userId,
        receiverId,
        text,
        isRequest,
        accepted: connected || !!existingAccepted
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    })

    res.json({ ...message, isRequest })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// ACCEPT MESSAGE REQUEST
router.post('/requests/:userId/accept', authMiddleware, async (req, res) => {
  try {
    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.userId,
        isRequest: true
      },
      data: { accepted: true }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to accept request' })
  }
})

// DECLINE MESSAGE REQUEST
router.post('/requests/:userId/decline', authMiddleware, async (req, res) => {
  try {
    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.userId,
        isRequest: true
      },
      data: { declined: true }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline request' })
  }
})




// MARK MESSAGES AS READ
router.post('/:userId/read', authMiddleware, async (req, res) => {
  try {
    await prisma.message.updateMany({
      where: {
        senderId: req.params.userId,
        receiverId: req.userId,
        read: false
      },
      data: { read: true }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' })
  }
})

module.exports = router