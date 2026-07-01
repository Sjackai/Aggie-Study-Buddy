import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

const CATEGORY_CONFIG = {
  'Math': { symbols: ['➕', '➗', '📐', '🔢', '∑', '∞', '📏', '✖️'], time: 25 },
  'Science': { symbols: ['🔬', '⚗️', '🧬', '⚡', '🌡️', '🧪', '💉', '🔭'], time: 20 },
  'Computer Science': { symbols: ['💻', '</>', '⌨️', '🖥️', '01', '{}', '⚙️', '🔌'], time: 18 },
  'Engineering': { symbols: ['⚙️', '🔧', '🔩', '📡', '🏗️', '⚡', '🔨', '📐'], time: 20 },
  'Business': { symbols: ['📈', '💰', '💼', '📊', '🤝', '💳', '🏦', '📉'], time: 15 },
  'HBCU History': { symbols: ['✊', '📜', '🎓', '✨', '🕊️', '📚', '🏛️', '⭐'], time: 15 },
  'Campus Life': { symbols: ['🐾', '🎓', '📚', '🏫', '🤝', '🎉', '🏆', '💛'], time: 8 },
  'Pop Culture': { symbols: ['🎵', '🎬', '🎮', '📱', '🌟', '🎤', '📸', '🎭'], time: 8 },
  'Sports': { symbols: ['🏀', '🏈', '⚽', '🎾', '🏆', '🥇', '💪', '🏃'], time: 8 },
  'Would You Rather': { symbols: ['🤔', '💭', '❓', '⚖️', '🎲', '🔀', '💡', '🌀'], time: 8 },
}

const DEFAULT_CONFIG = { symbols: ['⭐', '🎮', '🏆', '💡', '🔥', '✨', '🎯', '💫'], time: 15 }

function FloatingBackground({ category }) {
  const config = CATEGORY_CONFIG[category] || DEFAULT_CONFIG
  const symbols = config.symbols
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="absolute text-white select-none"
          style={{
            fontSize: `${Math.random() * 20 + 16}px`,
            left: `${(i * 8.3) % 100}%`,
            top: `${(i * 13.7) % 100}%`,
            opacity: 0.08 + (i % 3) * 0.04,
            animation: `float ${4 + (i % 4)}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`
          }}>
          {symbols[i % symbols.length]}
        </div>
      ))}
    </div>
  )
}

export default function BrainGames() {
  const navigate = useNavigate()
  const socketRef = useRef(null)
  const [toast, setToast] = useState(null)
  const [phase, setPhase] = useState('waiting')
  const [gameInfo, setGameInfo] = useState(null)
  const [players, setPlayers] = useState([])
  const [lobbyCountdown, setLobbyCountdown] = useState(30)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [timeLeft, setTimeLeft] = useState(20)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerResult, setAnswerResult] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [finalRanks, setFinalRanks] = useState([])
  const [myScore, setMyScore] = useState(0)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [myXP, setMyXP] = useState(null)
  const [globalLeaderboard, setGlobalLeaderboard] = useState([])
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('user')))
const [gameNotifs, setGameNotifs] = useState(() => {
  const user = JSON.parse(localStorage.getItem('user'))
  return user?.gameNotifications !== false
})
const chatEndRef = useRef(null)
const SOCKET_URL = API_URL.replace('/api', '')
  

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.setItem('user', JSON.stringify(res.data))
      setCurrentUser(res.data)
      return res.data
    } catch (err) {
      return JSON.parse(localStorage.getItem('user'))
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }

    fetchMyXP()
    fetchLeaderboard()
    fetchCurrentUser()

    const socket = io(SOCKET_URL)
    socketRef.current = socket

    socket.on('connect', () => console.log('Connected to game server'))

    socket.on('game_scheduled', async (data) => {
  const freshUser = await fetchCurrentUser()

  if (freshUser?.gameNotifications !== false) {
    showToast(`🎮 Brain Game starting soon! — ${data.category}`, 'success')
    if (Notification.permission === 'granted') {
      new Notification('Aggie StudyBuddy 🐾', {
        body: `A Brain Game is starting! Category: ${data.category}`,
        icon: '/favicon.ico'
      })
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('Aggie StudyBuddy 🐾', {
            body: `A Brain Game is starting! Category: ${data.category}`,
            icon: '/favicon.ico'
          })
        }
      })
    }
  }

  setGameInfo(data)
  setPhase('lobby')
  setLobbyCountdown(data.startsIn)
  socket.emit('join_lobby', {
    gameId: data.gameId,
    userId: freshUser?.id,
    name: freshUser?.name,
    avatar: freshUser?.avatar
  })
})
    socket.on('game_in_progress', async (data) => {
      const freshUser = await fetchCurrentUser()
      setGameInfo(data)
      setPhase('lobby')
      socket.emit('join_lobby', {
        gameId: data.gameId,
        userId: freshUser?.id,
        name: freshUser?.name,
        avatar: freshUser?.avatar
      })
    })

    socket.on('lobby_update', ({ players, countdown }) => {
      setPlayers(players)
      if (countdown !== undefined) setLobbyCountdown(countdown)
    })

    socket.on('lobby_countdown', ({ countdown }) => setLobbyCountdown(countdown))

    socket.on('game_start', () => {
      setPhase('question')
      setChatMessages([])
      setMyScore(0)
    })

    socket.on('question', (data) => {
      setCurrentQuestion(data)
      setSelectedAnswer(null)
      setAnswerResult(null)
      setTimeLeft(data.timeLimit)
      setPhase('question')
    })

    socket.on('timer', ({ timeLeft }) => setTimeLeft(timeLeft))

    socket.on('answer_result', (result) => {
      setAnswerResult({ ...result, revealed: false })
      setMyScore(result.totalScore)
    })

    socket.on('question_end', ({ correctIndex, leaderboard }) => {
      setAnswerResult(prev => prev ? { ...prev, correctIndex, revealed: true } : { correctIndex, revealed: true, isCorrect: false, points: 0 })
      setLeaderboard(leaderboard)
      setPhase('answer')
    })

    socket.on('game_over', ({ finalRanks }) => {
      setFinalRanks(finalRanks)
      setPhase('gameover')
      fetchMyXP()
      fetchLeaderboard()
    })

    socket.on('game_chat', (msg) => {
      setChatMessages(prev => [...prev.slice(-50), msg])
    })

    return () => socket.disconnect()
  }, [])
