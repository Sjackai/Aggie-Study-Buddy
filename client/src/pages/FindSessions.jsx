import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Toast from '../components/Toast'
import Logo from '../components/Logo'

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${minutes} ${ampm}`
}

const formatDuration = (mins) => {
  if (!mins) return ''
  if (mins < 60) return `${mins}min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

const getEndTime = (time, duration) => {
  if (!time || !duration) return ''
  const [h, m] = time.split(':').map(Number)
  const end = new Date()
  end.setHours(h, m + duration, 0, 0)
  const eh = end.getHours()
  const em = String(end.getMinutes()).padStart(2, '0')
  const ampm = eh >= 12 ? 'PM' : 'AM'
  return `${eh % 12 || 12}:${em} ${ampm}`
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function FindSessions() {
  const [cooldownInfo, setCooldownInfo] = useState(null)
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [recommended, setRecommended] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const [selectedSession, setSelectedSession] = useState(null)
  const [collapsed, setCollapsed] = useState({})
  const [recommendedCollapsed, setRecommendedCollapsed] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchSessions(token)
    fetchRecommended(token)
  }, [])

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userId = JSON.parse(localStorage.getItem('user')).id
      const today = new Date().toISOString().split('T')[0]
      const filtered = res.data.filter(s =>
        s.hostId !== userId && s.date >= today
      )
      setSessions(filtered)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const fetchRecommended = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions/recommended`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRecommended(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleJoin = async (sessionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Joined! You\'ve been added to the group chat 💬')
      setSelectedSession(null)
      fetchSessions(token)
    } catch (err) {
      const data = err.response?.data
      if (data?.cooldown) {
        setCooldownInfo({ sessionId, minutesLeft: data.minutesLeft, canRequest: data.canRequest })
      } else {
        showToast(data?.error || 'Failed to join session', 'error')
      }
    }
  }

  const handleRequestRejoin = async (sessionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/request-rejoin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Rejoin request sent to host! 🙏')
      setCooldownInfo(prev => ({ ...prev, canRequest: false }))
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send request', 'error')
    }
  }

  const toggleSection = (courseCode) => {
    setCollapsed(prev => ({ ...prev, [courseCode]: !prev[courseCode] }))
  }

  const courseCodes = ['All', ...new Set(sessions.map(s => s.courseCode))]

  const filtered = sessions.filter(s => {
    const matchChip = activeChip === 'All' || s.courseCode === activeChip
    const matchSearch = !search ||
      s.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      s.courseName.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
    return matchChip && matchSearch
  })

  const grouped = filtered.reduce((acc, session) => {
    const key = session.courseCode
    if (!acc[key]) acc[key] = []
    acc[key].push(session)
    return acc
  }, {})

  const SessionCard = ({ session }) => (
    <div
      className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
      onClick={() => setSelectedSession(session)}
    >
      {/* Accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${session.status === 'full' ? 'bg-red-400' : 'bg-green-400'}`} />

      <div className="flex justify-between items-start mb-3 mt-1">
        <div>
          <span className="font-bold text-ncat-blue text-lg">{session.courseCode}</span>
          <p className="text-xs text-gray-400">{session.courseName}</p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {session.status}
        </span>
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {formatTime(session.time)}{session.duration && ` → ${getEndTime(session.time, session.duration)}`}</p>
          <p className="text-gray-500 text-sm mb-2">📍 {session.location}{session.roomDetails && ` — ${session.roomDetails}`}</p>
          {session.duration && (
            <p className="text-gray-400 text-xs mb-2">⏱️ {formatDuration(session.duration)}</p>
          )}
          {session.description && (
            <p className="text-gray-600 text-xs bg-gray-50 rounded-xl p-2.5 mb-2 line-clamp-2">{session.description}</p>
          )}
          {session.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {session.tags.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs bg-blue-50 text-ncat-blue font-semibold px-2 py-0.5 rounded-full">{tag}</span>
              ))}
              {session.tags.length > 3 && (
                <span className="text-xs text-gray-400">+{session.tags.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div
          className="flex flex-col items-center gap-1 flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${session.host?.id}`) }}
        >
          <div className={`w-14 h-14 ${getColor(session.host?.name)} rounded-2xl flex items-center justify-center text-white font-bold text-lg hover:opacity-80 transition overflow-hidden`}
            style={{ padding: '2px', background: session.host?.borderColor || undefined }}>
            <div className={`w-full h-full rounded-xl flex items-center justify-center overflow-hidden ${getColor(session.host?.name)}`}>
              {session.host?.avatar ? (
                <img src={session.host.avatar} alt={session.host.name} className="w-full h-full object-cover" />
              ) : getInitials(session.host?.name)}
            </div>
          </div>
          <span className="text-xs text-ncat-blue font-semibold text-center hover:underline max-w-16 truncate">
            {session.host?.name?.split(' ')[0]}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center">
          {session.members?.slice(0, 4).map((member, i) => (
            <div
              key={member.userId || i}
              className={`w-7 h-7 ${getColor(member.user?.name || 'User')} rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs overflow-hidden`}
              style={{ marginLeft: i > 0 ? '-8px' : '0' }}
              title={member.user?.name}
            >
              {member.user?.avatar ? (
                <img src={member.user.avatar} alt="" className="w-full h-full object-cover" />
              ) : getInitials(member.user?.name || 'U')}
            </div>
          ))}
          {session.members?.length > 4 && (
            <div className="w-7 h-7 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center text-gray-500 font-bold text-xs" style={{ marginLeft: '-8px' }}>
              +{session.members.length - 4}
            </div>
          )}
          {session.members?.length === 0 && (
            <span className="text-xs text-gray-400">Be the first to join!</span>
          )}
        </div>
        <span className="text-sm text-gray-400 font-semibold">👥 {session.members?.length}/{session.maxParticipants}</span>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading sessions...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-8 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header Banner */}
        <div className="bg-gradient-to-br from-ncat-blue to-blue-900 rounded-3xl p-7 mb-8 text-white shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-ncat-gold opacity-10 rounded-full" />
          <div className="absolute -right-4 bottom-0 w-20 h-20 bg-white opacity-5 rounded-full" />
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Find Study Sessions 🔍</h1>
            <p className="text-blue-200">Browse upcoming sessions from fellow Aggies</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by course, topic, or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncat-blue bg-white shadow-sm text-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-hide">
          {courseCodes.map(code => (
            <button
              key={code}
              onClick={() => setActiveChip(code)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition shadow-sm ${
                activeChip === code
                  ? 'bg-ncat-blue text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-ncat-blue hover:text-ncat-blue'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Recommended Section */}
        {recommended.length > 0 && (
          <div className="mb-8">
            <button
              className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition"
              onClick={() => setRecommendedCollapsed(!recommendedCollapsed)}
            >
              <h2 className="text-lg font-bold text-ncat-blue">🎯 Recommended for You</h2>
              <span className="bg-ncat-gold text-ncat-blue text-xs font-bold px-2 py-1 rounded-full">
                {recommended.length}
              </span>
              <span className="ml-auto text-ncat-blue text-lg">
                {recommendedCollapsed ? '▾' : '▴'}
              </span>
            </button>

            {!recommendedCollapsed && (
              <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
                {recommended.map(session => (
                  <div
                    key={session.id}
                    className="flex-shrink-0 w-64 bg-white rounded-2xl shadow-sm p-4 hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ncat-blue to-ncat-gold" />
                    <div className="flex justify-between items-start mb-3 mt-1">
                      <span className="font-bold text-ncat-blue">{session.courseCode}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-600">open</span>
                    </div>
                    <div
                      className="flex items-center gap-2 mb-3 cursor-pointer group"
                      onClick={(e) => { e.stopPropagation(); navigate(`/profile/${session.host?.id}`) }}
                    >
                      <div className={`w-7 h-7 ${getColor(session.host?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden`}>
                        {session.host?.avatar ? (
                          <img src={session.host.avatar} alt={session.host.name} className="w-full h-full object-cover" />
                        ) : getInitials(session.host?.name)}
                      </div>
                      <span className="text-xs text-ncat-blue font-semibold group-hover:underline truncate">
                        {session.host?.name?.split(' ')[0]}
                      </span>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">📅 {session.date} at {formatTime(session.time)}</p>
                    <p className="text-gray-500 text-xs mb-3">📍 {session.location}</p>
                    {session.description && (
                      <p className="text-gray-600 text-xs bg-gray-50 rounded-xl p-2 mb-3 line-clamp-2">{session.description}</p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                      {session.score >= 10 ? (
                        <span className="text-xs bg-ncat-gold bg-opacity-20 text-ncat-blue font-bold px-2 py-0.5 rounded-full border border-ncat-gold border-opacity-30">
                          📚 Your Course
                        </span>
                      ) : (
                        <span className="text-xs bg-blue-50 text-ncat-blue font-bold px-2 py-0.5 rounded-full border border-blue-200">
                          🎓 Same Major
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* All Sessions grouped by course */}
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500 font-medium text-lg">No sessions found</p>
            <p className="text-gray-400 text-sm mt-1">Try a different search or check back later</p>
          </div>
        ) : (
          Object.entries(grouped).map(([courseCode, courseSessions]) => (
            <div key={courseCode} className="mb-8">
              <button
                className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition"
                onClick={() => toggleSection(courseCode)}
              >
                <h2 className="text-lg font-bold text-ncat-blue">{courseCode}</h2>
                <span className="text-sm text-gray-400 truncate">{courseSessions[0].courseName}</span>
                <span className="bg-ncat-blue text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                  {courseSessions.length} session{courseSessions.length > 1 ? 's' : ''}
                </span>
                <span className="text-ncat-blue text-lg ml-auto">
                  {collapsed[courseCode] ? '▾' : '▴'}
                </span>
              </button>

              {!collapsed[courseCode] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courseSessions.slice(0, 2).map(session => (
                    <SessionCard key={session.id} session={session} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Cooldown Modal */}
      {cooldownInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">⏳</p>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Cooldown Active</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                You must wait <span className="font-semibold text-ncat-blue">{cooldownInfo.minutesLeft} more minute{cooldownInfo.minutesLeft > 1 ? 's' : ''}</span> before rejoining.
              </p>
              {cooldownInfo.canRequest && (
                <p className="text-gray-400 text-xs mt-2">Or ask the host to let you back in early.</p>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {cooldownInfo.canRequest && (
                <button onClick={() => handleRequestRejoin(cooldownInfo.sessionId)}
                  className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition">
                  🙏 Request Host to Let Me In
                </button>
              )}
              {!cooldownInfo.canRequest && (
                <div className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl text-center text-sm">
                  Request already sent — waiting for host
                </div>
              )}
              <button onClick={() => setCooldownInfo(null)}
                className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            {/* Modal header accent */}
            <div className="h-1.5 bg-gradient-to-r from-ncat-blue to-ncat-gold" />
            <div className="p-6">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h2 className="text-xl font-bold text-ncat-blue">{selectedSession.courseCode}</h2>
                  <p className="text-xs text-gray-400">{selectedSession.courseName}</p>
                </div>
                <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
              </div>

              {/* Host */}
              <div
                className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-blue-50 transition group"
                onClick={() => { setSelectedSession(null); navigate(`/profile/${selectedSession.host?.id}`) }}
              >
                <div className={`w-12 h-12 ${getColor(selectedSession.host?.name)} rounded-xl flex items-center justify-center text-white font-bold overflow-hidden`}>
                  {selectedSession.host?.avatar ? (
                    <img src={selectedSession.host.avatar} alt={selectedSession.host.name} className="w-full h-full object-cover" />
                  ) : getInitials(selectedSession.host?.name)}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Hosted by</p>
                  <p className="text-ncat-blue font-semibold group-hover:underline">{selectedSession.host?.name}</p>
                </div>
                <span className="text-gray-300 text-lg">→</span>
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <p className="text-gray-600 text-sm">📅 {selectedSession.date} at {formatTime(selectedSession.time)}{selectedSession.duration && ` → ${getEndTime(selectedSession.time, selectedSession.duration)}`}</p>
                {selectedSession.duration && <p className="text-gray-400 text-sm">⏱️ {formatDuration(selectedSession.duration)}</p>}
                <p className="text-gray-600 text-sm">📍 {selectedSession.location}{selectedSession.roomDetails && ` — ${selectedSession.roomDetails}`}</p>
                <p className="text-gray-600 text-sm">👥 {selectedSession.members?.length}/{selectedSession.maxParticipants} spots filled</p>
              </div>

              {/* Members */}
              {selectedSession.members?.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-wide">Members</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedSession.members.map((member, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-50 rounded-full px-2 py-1">
                        <div className={`w-6 h-6 ${getColor(member.user?.name || 'User')} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden`}>
                          {member.user?.avatar ? (
                            <img src={member.user.avatar} alt="" className="w-full h-full object-cover" />
                          ) : getInitials(member.user?.name || 'U')}
                        </div>
                        <span className="text-xs text-gray-600 font-medium">{member.user?.name?.split(' ')[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedSession.description && (
                <div className="bg-gray-50 rounded-xl p-3.5 mb-4">
                  <p className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">About</p>
                  <p className="text-sm text-gray-700">{selectedSession.description}</p>
                </div>
              )}

              {/* Tags */}
              {selectedSession.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {selectedSession.tags.map(tag => (
                    <span key={tag} className="text-xs bg-blue-50 text-ncat-blue font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
              )}

              <button
                onClick={() => handleJoin(selectedSession.id)}
                disabled={selectedSession.status === 'full'}
                className="w-full bg-ncat-gold text-ncat-blue font-bold py-3.5 rounded-xl hover:opacity-90 transition disabled:opacity-40 text-base shadow-md"
              >
                {selectedSession.status === 'full' ? '🔴 Session Full' : 'Join Session 🐾'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}