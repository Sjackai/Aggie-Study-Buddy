const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const CATEGORY_TIMES = {
  'Math': 25,
  'Science': 20,
  'Computer Science': 18,
  'Engineering': 20,
  'Business': 15,
  'HBCU History': 15,
  'Campus Life': 8,
  'Pop Culture': 8,
  'Sports': 8,
  'Would You Rather': 8,
}
const DEFAULT_QUESTION_TIME = 15
const LOBBY_TIME = 10 // seconds before game starts

module.exports = (io) => {
  const activeGames = new Map() // gameId -> game state

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)
    // Send current active game to newly connected client
for (const [gameId, game] of activeGames) {
  if (game.status === 'lobby') {
    socket.emit('game_scheduled', {
      gameId,
      category: game.category,
      startsIn: game.lobbyCountdown,
      questionCount: game.questions.length
    })
  } else if (game.status === 'active') {
    socket.emit('game_in_progress', {
      gameId,
      category: game.category
    })
  }
}

    // Join game lobby
    socket.on('join_lobby', async ({ gameId, userId, name, avatar }) => {
  socket.join(`game:${gameId}`)
  socket.data.userId = userId
  socket.data.name = name
  socket.data.avatar = avatar
  socket.data.gameId = gameId
      const game = activeGames.get(gameId)
      if (game) {
        game.players.set(userId, { userId, name, avatar, score: 0, answers: [] })
        io.to(`game:${gameId}`).emit('lobby_update', {
          players: Array.from(game.players.values()),
          countdown: game.lobbyCountdown
        })
      }
    })

    // Player submits answer
    socket.on('submit_answer', ({ gameId, questionIndex, answerIndex, timeLeft }) => {
      const game = activeGames.get(gameId)
      if (!game) return

      const userId = socket.data.userId
      const player = game.players.get(userId)
      if (!player) return

      // Only accept first answer per question
      if (player.answers[questionIndex] !== undefined) return

      const question = game.questions[questionIndex]
      const isCorrect = answerIndex === question.correctIndex
      const speedBonus = Math.floor(timeLeft * 5)
      const points = isCorrect ? 100 + speedBonus : 0

      player.answers[questionIndex] = answerIndex
      player.score += points

      game.players.set(userId, player)

      // Send result back to this player only
      socket.emit('answer_result', {
        questionIndex,
        isCorrect,
        correctIndex: question.correctIndex,
        points,
        totalScore: player.score
      })
    })

    // Send chat message
    socket.on('game_chat', ({ gameId, message }) => {
  const userId = socket.data.userId
  const name = socket.data.name
  const avatar = socket.data.avatar
  io.to(`game:${gameId}`).emit('game_chat', {
    userId,
    name,
    avatar,
    message: message.substring(0, 50),
    timestamp: Date.now()
  })
})

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })

  // Start a game
  async function startGame(gameId) {
    const game = activeGames.get(gameId)
    if (!game) return

    game.status = 'starting'

    // Lobby countdown
    let lobbyCountdown = LOBBY_TIME
    game.lobbyCountdown = lobbyCountdown

    const lobbyInterval = setInterval(() => {
      lobbyCountdown--
      game.lobbyCountdown = lobbyCountdown
      io.to(`game:${gameId}`).emit('lobby_countdown', { countdown: lobbyCountdown })

      if (lobbyCountdown <= 0) {
        clearInterval(lobbyInterval)
        runGame(gameId)
      }
    }, 1000)
  }

  async function runGame(gameId) {
    const game = activeGames.get(gameId)
    if (!game) return

    game.status = 'active'
    io.to(`game:${gameId}`).emit('game_start', {
      totalQuestions: game.questions.length
    })

    for (let i = 0; i < game.questions.length; i++) {
      const question = game.questions[i]

      // Shuffle options for each player (send without revealing correct answer)
      const questionTime = CATEGORY_TIMES[game.category] || DEFAULT_QUESTION_TIME
io.to(`game:${gameId}`).emit('question', {
  index: i,
  question: question.question,
  options: question.options,
  type: question.type,
  category: game.category,
  timeLimit: questionTime,
  total: game.questions.length
})

      // Wait for question time
      await new Promise(resolve => {
  let timeLeft = questionTime
  const timer = setInterval(() => {
    timeLeft--
    io.to(`game:${gameId}`).emit('timer', { timeLeft, questionIndex: i })
    if (timeLeft <= 0) {
      clearInterval(timer)
      resolve()
    }
  }, 1000)
})

      // Reveal correct answer + leaderboard
      const leaderboard = Array.from(game.players.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 5)
        .map((p, rank) => ({ ...p, rank: rank + 1 }))

      io.to(`game:${gameId}`).emit('question_end', {
        questionIndex: i,
        correctIndex: question.correctIndex,
        leaderboard
      })

      // Wait 3 seconds between questions
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    // Game over
    endGame(gameId)
  }

  async function endGame(gameId) {
    const game = activeGames.get(gameId)
    if (!game) return

    game.status = 'ended'

    const finalRanks = Array.from(game.players.values())
      .sort((a, b) => b.score - a.score)
      .map((p, rank) => ({
        ...p,
        rank: rank + 1,
        xpEarned: rank === 0 ? 100 : rank === 1 ? 75 : rank === 2 ? 50 : 10
      }))

    // Save XP to database
    for (const player of finalRanks) {
      try {
        await prisma.userXP.upsert({
          where: { userId: player.userId },
          create: {
            userId: player.userId,
            totalXP: player.xpEarned,
            gamesPlayed: 1,
            gamesWon: player.rank === 1 ? 1 : 0
          },
          update: {
            totalXP: { increment: player.xpEarned },
            gamesPlayed: { increment: 1 },
            gamesWon: { increment: player.rank === 1 ? 1 : 0 }
          }
        })
      } catch (err) {
        console.error('Failed to save XP:', err)
      }
    }

    io.to(`game:${gameId}`).emit('game_over', { finalRanks })
    activeGames.delete(gameId)
  }

  // Schedule games
  async function scheduleNextGame() {
  try {
    const now = new Date()
    const day = now.getDay()
    const isWeekend = day === 0 || day === 6

    const weekdayCategories = ['HBCU History', 'Computer Science', 'Engineering', 'Science', 'Business', 'Math']
    const weekendCategories = ['Campus Life', 'Pop Culture', 'Sports', 'Would You Rather', 'HBCU History']

    const categories = isWeekend ? weekendCategories : weekdayCategories
    const category = categories[Math.floor(Math.random() * categories.length)]

    const questions = await prisma.gameQuestion.findMany({
      where: { category },
      take: 10,
      orderBy: { createdAt: 'asc' }
    })

    if (questions.length === 0) {
      console.log('No questions found for category:', category)
      return
    }

    const gameId = `game_${Date.now()}`
    activeGames.set(gameId, {
      gameId,
      category,
      questions,
      players: new Map(),
      status: 'lobby',
      lobbyCountdown: LOBBY_TIME,
      scheduledAt: now
    })

    io.emit('game_scheduled', {
      gameId,
      category,
      startsIn: LOBBY_TIME,
      questionCount: questions.length
    })

    startGame(gameId)
  } catch (err) {
    console.error('Failed to schedule game, retrying in 30s:', err.message)
    setTimeout(scheduleNextGame, 30000) // retry after 30 seconds
  }
}

 scheduleNextGame()
setInterval(scheduleNextGame, 10 * 60 * 1000) // every 10 min for testing

 // Expose for routes
  global.activeGames = activeGames
  return { activeGames, scheduleNextGame }
}