const toggleGameNotifs = async () => {
  const token = localStorage.getItem('token')
  const newVal = !gameNotifs
  setGameNotifs(newVal)
  try {
    const res = await axios.put(`${API_URL}/api/users/me`,
      { gameNotifications: newVal },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    localStorage.setItem('user', JSON.stringify(res.data))
  } catch (err) {
    setGameNotifs(!newVal)
    showToast('Failed to update notification settings', 'error')
  }
}
  const fetchMyXP = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/games/my-xp`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyXP(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchLeaderboard = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/games/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGlobalLeaderboard(res.data)
    } catch (err) { console.error(err) }
  }

  const handleAnswer = (index) => {
    if (selectedAnswer !== null || phase !== 'question') return
    setSelectedAnswer(index)
    socketRef.current?.emit('submit_answer', {
      gameId: gameInfo?.gameId,
      questionIndex: currentQuestion?.index,
      answerIndex: index,
      timeLeft
    })
  }

  const sendChat = () => {
    if (!chatInput.trim()) return
    socketRef.current?.emit('game_chat', {
      gameId: gameInfo?.gameId,
      message: chatInput.trim().substring(0, 50)
    })
    setChatInput('')
  }

  const category = gameInfo?.category || currentQuestion?.category
  const config = CATEGORY_CONFIG[category] || DEFAULT_CONFIG
  const myRank = finalRanks.find(p => p.userId === currentUser?.id)

  const isPlaying = phase === 'question' || phase === 'answer'

return (
  <div className={`min-h-screen transition-colors duration-500 ${isPlaying ? 'bg-ncat-blue' : 'bg-gray-50'}`}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
      `}</style>

      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center shadow-md relative z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Waiting */}
        {phase === 'waiting' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
              <FloatingBackground category="Campus Life" />
              <div className="relative z-10">
                <p className="text-5xl mb-4">🎮</p>
                <h1 className="text-3xl font-bold mb-2">Brain Games</h1>
                <p className="text-blue-200 mb-6">Live quizzes run every 2 hours. The next game starts soon!</p>
                <div className="bg-white bg-opacity-10 rounded-2xl p-4 inline-block">
                  <p className="text-blue-200 text-sm">Games run every 2 hours · 8am - 10pm</p>
                  <p className="text-white font-bold mt-1">Weekends have more games + chill topics 🎉</p>
                </div>
              </div>
            </div>
            {/* Notification toggle */}
<div className="bg-white rounded-2xl shadow-sm p-4 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="text-2xl">{gameNotifs ? '🔔' : '🔕'}</span>
    <div>
      <p className="font-semibold text-gray-800 text-sm">Game Notifications</p>
      <p className="text-xs text-gray-400">Get notified when a Brain Game is starting</p>
    </div>
  </div>
  <button
    onClick={toggleGameNotifs}
    className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${gameNotifs ? 'bg-ncat-blue' : 'bg-gray-300'}`}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${gameNotifs ? 'translate-x-7' : 'translate-x-1'}`} />
  </button>
