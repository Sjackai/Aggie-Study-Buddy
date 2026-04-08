const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET ALL MY MESSAGES (grouped as threads)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId },
          { receiverId: req.userId }
        ]
      },
      include: {
        sender: { select: { id: true, name: true, major: true } },
        receiver: { select: { id: true, name: true, major: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Group into threads by the other person
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

// GET THREAD WITH A SPECIFIC USER
router.get('/:userId', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.userId, receiverId: req.params.userId },
          { senderId: req.params.userId, receiverId: req.userId }
        ]
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
        receiverId: req.userId
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
    const message = await prisma.message.create({
      data: {
        senderId: req.userId,
        receiverId,
        text
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } }
      }
    })
    res.json(message)
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

module.exports = router