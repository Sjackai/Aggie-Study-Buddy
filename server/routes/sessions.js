const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const prisma = new PrismaClient()

const COOLDOWN_MINUTES = 30

// GET ALL SESSIONS

router.get('/', async (req, res) => {
  try {
    const { course } = req.query
    const sessions = await prisma.session.findMany({
      where: course ? { courseCode: course } : {},
      include: {
        host: { select: { id: true, name: true, avatar: true } },
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
    const { courseCode, courseName, date, time, location, roomDetails, description, maxParticipants, tags } = req.body
    const session = await prisma.session.create({
      data: {
        courseCode,
        courseName,
        date,
        time,
        location,
        roomDetails,
        description,
        maxParticipants: maxParticipants || 6,
        hostId: req.userId,
        tags: tags || []
      }
    })

    const sessionDate = new Date(date)
    const expiresAt = new Date(sessionDate)
    expiresAt.setDate(expiresAt.getDate() + 1)

    const groupChat = await prisma.groupChat.create({
      data: {
        name: `${courseCode} Study Session`,
        sessionId: session.id,
        expiresAt
      }
    })

    await prisma.groupChatMember.create({
      data: { groupChatId: groupChat.id, userId: req.userId }
    })

    await prisma.groupChatMessage.create({
      data: {
        groupChatId: groupChat.id,
        senderId: req.userId,
        text: `Group chat created for ${courseCode} Study Session`,
        isSystem: true
      }
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
      include: {
        members: true,
        groupChat: true,
       host: { select: { id: true, name: true, avatar: true } },
      }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.members.length >= session.maxParticipants) {
      return res.status(400).json({ error: 'Session is full' })
    }

    const existing = session.members.find(m => m.userId === req.userId)
    if (existing) return res.status(400).json({ error: 'Already joined this session' })

    // Check cooldown
    if (session.groupChat) {
      const lastMembership = await prisma.groupChatMember.findFirst({
        where: {
          groupChatId: session.groupChat.id,
          userId: req.userId,
          leftAt: { not: null }
        },
        orderBy: { leftAt: 'desc' }
      })

      if (lastMembership) {
        const minutesSinceLeft = (new Date() - new Date(lastMembership.leftAt)) / (1000 * 60)
        if (minutesSinceLeft < COOLDOWN_MINUTES) {
          const minutesLeft = Math.ceil(COOLDOWN_MINUTES - minutesSinceLeft)
          return res.status(400).json({
            error: `You must wait ${minutesLeft} more minute${minutesLeft > 1 ? 's' : ''} before rejoining.`,
            cooldown: true,
            minutesLeft,
            canRequest: !lastMembership.rejoinRequested,
            sessionId: session.id,
            hostId: session.hostId
          })
        }
      }
    }

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

      const joiningUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { name: true }
      })

      if (!alreadyInChat) {
        await prisma.groupChatMember.create({
  data: { 
    groupChatId: session.groupChat.id, 
    userId: req.userId,
    lastRead: new Date('2000-01-01') // Set to past so all messages show as unread
  }
})

        await prisma.groupChatMessage.create({
          data: {
            groupChatId: session.groupChat.id,
            senderId: req.userId,
            text: `${joiningUser.name} joined the group 🎉`,
            isSystem: true
          }
        })
      }
    }

    res.json(member)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to join session' })
  }
})

// LEAVE SESSION
router.post('/:id/leave', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { members: true, groupChat: true }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.hostId === req.userId) {
      return res.status(400).json({ error: 'Host cannot leave their own session' })
    }

    await prisma.sessionMember.deleteMany({
      where: { sessionId: req.params.id, userId: req.userId }
    })

    if (session.status === 'full') {
      await prisma.session.update({
        where: { id: session.id },
        data: { status: 'open' }
      })
    }

    if (session.groupChat) {
      await prisma.groupChatMember.updateMany({
        where: { groupChatId: session.groupChat.id, userId: req.userId, leftAt: null },
        data: { leftAt: new Date() }
      })

      const leavingUser = await prisma.user.findUnique({
        where: { id: req.userId },
        select: { name: true }
      })

      await prisma.groupChatMessage.create({
        data: {
          groupChatId: session.groupChat.id,
          senderId: req.userId,
          text: `${leavingUser.name} left the group`,
          isSystem: true
        }
      })
    }

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to leave session' })
  }
})

