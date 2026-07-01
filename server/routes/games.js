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

// GET NEXT GAME INFO
router.get('/next', async (req, res) => {
  try {
    const io = req.app.get('io')
    const gameSocket = require('../socket/gameSocket')
    
    // Check if there's an active game
    const activeGames = gameSocket.getActiveGames ? gameSocket.getActiveGames() : new Map()
    
    for (const [gameId, game] of activeGames) {
      if (game.status === 'lobby' || game.status === 'active') {
        return res.json({
          status: game.status,
          gameId,
          category: game.category,
          lobbyCountdown: game.lobbyCountdown
        })
      }
    }

    // No active game — calculate next scheduled time
    const now = new Date()
    const hour = now.getHours()
    const nextHour = hour < 22 ? Math.ceil(hour / 2) * 2 : 8
    const nextGame = new Date(now)
    if (nextHour <= hour) {
      nextGame.setDate(nextGame.getDate() + 1)
      nextGame.setHours(8, 0, 0, 0)
    } else {
      nextGame.setHours(nextHour, 0, 0, 0)
    }

    const minutesUntil = Math.floor((nextGame - now) / 1000 / 60)

    res.json({
      status: 'waiting',
      minutesUntil,
      nextAt: nextGame
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch next game' })
  }
})
// GET NEXT GAME INFO
router.get('/next', async (req, res) => {
  try {
    const activeGames = global.activeGames || new Map()

    for (const [gameId, game] of activeGames) {
      if (game.status === 'lobby' || game.status === 'active') {
        return res.json({
          status: game.status,
          gameId,
          category: game.category,
          lobbyCountdown: game.lobbyCountdown
        })
      }
    }

    const now = new Date()
    const hour = now.getHours()
    const nextHour = hour < 22 ? Math.ceil((hour + 1) / 2) * 2 : 8
    const nextGame = new Date(now)
    if (nextHour <= hour || hour >= 22) {
      nextGame.setDate(nextGame.getDate() + 1)
      nextGame.setHours(8, 0, 0, 0)
    } else {
      nextGame.setHours(nextHour, 0, 0, 0)
    }

    const minutesUntil = Math.floor((nextGame - now) / 1000 / 60)

    res.json({
      status: 'waiting',
      minutesUntil,
      nextAt: nextGame
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch next game' })
  }
})
// GET TODAY'S DAILY CHALLENGE
router.get('/daily-challenge', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    // Get or create today's challenge
    let challenge = await prisma.dailyChallenge.findFirst({
      where: { date: today },
      include: { question: true, attempts: { where: { userId: req.userId } } }
    })

    if (!challenge) {
      // Pick a random hard question
      const questions = await prisma.gameQuestion.findMany({
        where: { difficulty: 'hard' }
      })
      if (questions.length === 0) return res.status(404).json({ error: 'No questions available' })
      const question = questions[Math.floor(Math.random() * questions.length)]

      challenge = await prisma.dailyChallenge.create({
        data: {
          date: today,
          questionId: question.id,
          scheduledAt: new Date()
        },
        include: { question: true, attempts: { where: { userId: req.userId } } }
      })
    }

    const myAttempt = challenge.attempts[0] || null

    // GET LEADERBOARD
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const { type = 'alltime-xp' } = req.query

    let orderBy = { totalXP: 'desc' }
    if (type.includes('wins')) orderBy = { gamesWon: 'desc' }

    // For daily/weekly we need to filter by date
    const now = new Date()
    let dateFilter = {}

    if (type.startsWith('daily')) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      dateFilter = { updatedAt: { gte: today } }
    } else if (type.startsWith('weekly')) {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFilter = { updatedAt: { gte: weekAgo } }
    }

    const leaderboard = await prisma.userXP.findMany({
      where: dateFilter,
      orderBy,
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

    res.json({
      id: challenge.id,
      date: challenge.date,
      question: myAttempt ? challenge.question : {
        id: challenge.question.id,
        question: challenge.question.question,
        options: challenge.question.options,
        type: challenge.question.type,
        category: challenge.question.category
      },
      myAttempt,
      leaderboard: leaderboard.map((a, i) => ({
        rank: i + 1,
        name: a.user.isPrivate ? 'Anonymous Aggie 🐾' : a.user.name,
        avatar: a.user.isPrivate ? null : a.user.avatar,
        timeSeconds: a.timeSeconds,
        xpEarned: a.xpEarned
      }))
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch daily challenge' })
  }
})

// SUBMIT DAILY CHALLENGE ANSWER
router.post('/daily-challenge/submit', authMiddleware, async (req, res) => {
  try {
    const { challengeId, answerIndex, timeSeconds } = req.body
    const today = new Date().toISOString().split('T')[0]

    const challenge = await prisma.dailyChallenge.findUnique({
      where: { id: challengeId },
      include: { question: true, attempts: { where: { userId: req.userId } } }
    })

    if (!challenge) return res.status(404).json({ error: 'Challenge not found' })
    if (challenge.date !== today) return res.status(400).json({ error: 'This challenge has expired' })
    if (challenge.attempts.length > 0) return res.status(400).json({ error: 'Already attempted today' })

    const isCorrect = answerIndex === challenge.question.correctIndex
    const speedBonus = isCorrect ? Math.max(0, Math.floor((60 - timeSeconds) * 2)) : 0
    const xpEarned = isCorrect ? 50 + speedBonus : 5

    const attempt = await prisma.dailyChallengeAttempt.create({
      data: {
        challengeId,
        userId: req.userId,
        answerIndex,
        isCorrect,
        timeSeconds,
        xpEarned
      }
    })

    await prisma.userXP.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, totalXP: xpEarned, gamesPlayed: 1 },
      update: { totalXP: { increment: xpEarned }, gamesPlayed: { increment: 1 } }
    })

    res.json({
      isCorrect,
      correctIndex: challenge.question.correctIndex,
      xpEarned,
      timeSeconds
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit answer' })
  }
})

// GET TODAY'S DAILY TRIVIA
router.get('/daily-trivia', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]

    let trivia = await prisma.dailyTrivia.findFirst({
      where: { date: today },
      include: { attempts: { where: { userId: req.userId } } }
    })

    if (!trivia) {
      const categories = ['HBCU History', 'Computer Science', 'Engineering', 'Science', 'Business', 'Math', 'Campus Life']
      const category = categories[Math.floor(Math.random() * categories.length)]
      const questions = await prisma.gameQuestion.findMany({
        where: { category },
        take: 15
      })
      if (questions.length < 15) return res.status(404).json({ error: 'Not enough questions' })

      trivia = await prisma.dailyTrivia.create({
        data: {
          date: today,
          category,
          questionIds: questions.map(q => q.id)
        },
        include: { attempts: { where: { userId: req.userId } } }
      })
    }

    const myAttempt = trivia.attempts[0] || null
    const questions = await prisma.gameQuestion.findMany({
      where: { id: { in: trivia.questionIds } }
    })

    res.json({
      id: trivia.id,
      date: trivia.date,
      category: trivia.category,
      questions: myAttempt ? questions : questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        type: q.type
      })),
      myAttempt,
      totalQuestions: questions.length
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch daily trivia' })
  }
})

