const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET MY KUDOS
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const kudos = await prisma.kudos.findMany({
      where: { toUserId: req.userId },
      include: {
        fromUser: { select: { id: true, name: true } },
        session: { select: { id: true, courseCode: true } }
      }
    })

    const tagCounts = {}
    kudos.forEach(k => {
      if (!tagCounts[k.tag]) tagCounts[k.tag] = 0
      tagCounts[k.tag]++
    })

    res.json({ kudos, tagCounts })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kudos' })
  }
})

// GET KUDOS FOR A SPECIFIC USER
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const kudos = await prisma.kudos.findMany({
      where: { toUserId: req.params.userId }
    })

    const tagCounts = {}
    kudos.forEach(k => {
      if (!tagCounts[k.tag]) tagCounts[k.tag] = 0
      tagCounts[k.tag]++
    })

    res.json({ tagCounts })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kudos' })
  }
})

// GET SESSIONS ELIGIBLE FOR KUDOS
router.get('/eligible', authMiddleware, async (req, res) => {
  try {
    const now = new Date()
    const yesterday = new Date(now - 24 * 60 * 60 * 1000)
    const todayStr = now.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const sessions = await prisma.session.findMany({
      where: {
        date: { in: [todayStr, yesterdayStr] },
        OR: [
          { hostId: req.userId },
          { members: { some: { userId: req.userId } } }
        ]
      },
      include: {
        host: { select: { id: true, name: true, major: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, major: true } }
          }
        }
      }
    })

    const eligibleSessions = []
    for (const session of sessions) {
      const sessionUserIds = [
        session.hostId,
        ...session.members.map(m => m.userId)
      ].filter(id => id !== req.userId)

      const alreadyGiven = await prisma.kudos.findMany({
        where: { fromUserId: req.userId, sessionId: session.id }
      })

      const alreadyGivenTo = alreadyGiven.map(k => k.toUserId)
      const pendingUsers = sessionUserIds.filter(id => !alreadyGivenTo.includes(id))

      if (pendingUsers.length > 0) {
        eligibleSessions.push({ ...session, pendingUsers })
      }
    }

    res.json(eligibleSessions)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch eligible sessions' })
  }
})

// SEND KUDOS
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sessionId, kudosList } = req.body

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { members: true }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })

    const sessionUserIds = [session.hostId, ...session.members.map(m => m.userId)]
    if (!sessionUserIds.includes(req.userId)) {
      return res.status(403).json({ error: 'You were not in this session' })
    }

    const sessionDate = new Date(session.date)
    const now = new Date()
    const diffHours = (now - sessionDate) / (1000 * 60 * 60)
    if (diffHours > 24) {
      return res.status(400).json({ error: 'Kudos window has expired (24 hours)' })
    }

    for (const { toUserId, tag } of kudosList) {
      if (!tag || !toUserId) continue
      if (!sessionUserIds.includes(toUserId)) continue

      const existing = await prisma.kudos.findFirst({
        where: { fromUserId: req.userId, toUserId, sessionId }
      })
      if (existing) continue

      await prisma.kudos.create({
        data: { fromUserId: req.userId, toUserId, sessionId, tag }
      })
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send kudos' })
  }
})

module.exports = router