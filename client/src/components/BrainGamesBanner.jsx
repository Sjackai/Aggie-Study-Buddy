import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

export default function BrainGamesBanner() {
  const navigate = useNavigate()
  const [gameInfo, setGameInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNextGame()
    const interval = setInterval(fetchNextGame, 30000) // refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const fetchNextGame = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/games/next`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGameInfo(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  if (loading || !gameInfo) return null

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  // Live game
  if (gameInfo.status === 'active') {
    return (
      <div
        onClick={() => navigate('/games')}
        className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 mb-10 flex items-center justify-between cursor-pointer hover:opacity-95 transition shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse flex-shrink-0" />
          <div>
            <p className="text-white font-bold text-sm">LIVE NOW — Brain Game in Progress!</p>
            <p className="text-red-100 text-xs">Category: {gameInfo.category} · Join before it ends!</p>
          </div>
        </div>
        <button className="bg-white text-red-500 font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition flex-shrink-0">
          Join Now →
        </button>
      </div>
    )
  }

  // Lobby — game starting soon
  if (gameInfo.status === 'lobby') {
    return (
      <div
        onClick={() => navigate('/games')}
        className="bg-gradient-to-r from-ncat-gold to-yellow-400 rounded-2xl p-4 mb-10 flex items-center justify-between cursor-pointer hover:opacity-95 transition shadow-lg"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl flex-shrink-0">⚡</span>
          <div>
            <p className="text-ncat-blue font-bold text-sm">Brain Game Starting in {gameInfo.lobbyCountdown}s!</p>
            <p className="text-blue-800 text-xs">Category: {gameInfo.category} · Get in the lobby!</p>
          </div>
        </div>
        <button className="bg-ncat-blue text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition flex-shrink-0">
          Join Lobby →
        </button>
      </div>
    )
  }

  // Waiting — show countdown to next game
  return (
    <div
      onClick={() => navigate('/games')}
      className="bg-gradient-to-r from-ncat-blue to-blue-800 rounded-2xl p-4 mb-10 flex items-center justify-between cursor-pointer hover:opacity-95 transition shadow-lg relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5">
        {['🎮', '⚡', '🏆', '🎯'].map((s, i) => (
          <span key={i} className="absolute text-white text-2xl" style={{ left: `${i * 25 + 5}%`, top: '50%', transform: 'translateY(-50%)' }}>{s}</span>
        ))}
      </div>
      <div className="flex items-center gap-3 relative z-10">
        <span className="text-2xl flex-shrink-0">🎮</span>
        <div>
          <p className="text-white font-bold text-sm">Next Brain Game in {formatTime(gameInfo.minutesUntil)}</p>
          <p className="text-blue-200 text-xs">Live quizzes every 2 hours · Win XP and climb the leaderboard!</p>
        </div>
      </div>
      <button className="bg-ncat-gold text-ncat-blue font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition flex-shrink-0 relative z-10">
        View Games →
      </button>
    </div>
  )
}