// REQUEST HOST APPROVAL TO REJOIN
router.post('/:id/request-rejoin', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { groupChat: true, host: { select: { id: true, name: true, avatar: true } } }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (!session.groupChat) return res.status(400).json({ error: 'No group chat found' })

    const lastMembership = await prisma.groupChatMember.findFirst({
      where: {
        groupChatId: session.groupChat.id,
        userId: req.userId,
        leftAt: { not: null }
      },
      orderBy: { leftAt: 'desc' }
    })

    if (!lastMembership) return res.status(400).json({ error: 'You have not left this session' })
    if (lastMembership.rejoinRequested) {
      return res.status(400).json({ error: 'You have already requested to rejoin. Wait for the host or timer.' })
    }

    // Mark as requested
    await prisma.groupChatMember.update({
      where: { id: lastMembership.id },
      data: { rejoinRequested: true }
    })

    const requestingUser = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { name: true }
    })

    // Create system message in group chat for host to see
    await prisma.groupChatMessage.create({
      data: {
        groupChatId: session.groupChat.id,
        senderId: req.userId,
        text: `${requestingUser.name} is requesting to rejoin the group`,
        isSystem: true
      }
    })

    res.json({ success: true, hostId: session.hostId, hostName: session.host.name })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to request rejoin' })
  }
})

// CHECK COOLDOWN
router.get('/:id/cooldown', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { groupChat: true, host: { select: { id: true } } }
    })

    if (!session?.groupChat) return res.json({ cooldown: false })

    const lastMembership = await prisma.groupChatMember.findFirst({
      where: {
        groupChatId: session.groupChat.id,
        userId: req.userId,
        leftAt: { not: null }
      },
      orderBy: { leftAt: 'desc' }
    })

    if (!lastMembership) return res.json({ cooldown: false })

    const minutesSinceLeft = (new Date() - new Date(lastMembership.leftAt)) / (1000 * 60)
    if (minutesSinceLeft < COOLDOWN_MINUTES) {
      const minutesLeft = Math.ceil(COOLDOWN_MINUTES - minutesSinceLeft)
      return res.json({
        cooldown: true,
        minutesLeft,
        canRequest: !lastMembership.rejoinRequested,
        hostId: session.hostId
      })
    }

    res.json({ cooldown: false })
  } catch (err) {
    res.status(500).json({ error: 'Failed to check cooldown' })
  }
})

// HOST APPROVE REJOIN
router.post('/:id/approve/:userId', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { groupChat: true }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only the host can approve rejoins' })
    }

    // Add back to session if not already there
    const existingMember = await prisma.sessionMember.findFirst({
      where: { sessionId: req.params.id, userId: req.params.userId }
    })
    if (!existingMember) {
      await prisma.sessionMember.create({
        data: { sessionId: req.params.id, userId: req.params.userId }
      })
    }

    if (session.groupChat) {
      // Clear the leftAt and rejoinRequested so they're properly back in
      await prisma.groupChatMember.updateMany({
        where: {
          groupChatId: session.groupChat.id,
          userId: req.params.userId
        },
        data: { leftAt: null, rejoinRequested: false }
      })

      const approvedUser = await prisma.user.findUnique({
        where: { id: req.params.userId },
        select: { name: true }
      })

      await prisma.groupChatMessage.create({
        data: {
          groupChatId: session.groupChat.id,
          senderId: req.userId,
          text: `${approvedUser.name} was approved to rejoin ✅`,
          isSystem: true
        }
      })
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve rejoin' })
  }
})

