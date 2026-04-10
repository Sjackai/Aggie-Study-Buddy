const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

const COOLDOWN_MINUTES = 30

// GET MY GROUP CHATS
router.get('/', authMiddleware, async (req, res) => {
  try {
    const memberships = await prisma.groupChatMember.findMany({
      where: {
        userId: req.userId,
        leftAt: null
      },
      include: {
        groupChat: {
          include: {
            session: {
              select: { id: true, courseCode: true, courseName: true, date: true, time: true, hostId: true }
            },
            members: {
              where: { leftAt: null },
              include: {
                user: { select: { id: true, name: true } }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: { select: { id: true, name: true } }
              }
            }
          }
        }
      }
    })

    const now = new Date()
    const activeChats = memberships
      .filter(m => new Date(m.groupChat.expiresAt) > now)
      .map(m => m.groupChat)

    res.json(activeChats)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch group chats' })
  }
})

// GET MESSAGES FOR A GROUP CHAT
router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.groupChatMessage.findMany({
      where: { groupChatId: req.params.id },
      include: {
        sender: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'asc' }
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' })
  }
})

// SEND MESSAGE TO GROUP CHAT
router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body

    // Check user is a member
    const membership = await prisma.groupChatMember.findFirst({
      where: { groupChatId: req.params.id, userId: req.userId, leftAt: null }
    })
    if (!membership) return res.status(403).json({ error: 'You are not in this chat' })

    const message = await prisma.groupChatMessage.create({
      data: {
        groupChatId: req.params.id,
        senderId: req.userId,
        text
      },
      include: {
        sender: { select: { id: true, name: true } }
      }
    })
    res.json(message)
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' })
  }
})

// LEAVE GROUP CHAT
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    await prisma.groupChatMember.updateMany({
      where: { groupChatId: req.params.id, userId: req.userId },
      data: { leftAt: new Date() }
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to leave chat' })
  }
})

// REJOIN REQUEST (checks cooldown)
router.post('/:id/rejoin', authMiddleware, async (req, res) => {
  try {
    const groupChat = await prisma.groupChat.findUnique({
      where: { id: req.params.id },
      include: { session: true }
    })
    if (!groupChat) return res.status(404).json({ error: 'Chat not found' })

    // Check if user left recently
    const lastMembership = await prisma.groupChatMember.findFirst({
      where: { groupChatId: req.params.id, userId: req.userId, leftAt: { not: null } },
      orderBy: { leftAt: 'desc' }
    })

    if (lastMembership) {
      const minutesSinceLeft = (new Date() - new Date(lastMembership.leftAt)) / (1000 * 60)
      if (minutesSinceLeft < COOLDOWN_MINUTES) {
        const minutesLeft = Math.ceil(COOLDOWN_MINUTES - minutesSinceLeft)
        return res.status(400).json({
          error: `Cooldown active. You can rejoin in ${minutesLeft} minutes or ask the host to approve you.`,
          cooldown: true,
          minutesLeft
        })
      }
    }

    // Check if already a member
    const existing = await prisma.groupChatMember.findFirst({
      where: { groupChatId: req.params.id, userId: req.userId, leftAt: null }
    })
    if (existing) return res.status(400).json({ error: 'Already in this chat' })

    await prisma.groupChatMember.create({
      data: { groupChatId: req.params.id, userId: req.userId }
    })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to rejoin chat' })
  }
})

// HOST APPROVE REJOIN
router.post('/:id/approve/:userId', authMiddleware, async (req, res) => {
  try {
    const groupChat = await prisma.groupChat.findUnique({
      where: { id: req.params.id },
      include: { session: true }
    })

    if (!groupChat) return res.status(404).json({ error: 'Chat not found' })
    if (groupChat.session.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only the host can approve rejoins' })
    }

    // Add them back
    const existing = await prisma.groupChatMember.findFirst({
      where: { groupChatId: req.params.id, userId: req.params.userId, leftAt: null }
    })
    if (existing) return res.status(400).json({ error: 'Already in chat' })

    await prisma.groupChatMember.create({
      data: { groupChatId: req.params.id, userId: req.params.userId, approved: true }
    })

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve rejoin' })
  }
})

module.exports = router