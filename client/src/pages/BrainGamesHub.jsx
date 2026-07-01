import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function BrainGamesHub() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [nextGame, setNextGame] = useState(null)
  const [myXP, setMyXP] = useState(null)
  const [dailyChallenge, setDailyChallenge] = useState(null)
  const [dailyTrivia, setDailyTrivia] = useState(null)
  const [loading, setLoading] = useState(true)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAll(token)
  }, [])

  const fetchAll = async (token) => {
    try {
      const [nextRes, xpRes, challengeRes, triviaRes] = await Promise.all([
        axios.get(`${API_URL}/api/games/next`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/games/my-xp`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/games/daily-challenge`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/games/daily-trivia`, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      setNextGame(nextRes.data)
      setMyXP(xpRes.data)
      setDailyChallenge(challengeRes.data)
      setDailyTrivia(triviaRes.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold">Loading Brain Games...</p>
    </div>
  )

  const liveGames = [
    {
      id: 'live-quiz',
      title: '⚡ Live Quiz',
      description: 'Compete with other Aggies in real-time. New game every 2 hours!',
      status: nextGame?.status === 'active' ? 'live' : nextGame?.status === 'lobby' ? 'starting' : 'upcoming',
      statusText: nextGame?.status === 'active' ? '🔴 LIVE NOW' : nextGame?.status === 'lobby' ? `Starting in ${nextGame.lobbyCountdown}s` : `Next in ${formatTime(nextGame?.minutesUntil || 0)}`,
      color: 'from-red-500 to-red-700',
      onClick: () => navigate('/games/live')
    }
  ]

  const dailyGames = [
    {
      id: 'flash-challenge',
      title: '🔥 Daily Flash Challenge',
      description: 'One hard question per day. Speed matters — faster = more XP!',
      status: dailyChallenge?.myAttempt ? 'completed' : 'available',
      statusText: dailyChallenge?.myAttempt ? `✅ Done · ${dailyChallenge.myAttempt.isCorrect ? '+' + dailyChallenge.myAttempt.xpEarned + ' XP' : 'Missed it'}` : '🔥 Available Now',
      color: 'from-orange-500 to-red-500',
      onClick: () => navigate('/games/flash')
    },
    {
      id: 'daily-trivia',
      title: '🧠 Daily Trivia',
      description: '15 questions, one theme, one shot. Timer adds pressure!',
      status: dailyTrivia?.myAttempt ? 'completed' : 'available',
      statusText: dailyTrivia?.myAttempt ? `✅ Done · ${dailyTrivia.myAttempt.score}/${dailyTrivia.totalQuestions} correct` : '🧠 Available Now',
      color: 'from-purple-500 to-blue-600',
      onClick: () => navigate('/games/trivia')
    }
  ]

  const quickGames = [
    {
      id: 'math-sprint',
      title: '➕ Math Sprint',
      description: 'Solve as many math problems as you can in 60 seconds!',
      status: 'available',
      statusText: '⚡ Play anytime',
      color: 'from-green-500 to-teal-600',
      onClick: () => navigate('/games/math-sprint')
    },
    {
      id: 'memory-match',
      title: '🃏 Memory Match',
      description: 'Match terms to definitions. Train your brain!',
      status: 'coming-soon',
      statusText: '🔜 Coming Soon',
      color: 'from-blue-500 to-indigo-600',
      onClick: () => showToast('Coming soon! 🔜')
    },
    {
      id: 'word-scramble',
      title: '🔤 Word Scramble',
      description: 'Unscramble study terms as fast as you can!',
      status: 'coming-soon',
      statusText: '🔜 Coming Soon',
      color: 'from-pink-500 to-purple-600',
      onClick: () => showToast('Coming soon! 🔜')
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-5">
            {['🎮', '⚡', '🏆', '🎯', '🔥', '🧠'].map((s, i) => (
              <span key={i} className="absolute text-4xl" style={{ left: `${i * 17}%`, top: '50%', transform: 'translateY(-50%)' }}>{s}</span>
            ))}
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">🎮 Brain Games Hub</h1>
              <p className="text-blue-200">Compete, learn, and earn XP with fellow Aggies</p>
            </div>
            {myXP && (
              <div className="flex gap-4">
                {[
                  { label: 'Total XP', value: myXP.totalXP, emoji: '⚡' },
                  { label: 'Wins', value: myXP.gamesWon, emoji: '🏆' },
                  { label: 'Streak', value: myXP.winStreak, emoji: '🔥' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white bg-opacity-10 rounded-2xl px-4 py-3 text-center min-w-16">
                    <p className="text-lg">{stat.emoji}</p>
                    <p className="text-xl font-bold text-ncat-gold">{stat.value}</p>
                    <p className="text-xs text-blue-200">{stat.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Live Games */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ncat-blue mb-4">🔴 Live Games</h2>
          <div className="grid grid-cols-1 gap-4">
            {liveGames.map(game => (
              <div
                key={game.id}
                onClick={game.onClick}
                className="relative overflow-hidden rounded-2xl cursor-pointer hover:shadow-lg transition-shadow shadow-sm"
              >
                <div className={`bg-gradient-to-r ${game.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{game.title}</h3>
                      <p className="text-white text-opacity-80 text-sm mb-3">{game.description}</p>
                      <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full ${
                        game.status === 'live' ? 'bg-white text-red-500 animate-pulse' :
                        game.status === 'starting' ? 'bg-ncat-gold text-ncat-blue' :
                        'bg-white bg-opacity-20 text-white'
                      }`}>
                        {game.statusText}
                      </span>
                    </div>
                    <div className="text-6xl opacity-20">⚡</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Games */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ncat-blue mb-4">📅 Daily Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dailyGames.map(game => (
              <div
                key={game.id}
                onClick={game.onClick}
                className="relative overflow-hidden rounded-2xl cursor-pointer hover:shadow-lg transition-shadow shadow-sm"
              >
                <div className={`bg-gradient-to-br ${game.color} p-6 text-white`}>
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-bold mb-1">{game.title}</h3>
                    <p className="text-white text-opacity-80 text-sm mb-4 flex-1">{game.description}</p>
                    <span className={`self-start text-xs font-bold px-3 py-1.5 rounded-full ${
                      game.status === 'completed' ? 'bg-white text-green-600' :
                      'bg-white bg-opacity-20 text-white'
                    }`}>
                      {game.statusText}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Games */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-ncat-blue mb-4">⚡ Quick Games</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickGames.map(game => (
              <div
                key={game.id}
                onClick={game.onClick}
                className={`relative overflow-hidden rounded-2xl cursor-pointer hover:shadow-lg transition-shadow shadow-sm ${game.status === 'coming-soon' ? 'opacity-70' : ''}`}
              >
                <div className={`bg-gradient-to-br ${game.color} p-6 text-white`}>
                  <h3 className="text-lg font-bold mb-1">{game.title}</h3>
                  <p className="text-white text-opacity-80 text-sm mb-4">{game.description}</p>
                  <span className="self-start text-xs font-bold px-3 py-1.5 rounded-full bg-white bg-opacity-20 text-white">
                    {game.statusText}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard preview */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-ncat-blue">🏆 Leaderboard</h2>
            <button onClick={() => navigate('/games/leaderboard')} className="text-ncat-blue text-sm font-semibold hover:underline">
              View full →
            </button>
          </div>
          <button onClick={() => navigate('/games/leaderboard')} className="w-full bg-ncat-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
  View Full Leaderboard 🏆
</button>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}