// HOST DECLINE REJOIN
router.post('/:id/decline/:userId', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: { groupChat: true }
    })

    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only the host can decline rejoins' })
    }

    if (session.groupChat) {
      // Keep leftAt but clear rejoinRequested so popup disappears
      // but they can't request again (rejoinRequested stays true for cooldown logic)
      const declinedUser = await prisma.user.findUnique({
        where: { id: req.params.userId },
        select: { name: true }
      })

      await prisma.groupChatMessage.create({
        data: {
          groupChatId: session.groupChat.id,
          senderId: req.userId,
          text: `${declinedUser.name}'s rejoin request was declined`,
          isSystem: true
        }
      })
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to decline rejoin' })
  }
})
// GET RECOMMENDED SESSIONS
router.get('/recommended', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { preferences: true }
    })

    const today = new Date().toISOString().split('T')[0]
    const userCourses = user.preferences?.courses || []

    const sessions = await prisma.session.findMany({
      where: {
        date: { gte: today },
        status: 'open',
        hostId: { not: req.userId },
        members: { none: { userId: req.userId } }
      },
      include: {
        host: { select: { id: true, name: true, major: true, avatar: true, borderColor: true } },
        members: { include: { user: { select: { id: true, name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Score each session by relevance
    const scored = sessions.map(session => {
      let score = 0
      if (userCourses.includes(session.courseCode)) score += 10
      if (session.host?.major === user.major) score += 3
      if (session.members.length > 0) score += 1
      return { ...session, score }
    })

    // Sort by score descending, take top 10
    const recommended = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    res.json(recommended)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch recommendations' })
  }
})
const QRCode = require('qrcode')
const { generateQRToken, verifyQRToken, WINDOW_SECONDS } = require('../utils/qrToken')

// GET QR CODE FOR SESSION (host only)
router.get('/:id/qr', authMiddleware, async (req, res) => {
  console.log('QR route hit for session:', req.params.id)
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } })
    if (!session) return res.status(404).json({ error: 'Session not found' })
    if (session.hostId !== req.userId) return res.status(403).json({ error: 'Only the host can show the QR code' })

    // Check time window — 30 min before to 1 hour after start
    const [hours, minutes] = session.time.split(':').map(Number)
    const sessionDateTime = new Date(session.date)
    sessionDateTime.setHours(hours, minutes, 0, 0)
    const now = new Date()
    const minutesUntilStart = (sessionDateTime - now) / 1000 / 60
    const minutesAfterStart = (now - sessionDateTime) / 1000 / 60
    console.log('Session time:', session.time, 'Session date:', session.date)
    console.log('Session datetime:', sessionDateTime)
    console.log('Now:', now)
    console.log('Minutes until start:', minutesUntilStart)
    console.log('Minutes after start:', minutesAfterStart)

    if (minutesUntilStart > 360) {
  return res.status(400).json({ error: 'Too early to show QR code. Available 2 hours before start.' })
}
if (minutesAfterStart > 300) {
  return res.status(400).json({ error: 'QR code window has expired.' })
}

    const token = generateQRToken(session.id)
    const qrData = JSON.stringify({ sessionId: session.id, token })
    const qrImage = await QRCode.toDataURL(qrData)

    await prisma.session.update({
      where: { id: session.id },
      data: { hostAttended: true }
    })

    res.json({ qrImage, expiresIn: WINDOW_SECONDS })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to generate QR code' })
  }
})
// CHECK IN VIA QR SCAN
router.post('/:id/checkin', authMiddleware, async (req, res) => {
  try {
    const { token } = req.body
    const session = await prisma.session.findUnique({ where: { id: req.params.id } })
    if (!session) return res.status(404).json({ error: 'Session not found' })

    if (!verifyQRToken(session.id, token)) {
      return res.status(400).json({ error: 'Invalid or expired QR code' })
    }

    const member = await prisma.sessionMember.findFirst({
      where: { sessionId: session.id, userId: req.userId }
    })
    if (!member) return res.status(403).json({ error: 'You are not a member of this session' })

    if (member.attended) {
      return res.status(400).json({ error: 'You already checked in' })
    }

    await prisma.sessionMember.update({
      where: { id: member.id },
      data: { attended: true, checkedInAt: new Date() }
    })

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to check in' })
  }
})

// GET CHECK-IN STATUS FOR A SESSION
router.get('/:id/checkin-status', authMiddleware, async (req, res) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } }
      }
    })
    if (!session) return res.status(404).json({ error: 'Session not found' })

    res.json({
      hostAttended: session.hostAttended,
      members: session.members.map(m => ({
        userId: m.userId,
        name: m.user.name,
        avatar: m.user.avatar,
        attended: m.attended,
        checkedInAt: m.checkedInAt
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch check-in status' })
  }
})
router.get('/debug-time', async (req, res) => {
  const now = new Date()
  res.json({
    serverTime: now.toString(),
    serverUTC: now.toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
})
module.exports = router