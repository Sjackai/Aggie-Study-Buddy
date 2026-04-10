const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

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
        rating: true, 
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
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, rating: true, avatar: true, createdAt: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

// GET STUDY PARTNERS
router.get('/partners', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.userId } },
      select: { id: true, name: true, major: true, year: true, bio: true, rating: true, avatar: true },
      take: 20
    })
    res.json(users)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch partners' })
  }
})

// UPDATE PROFILE
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, major, year, bio, avatar } = req.body
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name, major, year, bio, avatar },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, rating: true, avatar: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

module.exports = router