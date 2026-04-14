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

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function FindSessions() {
  const [cooldownInfo, setCooldownInfo] = useState(null)
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('All')
  const [selectedSession, setSelectedSession] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchSessions(token)
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

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-8 py-4 flex justify-between items-center">
        <div 
  className="flex items-center gap-3 cursor-pointer"
  onClick={() => navigate('/dashboard')}
>
  <Logo size={36} />
  <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
</div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white hover:text-ncat-gold transition font-medium"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-ncat-blue mb-2">Find Study Sessions 🔍</h1>
          <p className="text-gray-500">Browse upcoming sessions from fellow Aggies</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by course or topic..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncat-blue bg-white shadow-sm"
          />
        </div>

        {/* Horizontal Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          {courseCodes.map(code => (
            <button
              key={code}
              onClick={() => setActiveChip(code)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition border ${
                activeChip === code
                  ? 'bg-ncat-blue text-white border-ncat-blue'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-ncat-blue hover:text-ncat-blue'
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        {/* Results */}
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500 font-medium">No sessions found!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([courseCode, courseSessions]) => (
            <div key={courseCode} className="mb-8">
              <button
                className="flex items-center gap-3 mb-4 w-full text-left hover:opacity-80 transition"
                onClick={() => navigate(`/sessions/${encodeURIComponent(courseCode)}`)}
              >
                <h2 className="text-lg font-bold text-ncat-blue">{courseCode}</h2>
                <span className="text-sm text-gray-400">{courseSessions[0].courseName}</span>
                <span className="bg-ncat-blue text-white text-xs font-bold px-2 py-1 rounded-full">
                  {courseSessions.length} session{courseSessions.length > 1 ? 's' : ''}
                </span>
                <span className="text-ncat-blue text-sm ml-auto">View all →</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseSessions.slice(0, 2).map(session => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer relative overflow-hidden"
                    onClick={() => setSelectedSession(session)}
                  >
                    {/* Top row - course code and status */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-ncat-blue text-lg">{session.courseCode}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {session.status}
                      </span>
                    </div>

                    {/* Main content with host avatar on right */}
                    <div className="flex gap-3">
                      {/* Left side - session details */}
                      <div className="flex-1">
                        <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {formatTime(session.time)}</p>
                        <p className="text-gray-500 text-sm mb-2">📍 {session.location}</p>
                        {session.description && (
                          <p className="text-gray-600 text-xs bg-gray-50 rounded-lg p-2 mb-2 line-clamp-2">{session.description}</p>
                        )}
                      </div>

                      {/* Right side - host avatar */}
                      <div
                        className="flex flex-col items-center gap-1 flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${session.host?.id}`) }}
                      >
                        <div className={`w-16 h-16 ${getColor(session.host?.name)} rounded-2xl flex items-center justify-center text-white font-bold text-xl hover:opacity-80 transition`}>
                          {getInitials(session.host?.name)}
                        </div>
                        <span className="text-xs text-ncat-blue font-semibold text-center hover:underline max-w-16 truncate">
                          {session.host?.name?.split(' ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row - member lobby + spots */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      {/* Member lobby avatars */}
                      <div className="flex items-center">
                        {session.members?.slice(0, 4).map((member, i) => (
                          <div
                            key={member.userId || i}
                            className={`w-7 h-7 ${getColor(member.user?.name || 'User')} rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs`}
                            style={{ marginLeft: i > 0 ? '-8px' : '0' }}
                            title={member.user?.name}
                          >
                            {getInitials(member.user?.name || 'U')}
                          </div>
                        ))}
                        {session.members?.length > 4 && (
                          <div
                            className="w-7 h-7 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center text-gray-600 font-bold text-xs"
                            style={{ marginLeft: '-8px' }}
                          >
                            +{session.members.length - 4}
                          </div>
                        )}
                        {session.members?.length === 0 && (
                          <span className="text-xs text-gray-400">No members yet</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                    </div>
                  </div>
                ))}
              </div>
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
          <button
            onClick={() => handleRequestRejoin(cooldownInfo.sessionId)}
            className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition"
          >
            🙏 Request Host to Let Me In
          </button>
        )}
        {!cooldownInfo.canRequest && (
          <div className="w-full bg-gray-100 text-gray-400 font-bold py-3 rounded-xl text-center text-sm">
            Request already sent — waiting for host
          </div>
        )}
        <button
          onClick={() => setCooldownInfo(null)}
          className="w-full border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}
      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ncat-blue">{selectedSession.courseCode}</h2>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            {/* Host in modal */}
            <div
              className="flex items-center gap-3 mb-4 cursor-pointer group"
              onClick={() => { setSelectedSession(null); navigate(`/profile/${selectedSession.host?.id}`) }}
            >
              <div className={`w-12 h-12 ${getColor(selectedSession.host?.name)} rounded-xl flex items-center justify-center text-white font-bold`}>
                {getInitials(selectedSession.host?.name)}
              </div>
              <div>
                <p className="text-xs text-gray-400">Hosted by</p>
                <p className="text-ncat-blue font-semibold group-hover:underline">{selectedSession.host?.name}</p>
              </div>
            </div>

            <p className="text-gray-500 text-sm mb-1">📅 {selectedSession.date} at {formatTime(selectedSession.time)}</p>
            <p className="text-gray-500 text-sm mb-1">📍 {selectedSession.location}</p>
            <p className="text-gray-500 text-sm mb-4">👥 {selectedSession.members?.length}/{selectedSession.maxParticipants} spots filled</p>

            {/* Member lobby in modal */}
            {selectedSession.members?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Members joined</p>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedSession.members.map((member, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-8 h-8 ${getColor(member.user?.name || 'User')} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                        {getInitials(member.user?.name || 'U')}
                      </div>
                      <span className="text-xs text-gray-600">{member.user?.name?.split(' ')[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedSession.description && (
              <div className="bg-gray-50 rounded-xl p-3 mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">About this session</p>
                <p className="text-sm text-gray-600">{selectedSession.description}</p>
              </div>
            )}
            <button
              onClick={() => handleJoin(selectedSession.id)}
              disabled={selectedSession.status === 'full'}
              className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40"
            >
              {selectedSession.status === 'full' ? 'Session Full' : 'Join Session 🐾'}
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}