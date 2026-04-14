const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// SEARCH USERS
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json([])

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

    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to search users' })
  }
})

// GET MY PREFERENCES
router.get('/preferences', authMiddleware, async (req, res) => {
  try {
    const prefs = await prisma.userPreferences.findUnique({
      where: { userId: req.userId }
    })
    res.json(prefs)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch preferences' })
  }
})

// SAVE MY PREFERENCES
router.post('/preferences', authMiddleware, async (req, res) => {
  try {
    const { studyStyle, studyTime, goals, courses } = req.body
    const prefs = await prisma.userPreferences.upsert({
      where: { userId: req.userId },
      update: { studyStyle, studyTime, goals, courses },
      create: { userId: req.userId, studyStyle, studyTime, goals, courses }
    })
    res.json(prefs)
  } catch (err) {
    res.status(500).json({ error: 'Failed to save preferences' })
  }
})

// GET PUBLIC PROFILE
router.get('/profile/:userId', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      select: {
        id: true,
        name: true,
        major: true,
        year: true,
        bio: true,
        avatar: true,
        createdAt: true
      }
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// GET MY PROFILE
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, avatar: true, isPrivate: true, createdAt: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// GET STUDY PARTNERS - grouped by relationship
router.get('/partners', authMiddleware, async (req, res) => {
  try {
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        preferences: true,
        connectionsFrom: {
          where: { status: 'accepted' },
          select: { toUserId: true }
        },
        connectionsTo: {
          where: { status: 'accepted' },
          select: { fromUserId: true }
        }
      }
    })

    const myConnectionIds = [
      ...currentUser.connectionsFrom.map(c => c.toUserId),
      ...currentUser.connectionsTo.map(c => c.fromUserId)
    ]

    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: req.userId },
        isPrivate: false
      },
      select: {
        id: true,
        name: true,
        major: true,
        year: true,
        bio: true,
        avatar: true,
        preferences: true,
        connectionsFrom: {
          where: { status: 'accepted' },
          select: { toUserId: true }
        },
        connectionsTo: {
          where: { status: 'accepted' },
          select: { fromUserId: true }
        },
        hostedSessions: { select: { id: true } },
        sessionMembers: { select: { id: true } }
      }
    })

    const myCourses = currentUser.preferences?.courses || []
    const myMajor = currentUser.major

    const inMyCourses = []
    const mutualConnections = []
    const sameMajor = []
    const discover = []

    for (const user of allUsers) {
      const userConnectionIds = [
        ...user.connectionsFrom.map(c => c.toUserId),
        ...user.connectionsTo.map(c => c.fromUserId)
      ]

      const isConnected = myConnectionIds.includes(user.id)
      const userCourses = user.preferences?.courses || []
      const sharedCourses = myCourses.filter(c => userCourses.includes(c))
      const mutuals = userConnectionIds.filter(id => myConnectionIds.includes(id))
      const sessionCount = user.hostedSessions.length + user.sessionMembers.length

      const userData = {
        id: user.id,
        name: user.name,
        major: user.major,
        year: user.year,
        bio: user.bio,
        avatar: user.avatar,
        isConnected,
        sharedCourses,
        mutualCount: mutuals.length,
        sessionCount
      }

      if (sharedCourses.length > 0) {
        inMyCourses.push(userData)
      } else if (mutuals.length > 0 && myConnectionIds.length > 0) {
        mutualConnections.push(userData)
      } else if (user.major === myMajor && myMajor) {
        sameMajor.push(userData)
      } else {
        discover.push(userData)
      }
    }

    inMyCourses.sort((a, b) => b.sharedCourses.length - a.sharedCourses.length)
    mutualConnections.sort((a, b) => b.mutualCount - a.mutualCount)
    sameMajor.sort((a, b) => b.sessionCount - a.sessionCount)
    discover.sort((a, b) => b.sessionCount - a.sessionCount)

    res.json({ inMyCourses, mutualConnections, sameMajor, discover })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch partners' })
  }
})

// UPDATE PROFILE
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, major, year, bio, avatar, isPrivate } = req.body
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, major, year, bio, avatar, isPrivate },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, avatar: true, isPrivate: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

module.exports = router