const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET MY KUDOS AND STARZ
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const kudos = await prisma.kudos.findMany({
      where: { toUserId: req.userId },
      include: {
        fromUser: { select: { id: true, name: true } },
        session: { select: { id: true, courseCode: true } }
      }
    })

    const starz = await prisma.buddyStarz.findMany({
      where: { toUserId: req.userId }
    })

    const tagCounts = {}
    kudos.forEach(k => {
      if (!tagCounts[k.tag]) tagCounts[k.tag] = 0
      tagCounts[k.tag]++
    })

    const totalStarz = Math.floor(starz.reduce((sum, s) => sum + s.amount, 0))

    const getTier = (starz) => {
      if (starz >= 2500) return { label: 'Legend', emoji: '👑' }
      if (starz >= 1000) return { label: 'Platinum', emoji: '💎' }
      if (starz >= 500) return { label: 'Gold', emoji: '🥇' }
      if (starz >= 100) return { label: 'Silver', emoji: '🥈' }
      return { label: 'Bronze', emoji: '🥉' }
    }

    res.json({ kudos, tagCounts, totalStarz, tier: getTier(totalStarz) })
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

    const starz = await prisma.buddyStarz.findMany({
      where: { toUserId: req.params.userId }
    })

    const tagCounts = {}
    kudos.forEach(k => {
      if (!tagCounts[k.tag]) tagCounts[k.tag] = 0
      tagCounts[k.tag]++
    })

    const totalStarz = Math.floor(starz.reduce((sum, s) => sum + s.amount, 0))

    const getTier = (starz) => {
      if (starz >= 2500) return { label: 'Legend', emoji: '👑' }
      if (starz >= 1000) return { label: 'Platinum', emoji: '💎' }
      if (starz >= 500) return { label: 'Gold', emoji: '🥇' }
      if (starz >= 100) return { label: 'Silver', emoji: '🥈' }
      return { label: 'Bronze', emoji: '🥉' }
    }

    res.json({ tagCounts, totalStarz, tier: getTier(totalStarz) })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch kudos' })
  }
})

// GET SESSIONS ELIGIBLE FOR KUDOS (ended in last 24hrs, not yet given kudos)
router.get('/eligible', authMiddleware, async (req, res) => {
  try {
    const now = new Date()
    const yesterday = new Date(now - 24 * 60 * 60 * 1000)
    const todayStr = now.toISOString().split('T')[0]
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    // Get sessions user was in that ended in last 24hrs
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

    // Filter out sessions where user already gave kudos to everyone
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
        eligibleSessions.push({
          ...session,
          pendingUsers
        })
      }
    }

    res.json(eligibleSessions)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch eligible sessions' })
  }
})

// SEND KUDOS TO MULTIPLE PEOPLE IN A SESSION (1 tag per person)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sessionId, kudosList } = req.body
    // kudosList = [{ toUserId, tag }, { toUserId, tag }, ...]

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { members: true }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })

    // Verify sender was in session
    const sessionUserIds = [session.hostId, ...session.members.map(m => m.userId)]
    if (!sessionUserIds.includes(req.userId)) {
      return res.status(403).json({ error: 'You were not in this session' })
    }

    // Check 24hr window
    const sessionDate = new Date(session.date)
    const now = new Date()
    const diffHours = (now - sessionDate) / (1000 * 60 * 60)
    if (diffHours > 24) {
      return res.status(400).json({ error: 'Kudos window has expired (24 hours)' })
    }

    // Process each kudos
    for (const { toUserId, tag } of kudosList) {
      if (!tag || !toUserId) continue
      if (!sessionUserIds.includes(toUserId)) continue

      // Check if already sent kudos to this person for this session
      const existing = await prisma.kudos.findFirst({
        where: { fromUserId: req.userId, toUserId, sessionId }
      })
      if (existing) continue

      // Create kudos
      await prisma.kudos.create({
        data: { fromUserId: req.userId, toUserId, sessionId, tag }
      })

      // Calculate weighted BuddyStarz
      const giverStarz = await prisma.buddyStarz.findMany({
        where: { toUserId: req.userId }
      })
      const giverTotal = giverStarz.reduce((sum, s) => sum + s.amount, 0)

      let starAmount = 1
      if (giverTotal < 10) starAmount = 0.1
      else if (giverTotal < 100) starAmount = 0.5
      else if (giverTotal < 500) starAmount = 0.8
      else starAmount = 1

      // Max 1 BuddyStar per person per session
      const existingStarz = await prisma.buddyStarz.findFirst({
        where: { fromUserId: req.userId, toUserId, sessionId }
      })

      if (!existingStarz) {
        await prisma.buddyStarz.create({
          data: { fromUserId: req.userId, toUserId, sessionId, amount: starAmount }
        })
      }
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to send kudos' })
  }
})

module.exports = router