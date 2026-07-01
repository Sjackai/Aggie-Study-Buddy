const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

// GET CURRENT/UPCOMING GAME INFO
router.get('/current', async (req, res) => {
  try {
    const io = req.app.get('io')
    // We'll pass game info through socket, but give HTTP info too
    res.json({ message: 'Connect via socket for live game data' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch game' })
  }
})

// GET LEADERBOARD
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { type = 'alltime' } = req.query

    const leaderboard = await prisma.userXP.findMany({
      orderBy: { totalXP: 'desc' },
      take: 20,
      include: {
        user: {
          select: { id: true, name: true, avatar: true, borderColor: true, isPrivate: true }
        }
      }
    })

    const formatted = leaderboard.map((entry, i) => ({
      rank: i + 1,
      userId: entry.userId,
      name: entry.user.isPrivate ? 'Anonymous Aggie 🐾' : entry.user.name,
      avatar: entry.user.isPrivate ? null : entry.user.avatar,
      totalXP: entry.totalXP,
      gamesPlayed: entry.gamesPlayed,
      gamesWon: entry.gamesWon,
      isPrivate: entry.user.isPrivate
    }))

    res.json(formatted)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

// GET MY XP
router.get('/my-xp', authMiddleware, async (req, res) => {
  try {
    const xp = await prisma.userXP.findUnique({
      where: { userId: req.userId }
    })
    res.json(xp || { totalXP: 0, gamesPlayed: 0, gamesWon: 0, winStreak: 0 })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch XP' })
  }
})



module.exports = router