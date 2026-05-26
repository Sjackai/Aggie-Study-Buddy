const express = require('express')
const router = express.Router()
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? 'set' : 'missing',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'missing'
})

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'aggie-studybuddy/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }]
  }
})

const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'aggie-studybuddy/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 400, crop: 'fill' }]
  }
})

const uploadAvatar = multer({ storage: avatarStorage })
const uploadBanner = multer({ storage: bannerStorage })

// UPLOAD AVATAR
router.post('/avatar', authMiddleware, uploadAvatar.single('image'), async (req, res) => {
  try {
    console.log('Avatar upload hit, file:', req.file)
    if (!req.file) return res.status(400).json({ error: 'No file received' })
    const url = req.file.path
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: url },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, avatar: true, banners: true, borderColor: true, vibeTemplate: true, vibeFill: true, isPrivate: true }
    })
    res.json(user)
  } catch (err) {
    console.error('Avatar upload error:', err)
    res.status(500).json({ error: err.message || 'Failed to upload avatar' })
  }
})

// ADD BANNER (up to 3)
router.post('/banner', authMiddleware, uploadBanner.single('image'), async (req, res) => {
  try {
    console.log('Banner upload hit, file:', req.file)
    if (!req.file) return res.status(400).json({ error: 'No file received' })
    const url = req.file.path

    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { banners: true }
    })

    const currentBanners = currentUser.banners || []

    if (currentBanners.length >= 3) {
      return res.status(400).json({ error: 'Maximum 3 banners allowed' })
    }

    const updatedBanners = [...currentBanners, url]

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { banners: updatedBanners },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, avatar: true, banners: true, borderColor: true, vibeTemplate: true, vibeFill: true, isPrivate: true }
    })
    res.json(user)
  } catch (err) {
    console.error('Banner upload error:', err)
    res.status(500).json({ error: err.message || 'Failed to upload banner' })
  }
})

// REMOVE AVATAR
router.delete('/avatar', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { avatar: null },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, avatar: true, banners: true, borderColor: true, vibeTemplate: true, vibeFill: true, isPrivate: true }
    })
    res.json(user)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove avatar' })
  }
})

// REMOVE BANNER
router.delete('/banner', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body
    const currentUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { banners: true }
    })
    const updatedBanners = (currentUser.banners || []).filter(b => b !== url)
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { banners: updatedBanners },
      select: { id: true, name: true, email: true, major: true, year: true, bio: true, avatar: true, banners: true, borderColor: true, vibeTemplate: true, vibeFill: true, isPrivate: true }
    })
    res.json(user)
  } catch (err) {
    console.error('Banner remove error:', err)
    res.status(500).json({ error: err.message || 'Failed to remove banner' })
  }
})

module.exports = router