// SUBMIT DAILY TRIVIA
router.post('/daily-trivia/submit', authMiddleware, async (req, res) => {
  try {
    const { triviaId, answers, timeTaken } = req.body

    const trivia = await prisma.dailyTrivia.findUnique({
      where: { id: triviaId },
      include: { attempts: { where: { userId: req.userId } } }
    })

    if (!trivia) return res.status(404).json({ error: 'Trivia not found' })
    if (trivia.attempts.length > 0) return res.status(400).json({ error: 'Already attempted today' })

    const questions = await prisma.gameQuestion.findMany({
      where: { id: { in: trivia.questionIds } }
    })

    let score = 0
    const results = questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex
      if (isCorrect) score++
      return { isCorrect, correctIndex: q.correctIndex, yourAnswer: answers[i] }
    })

    const xpEarned = score * 10 + (score === questions.length ? 50 : 0)

    await prisma.dailyTriviaAttempt.create({
      data: { triviaId, userId: req.userId, answers, score, timeTaken, xpEarned }
    })

    await prisma.userXP.upsert({
      where: { userId: req.userId },
      create: { userId: req.userId, totalXP: xpEarned, gamesPlayed: 1 },
      update: { totalXP: { increment: xpEarned }, gamesPlayed: { increment: 1 } }
    })

    res.json({ score, total: questions.length, xpEarned, results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to submit trivia' })
  }
})

module.exports = router