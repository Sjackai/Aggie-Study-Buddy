import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function Leaderboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('alltime-xp')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUser = JSON.parse(localStorage.getItem('user'))

  useEffect(() => {
    fetchLeaderboard(activeTab)
  }, [activeTab])

  const fetchLeaderboard = async (tab) => {
    setLoading(true)
    const token = localStorage.getItem('token')
    try {
      const res = await axios.get(`${API_URL}/api/games/leaderboard?type=${tab}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const tabs = [
    { id: 'alltime-xp', label: '⚡ All-Time XP' },
    { id: 'alltime-wins', label: '🏆 All-Time Wins' },
    { id: 'weekly-xp', label: '📅 Weekly XP' },
    { id: 'weekly-wins', label: '🥇 Weekly Wins' },
    { id: 'daily-xp', label: '☀️ Daily XP' },
    { id: 'daily-wins', label: '🔥 Daily Wins' },
  ]

  const myRank = data.findIndex(e => e.userId === currentUser?.id) + 1

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/games')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/games')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Brain Games
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-5 text-6xl flex items-center justify-around">
            🏆🥇🎮⚡
          </div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">🏆 Leaderboard</h1>
              <p className="text-blue-200 text-sm">Top Aggies across all Brain Games</p>
            </div>
            {myRank > 0 && (
              <div className="bg-white bg-opacity-10 rounded-2xl px-4 py-3 text-center">
                <p className="text-ncat-gold font-bold text-2xl">#{myRank}</p>
                <p className="text-blue-200 text-xs">Your Rank</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                activeTab === tab.id
                  ? 'bg-ncat-blue text-white shadow-md'
                  : 'bg-white text-gray-600 hover:shadow-md'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-400">Loading...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-4xl mb-3">🏆</p>
              <p className="text-gray-400 font-medium">No data yet — be the first!</p>
            </div>
          ) : (
            <div>
              {/* Top 3 podium */}
              {data.length >= 3 && (
                <div className="bg-gradient-to-br from-ncat-blue to-blue-900 p-6 flex items-end justify-center gap-4">
                  {/* 2nd */}
                  <div className="text-center flex flex-col items-center">
                    <div className={`w-12 h-12 ${getColor(data[1]?.name)} rounded-full flex items-center justify-center text-white font-bold overflow-hidden mb-2`}>
                      {data[1]?.avatar ? <img src={data[1].avatar} alt="" className="w-full h-full object-cover" /> : getInitials(data[1]?.name)}
                    </div>
                    <div className="bg-gray-300 rounded-t-xl px-4 py-3 min-w-16 text-center">
                      <p className="text-2xl">🥈</p>
                      <p className="text-xs font-bold text-gray-700 truncate max-w-16">{data[1]?.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500">{activeTab.includes('xp') ? `${data[1]?.totalXP} XP` : `${data[1]?.gamesWon} W`}</p>
                    </div>
                  </div>

                  {/* 1st */}
                  <div className="text-center flex flex-col items-center">
                    <div className="w-3 h-3 bg-ncat-gold rounded-full mb-1 animate-pulse" />
                    <div className={`w-16 h-16 ${getColor(data[0]?.name)} rounded-full flex items-center justify-center text-white font-bold overflow-hidden mb-2 border-4 border-ncat-gold`}>
                      {data[0]?.avatar ? <img src={data[0].avatar} alt="" className="w-full h-full object-cover" /> : getInitials(data[0]?.name)}
                    </div>
                    <div className="bg-ncat-gold rounded-t-xl px-4 py-4 min-w-20 text-center">
                      <p className="text-2xl">🥇</p>
                      <p className="text-xs font-bold text-ncat-blue truncate max-w-20">{data[0]?.name?.split(' ')[0]}</p>
                      <p className="text-xs text-blue-800">{activeTab.includes('xp') ? `${data[0]?.totalXP} XP` : `${data[0]?.gamesWon} W`}</p>
                    </div>
                  </div>

                  {/* 3rd */}
                  <div className="text-center flex flex-col items-center">
                    <div className={`w-12 h-12 ${getColor(data[2]?.name)} rounded-full flex items-center justify-center text-white font-bold overflow-hidden mb-2`}>
                      {data[2]?.avatar ? <img src={data[2].avatar} alt="" className="w-full h-full object-cover" /> : getInitials(data[2]?.name)}
                    </div>
                    <div className="bg-orange-300 rounded-t-xl px-4 py-2 min-w-16 text-center">
                      <p className="text-2xl">🥉</p>
                      <p className="text-xs font-bold text-gray-700 truncate max-w-16">{data[2]?.name?.split(' ')[0]}</p>
                      <p className="text-xs text-gray-500">{activeTab.includes('xp') ? `${data[2]?.totalXP} XP` : `${data[2]?.gamesWon} W`}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rest of list */}
              <div className="divide-y divide-gray-50">
                {data.slice(3).map((entry, i) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center gap-3 px-6 py-4 ${entry.userId === currentUser?.id ? 'bg-blue-50' : 'hover:bg-gray-50'} transition`}
                  >
                    <span className="text-sm font-bold text-gray-400 w-6">#{i + 4}</span>
                    <div className={`w-10 h-10 ${getColor(entry.name)} rounded-full flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0`}>
                      {entry.avatar ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(entry.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">
                        {entry.name}
                        {entry.userId === currentUser?.id && <span className="ml-1 text-xs text-ncat-blue">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{entry.gamesPlayed} games played</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-ncat-blue">
                        {activeTab.includes('xp') ? `${entry.totalXP} XP` : `${entry.gamesWon} wins`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}