const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

router.get('/', authMiddleware, async (req, res) => {
  try {
    // Connection requests
    const connectionRequestDetails = await prisma.connection.findMany({
      where: { toUserId: req.userId, status: 'pending' },
      include: {
        fromUser: { select: { id: true, name: true, major: true } }
      }
    })

    // Message requests
    const messageRequestDetails = await prisma.message.findMany({
      where: {
        receiverId: req.userId,
        isRequest: true,
        accepted: false,
        declined: false
      },
      distinct: ['senderId'],
      include: {
        sender: { select: { id: true, name: true, major: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Unread direct messages
    const unreadDirectDetails = await prisma.message.findMany({
      where: {
        receiverId: req.userId,
        read: false,
        isRequest: false
      },
      distinct: ['senderId'],
      include: {
        sender: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Unread group chat messages
    const memberships = await prisma.groupChatMember.findMany({
      where: { userId: req.userId, leftAt: null },
      select: {
        lastRead: true,
        groupChat: {
          select: {
            id: true,
            name: true,
            expiresAt: true,
            messages: {
              where: { senderId: { not: req.userId } },
              select: { id: true, createdAt: true, text: true, sender: { select: { name: true } } },
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    const now = new Date()
    const unreadGroupDetails = []

    for (const membership of memberships) {
      if (new Date(membership.groupChat.expiresAt) < now) continue
      const unreadMessages = membership.groupChat.messages.filter(
        msg => new Date(msg.createdAt) > new Date(membership.lastRead)
      )
      if (unreadMessages.length > 0) {
        unreadGroupDetails.push({
          chatId: membership.groupChat.id,
          chatName: membership.groupChat.name,
          unreadCount: unreadMessages.length,
          lastMessage: unreadMessages[0]?.text || null,
          lastSender: unreadMessages[0]?.sender?.name || null
        })
      }
    }

    const total = connectionRequestDetails.length +
      messageRequestDetails.length +
      unreadDirectDetails.length +
      unreadGroupDetails.length

    res.json({
      total,
      connectionRequests: connectionRequestDetails,
      messageRequests: messageRequestDetails.map(m => ({
        userId: m.senderId,
        name: m.sender.name,
        major: m.sender.major,
        lastMessage: m.text
      })),
      unreadDirect: unreadDirectDetails.map(m => ({
        userId: m.senderId,
        name: m.sender.name,
        lastMessage: m.text
      })),
      unreadGroup: unreadGroupDetails
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

// MARK GROUP CHAT AS READ
router.post('/groupchat/:id/read', authMiddleware, async (req, res) => {
  try {
    const result = await prisma.groupChatMember.updateMany({
      where: {
        groupChatId: req.params.id,
        userId: req.userId
      },
      data: { lastRead: new Date() }
    })
    console.log('Marked as read:', result)
    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to mark as read' })
  }
})
// GET NOTIFICATION HISTORY (last 7 days, read/resolved)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Resolved connection requests
    const resolvedConnections = await prisma.connection.findMany({
      where: {
        toUserId: req.userId,
        status: { in: ['accepted', 'declined'] },
        updatedAt: { gte: sevenDaysAgo }
      },
      include: {
        fromUser: { select: { id: true, name: true, major: true, avatar: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // Read direct messages
    const readMessages = await prisma.message.findMany({
      where: {
        receiverId: req.userId,
        read: true,
        isRequest: false,
        createdAt: { gte: sevenDaysAgo }
      },
      distinct: ['senderId'],
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json({
      resolvedConnections: resolvedConnections.map(c => ({
        id: c.id,
        name: c.fromUser.name,
        major: c.fromUser.major,
        avatar: c.fromUser.avatar,
        status: c.status,
        date: c.updatedAt
      })),
      readMessages: readMessages.map(m => ({
        userId: m.senderId,
        name: m.sender.name,
        avatar: m.sender.avatar,
        lastMessage: m.text,
        date: m.createdAt
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch notification history' })
  }
})
// GET NOTIFICATION HISTORY (last 7 days, read/resolved)
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Resolved connection requests
    const resolvedConnections = await prisma.connection.findMany({
      where: {
        toUserId: req.userId,
        status: { in: ['accepted', 'declined'] },
        updatedAt: { gte: sevenDaysAgo }
      },
      include: {
        fromUser: { select: { id: true, name: true, major: true, avatar: true } }
      },
      orderBy: { updatedAt: 'desc' },
      take: 10
    })

    // Read direct messages
    const readMessages = await prisma.message.findMany({
      where: {
        receiverId: req.userId,
        read: true,
        isRequest: false,
        createdAt: { gte: sevenDaysAgo }
      },
      distinct: ['senderId'],
      include: {
        sender: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    res.json({
      resolvedConnections: resolvedConnections.map(c => ({
        id: c.id,
        name: c.fromUser.name,
        major: c.fromUser.major,
        avatar: c.fromUser.avatar,
        status: c.status,
        date: c.updatedAt
      })),
      readMessages: readMessages.map(m => ({
        userId: m.senderId,
        name: m.sender.name,
        avatar: m.sender.avatar,
        lastMessage: m.text,
        date: m.createdAt
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch notification history' })
  }
})
module.exports = router