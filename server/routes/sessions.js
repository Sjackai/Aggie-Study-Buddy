const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET ALL SESSIONS
router.get('/', async (req, res) => {
  try {
    const { course } = req.query
    const sessions = await prisma.session.findMany({
      where: course ? { courseCode: course } : {},
      include: {
        host: { select: { id: true, name: true, rating: true } },
        members: {
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(sessions)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' })
  }
})

// CREATE SESSION
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { courseCode, courseName, date, time, location, description, maxParticipants } = req.body

    const session = await prisma.session.create({
      data: {
        courseCode,
        courseName,
        date,
        time,
        location,
        description,
        maxParticipants: maxParticipants || 6,
        hostId: req.userId
      }
    })

    // Auto create group chat for this session
    const sessionDate = new Date(date)
    const expiresAt = new Date(sessionDate)
    expiresAt.setDate(expiresAt.getDate() + 1) // expires 24hrs after session date

    const groupChat = await prisma.groupChat.create({
      data: {
        name: `${courseCode} Study Session`,
        sessionId: session.id,
        expiresAt
      }
    })

    // Add host to group chat
    await prisma.groupChatMember.create({
      data: { groupChatId: groupChat.id, userId: req.userId }
    })

    res.json(session)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create session' })
  }
})

// JOIN SESSION
router.post('/:id/join', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { members: true, groupChat: true }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.members.length >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' })
    }

    // Check if already a member
    const existing = session.members.find(m => m.userId === req.userId)
    if (existing) return res.status(400).json({ error: 'Already joined this session' })

    const member = await prisma.sessionMember.create({
      data: { sessionId: session.id, userId: req.userId }
    })

    if (session.members.length + 1 >= session.maxParticipants) {
      await prisma.session.update({
        where: { id: session.id },
        data: { status: 'full' }
      })
    }

    // Auto add to group chat
    if (session.groupChat) {
      const alreadyInChat = await prisma.groupChatMember.findFirst({
        where: { groupChatId: session.groupChat.id, userId: req.userId, leftAt: null }
      })
      if (!alreadyInChat) {
        await prisma.groupChatMember.create({
          data: { groupChatId: session.groupChat.id, userId: req.userId }
        })
      }
    }

    res.json(member)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to join session' })
  }
})

module.exports = router