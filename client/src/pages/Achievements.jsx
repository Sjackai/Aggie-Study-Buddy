import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import AchievementUnlock from '../components/AchievementUnlock'

export default function Achievements() {
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState([])
  const [newlyUnlocked, setNewlyUnlocked] = useState([])
  const [unlockQueue, setUnlockQueue] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [flipped, setFlipped] = useState({})
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAchievements(token)
  }, [])

  useEffect(() => {
    if (newlyUnlocked.length > 0) {
      setUnlockQueue(newlyUnlocked)
    }
  }, [newlyUnlocked])

  const fetchAchievements = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/games/achievements`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAchievements(res.data.achievements)
      setNewlyUnlocked(res.data.newlyUnlocked || [])
      setStats(res.data.stats)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const dismissUnlock = () => {
    setUnlockQueue(prev => prev.slice(1))
  }

  const toggleFlip = (id) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const categories = ['All', ...new Set(achievements.map(a => a.category))]
  const filtered = activeCategory === 'All' ? achievements : achievements.filter(a => a.category === activeCategory)

  const earned = achievements.filter(a => a.earned).length
  const total = achievements.length

  const tierColors = {
    1: { bg: 'bg-amber-50', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-700', label: 'Tier I' },
    2: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-700', label: 'Tier II' },
    3: { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-700', label: 'Tier III' },
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold">Loading achievements...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/profile')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/profile')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Profile
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-7 mb-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 text-6xl flex items-center justify-around pointer-events-none">
            🏆🎖️🌟🏅
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">🏆 Achievements</h1>
              <p className="text-blue-200">Tap a card to see description</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white bg-opacity-10 rounded-2xl px-5 py-3 text-center">
                <p className="text-3xl font-bold text-ncat-gold">{earned}</p>
                <p className="text-blue-200 text-xs">Earned</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl px-5 py-3 text-center">
                <p className="text-3xl font-bold text-white">{total}</p>
                <p className="text-blue-200 text-xs">Total</p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-2xl px-5 py-3 text-center">
                <p className="text-3xl font-bold text-ncat-gold">{Math.round((earned / total) * 100)}%</p>
                <p className="text-blue-200 text-xs">Complete</p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative z-10 mt-4 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
            <div className="h-full bg-ncat-gold rounded-full transition-all duration-500"
              style={{ width: `${(earned / total) * 100}%` }} />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                activeCategory === cat ? 'bg-ncat-blue text-white shadow-md' : 'bg-white text-gray-600 hover:shadow-md'
              }`}>
              {cat}
              {cat !== 'All' && (
                <span className="ml-1 opacity-60">
                  ({achievements.filter(a => a.category === cat && a.earned).length}/{achievements.filter(a => a.category === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(achievement => {
            const tier = tierColors[achievement.tier]
            const isFlipped = flipped[achievement.id]

            return (
              <div
                key={achievement.id}
                onClick={() => toggleFlip(achievement.id)}
                className="cursor-pointer"
                style={{ perspective: '1000px', height: '160px' }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.4s ease',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  {/* Front */}
                  <div style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%' }}>
                    <div className={`h-full rounded-2xl border-2 p-4 flex flex-col items-center justify-center text-center transition-all ${
                      achievement.earned
                        ? `${tier.bg} ${tier.border}`
                        : 'bg-gray-100 border-gray-200 opacity-50'
                    }`}>
                      <div className="text-3xl mb-2">{achievement.earned ? achievement.icon : '🔒'}</div>
                      <p className={`font-bold text-sm mb-1 ${achievement.earned ? 'text-gray-800' : 'text-gray-400'}`}>
                        {achievement.earned ? achievement.name : '???'}
                      </p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${achievement.earned ? tier.badge : 'bg-gray-200 text-gray-400'}`}>
                        {tier.label}
                      </span>
                      {achievement.earned && (
                        <span className="text-xs text-green-600 font-semibold mt-1">✅ Earned</span>
                      )}
                    </div>
                  </div>

                  {/* Back */}
                  <div style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%', transform: 'rotateY(180deg)' }}>
                    <div className={`h-full rounded-2xl border-2 p-4 flex flex-col items-center justify-center text-center ${
                      achievement.earned ? `${tier.bg} ${tier.border}` : 'bg-gray-100 border-gray-200'
                    }`}>
                      <p className="text-2xl mb-2">{achievement.icon}</p>
                      <p className="font-bold text-sm text-gray-800 mb-1">{achievement.name}</p>
                      <p className="text-xs text-gray-500 mb-2 leading-relaxed">{achievement.description}</p>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-ncat-blue font-bold">+{achievement.xpReward} XP</span>
                      </div>
                      {achievement.earned && achievement.earnedAt && (
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Unlock popup queue */}
      {unlockQueue.length > 0 && (
        <AchievementUnlock
          achievement={unlockQueue[0]}
          onClose={dismissUnlock}
        />
      )}
    </div>
  )
}