</div>

            {myXP && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-ncat-blue mb-4">My Stats ⚡</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total XP', value: myXP.totalXP, emoji: '⚡' },
                    { label: 'Games Played', value: myXP.gamesPlayed, emoji: '🎮' },
                    { label: 'Games Won', value: myXP.gamesWon, emoji: '🏆' },
                    { label: 'Win Streak', value: myXP.winStreak, emoji: '🔥' },
                  ].map((stat, i) => (
                    <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center">
                      <p className="text-2xl mb-1">{stat.emoji}</p>
                      <p className="text-2xl font-bold text-ncat-blue">{stat.value}</p>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-ncat-blue mb-4">🏆 All-Time Leaderboard</h2>
              <div className="space-y-3">
                {globalLeaderboard.slice(0, 10).map((entry, i) => (
                  <div key={entry.userId} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-ncat-gold bg-opacity-10' : 'bg-gray-50'}`}>
                    <span className="text-lg font-bold w-8 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </span>
                    <div className={`w-8 h-8 ${getColor(entry.name)} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0`}>
                      {entry.avatar ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(entry.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-800">{entry.name}</p>
                      <p className="text-xs text-gray-400">{entry.gamesPlayed} games · {entry.gamesWon} wins</p>
                    </div>
                    <span className="font-bold text-ncat-blue">{entry.totalXP} XP</span>
                  </div>
                ))}
                {globalLeaderboard.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-4">No games played yet — be the first! 🐾</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Lobby */}
        {phase === 'lobby' && (
          <div className="max-w-lg mx-auto">
            <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-8 text-white text-center shadow-lg mb-6 relative overflow-hidden">
              <FloatingBackground category={gameInfo?.category} />
              <div className="relative z-10">
                <p className="text-4xl mb-3">⚡</p>
                <h1 className="text-2xl font-bold mb-1">Live Quiz Starting!</h1>
                <p className="text-blue-200 mb-4">Category: <span className="text-ncat-gold font-bold">{gameInfo?.category}</span></p>
                <div className="bg-white bg-opacity-10 rounded-2xl p-4">
                  <p className="text-5xl font-bold text-ncat-gold">{lobbyCountdown}</p>
                  <p className="text-blue-200 text-sm mt-1">seconds until start</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-ncat-blue mb-4">Players Joined ({players.length})</h2>
              <div className="grid grid-cols-2 gap-3">
                {players.map((player) => (
                  <div key={player.userId} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <div className={`w-8 h-8 ${getColor(player.name)} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0`}>
                      {player.avatar ? <img src={player.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(player.name)}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate flex-1">{player.name}</p>
                    {player.userId === currentUser?.id && <span className="text-xs text-ncat-blue font-bold">You</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Question + Answer Phase */}
        {(phase === 'question' || phase === 'answer') && currentQuestion && (
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-gradient-to-r from-ncat-blue to-blue-800 rounded-2xl p-4 flex justify-between items-center relative overflow-hidden">
              <FloatingBackground category={category} />
              <span className="text-white font-bold text-sm relative z-10">Q{currentQuestion.index + 1}/{currentQuestion.total}</span>
              <div className={`text-2xl font-bold relative z-10 ${timeLeft <= 5 ? 'text-red-400' : 'text-ncat-gold'}`}>
                {timeLeft}s
              </div>
              <span className="text-white font-bold text-sm relative z-10">⚡ {myScore} pts</span>
            </div>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-400' : 'bg-ncat-gold'}`}
                style={{ width: `${(timeLeft / config.time) * 100}%` }}
              />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-lg font-bold text-gray-800 text-center leading-relaxed">{currentQuestion.question}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentQuestion.options.map((option, i) => {
                let style = 'bg-white border-2 border-gray-200 text-gray-700 hover:border-ncat-blue hover:bg-blue-50 cursor-pointer'

                if (phase === 'question') {
                  if (selectedAnswer === i) {
                    style = 'bg-ncat-blue border-2 border-ncat-blue text-white cursor-not-allowed'
                  } else if (selectedAnswer !== null) {
                    style = 'bg-gray-50 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                  }
                }

                if (phase === 'answer' && answerResult?.revealed) {
                  if (i === answerResult.correctIndex) {
                    style = 'bg-green-100 border-2 border-green-500 text-green-700'
                  } else if (selectedAnswer === i) {
                    style = 'bg-red-100 border-2 border-red-400 text-red-700'
                  } else {
                    style = 'bg-gray-50 border-2 border-gray-200 text-gray-400'
                  }
                }

                if (phase === 'answer' && !answerResult?.revealed) {
                  if (selectedAnswer === i) {
                    style = 'bg-ncat-blue border-2 border-ncat-blue text-white'
                  } else {
                    style = 'bg-gray-50 border-2 border-gray-200 text-gray-400'
                  }
                }

                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={selectedAnswer !== null}
                    className={`${style} rounded-2xl p-4 text-left font-semibold transition-all`}>
                    <span className="text-xs font-bold opacity-60 mr-2">{['A', 'B', 'C', 'D'][i]}</span>
                    {option}
                  </button>
                )
              })}
            </div>

            {phase === 'answer' && answerResult?.revealed && (
              <div className={`rounded-2xl p-4 text-center font-bold ${answerResult.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {answerResult.isCorrect ? `✅ Correct! +${answerResult.points} points` : '❌ Wrong answer'}
              </div>
            )}

            {phase === 'answer' && !answerResult?.revealed && (
              <div className="rounded-2xl p-4 text-center bg-gray-100 text-gray-500 font-semibold">
                ⏳ Waiting for timer...
              </div>
            )}

            {phase === 'answer' && leaderboard.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <p className="font-bold text-ncat-blue mb-3 text-sm">Top Players</p>
                {leaderboard.map((p, i) => (
                  <div key={p.userId} className="flex items-center gap-2 mb-2">
                    <span className="text-sm w-5">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</span>
                    <div className={`w-6 h-6 ${getColor(p.name)} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0`}>
                      {p.avatar ? <img src={p.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(p.name)}
                    </div>
                    <span className="text-sm flex-1 font-semibold truncate">{p.name}</span>
                    <span className="text-sm font-bold text-ncat-blue">{p.score}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Live Chat */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <p className="font-bold text-ncat-blue text-sm">💬 Live Chat</p>
              </div>
              <div className="h-32 overflow-y-auto p-3 space-y-1">
                {chatMessages.map((msg, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <div className={`w-5 h-5 ${getColor(msg.name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 overflow-hidden`}
                      style={{ fontSize: '8px' }}>
                      {msg.avatar ? <img src={msg.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(msg.name)}
                    </div>
                    <span className="font-bold text-ncat-blue">{msg.name?.split(' ')[0]}: </span>
                    <span className="text-gray-700">{msg.message}</span>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-gray-100 flex gap-2">
                <input type="text" value={chatInput}
                  onChange={e => setChatInput(e.target.value.substring(0, 50))}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder="Chat... (50 chars max)"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ncat-blue" />
                <button onClick={sendChat} className="bg-ncat-blue text-white text-xs font-bold px-3 py-2 rounded-xl hover:opacity-90">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game Over */}
        {phase === 'gameover' && (
          <div className="max-w-lg mx-auto space-y-6">
            <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-8 text-white text-center shadow-lg relative overflow-hidden">
              <FloatingBackground category={category} />
              <div className="relative z-10">
                <p className="text-5xl mb-3">
                  {myRank?.rank === 1 ? '🏆' : myRank?.rank === 2 ? '🥈' : myRank?.rank === 3 ? '🥉' : '🎮'}
                </p>
                <h1 className="text-2xl font-bold mb-1">Game Over!</h1>
                {myRank && (
                  <>
                    <p className="text-blue-200 mb-2">You finished <span className="text-ncat-gold font-bold">#{myRank.rank}</span></p>
                    <p className="text-3xl font-bold text-ncat-gold">+{myRank.xpEarned} XP</p>
                  </>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-ncat-blue mb-4">Final Rankings</h2>
              <div className="space-y-3">
                {finalRanks.map((player, i) => (
                  <div key={player.userId} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-ncat-gold bg-opacity-10' : 'bg-gray-50'} ${player.userId === currentUser?.id ? 'border-2 border-ncat-blue' : ''}`}>
                    <span className="text-lg font-bold w-8 text-center">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                    </span>
                    <div className={`w-8 h-8 ${getColor(player.name)} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0`}>
                      {player.avatar ? <img src={player.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(player.name)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{player.name} {player.userId === currentUser?.id && '(You)'}</p>
                      <p className="text-xs text-gray-400">{player.score} points</p>
                    </div>
                    <span className="text-ncat-gold font-bold text-sm">+{player.xpEarned} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setPhase('waiting'); setGameInfo(null); fetchLeaderboard(); fetchMyXP() }}
              className="w-full bg-ncat-gold text-ncat-blue font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-md"
            >
              Back to Lobby 🐾
            </button>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}