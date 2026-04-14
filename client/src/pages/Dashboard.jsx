import Logo from '../components/Logo'
import CourseSelector from '../components/CourseSelector'
import Toast from '../components/Toast'
import KudosModal from '../components/KudosModal'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import hashtags from '../data/hashtags'

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${minutes} ${ampm}`
}

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function Dashboard() {
  const [showKudos, setShowKudos] = useState(false)
  const [kudosSession, setKudosSession] = useState(null)
  const [kudosPrompt, setKudosPrompt] = useState(null)
  const [toast, setToast] = useState(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [leaveConfirm, setLeaveConfirm] = useState(null)
  const [notifications, setNotifications] = useState({
    total: 0,
    connectionRequests: [],
    messageRequests: [],
    unreadDirect: [],
    unreadGroup: []
  })
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mySessions, setMySessions] = useState({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [activeHashtagCategory, setActiveHashtagCategory] = useState('Session Type')
  const [newSession, setNewSession] = useState({
    courseCode: '', courseName: '', date: '', time: '', location: '', description: '', maxParticipants: 6, tags: []
  })
  const notifRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const hashtagCategories = [...new Set(hashtags.map(h => h.category))]

  const toggleTag = (tag) => {
    if (newSession.tags.includes(tag)) {
      setNewSession(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
    } else {
      if (newSession.tags.length >= 5) return
      setNewSession(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(stored))
    fetchMySessions(token, JSON.parse(stored).id)
    checkKudosEligible(token)
    fetchNotifications(token)

    const interval = setInterval(() => {
      fetchNotifications(token)
    }, 10000)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchNotifications(token)
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchNotifications = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNotifications(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMySessions = async (token, userId) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const today = new Date().toISOString().split('T')[0]
      const mine = res.data.filter(s =>
        s.hostId === userId || s.members?.some(m => m.userId === userId)
      )
      setMySessions({
        upcoming: mine.filter(s => s.date >= today),
        past: mine.filter(s => s.date < today)
      })
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleAccept = async (connectionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.put(`${API_URL}/api/connections/${connectionId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotifications(token)
      showToast('Connection accepted! 🤝')
    } catch (err) {
      showToast('Failed to accept', 'error')
    }
  }

  const handleDecline = async (connectionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.put(`${API_URL}/api/connections/${connectionId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchNotifications(token)
      showToast('Request declined')
    } catch (err) {
      showToast('Failed to decline', 'error')
    }
  }

  const checkKudosEligible = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/kudos/eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.length > 0) setKudosPrompt(res.data[0])
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleCreateSession = async () => {
    const token = localStorage.getItem('token')
    const stored = JSON.parse(localStorage.getItem('user'))
    try {
      await axios.post(`${API_URL}/api/sessions`, newSession, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowCreate(false)
      setNewSession({ courseCode: '', courseName: '', date: '', time: '', location: '', description: '', maxParticipants: 6, tags: [] })
      fetchMySessions(token, stored.id)
      showToast('Session created! Check Messages for your group chat 💬')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create session', 'error')
    }
  }

  const handleLeaveSession = async (sessionId) => {
    const token = localStorage.getItem('token')
    const stored = JSON.parse(localStorage.getItem('user'))
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setLeaveConfirm(null)
      fetchMySessions(token, stored.id)
      showToast('You have left the session')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to leave session', 'error')
    }
  }

  const isKudosEligible = (session) => {
    const sessionDate = new Date(session.date)
    const now = new Date()
    const diffHours = (now - sessionDate) / (1000 * 60 * 60)
    return diffHours <= 24 && diffHours >= 0
  }

  const totalMessageNotifs = notifications.unreadDirect.length + notifications.messageRequests.length + notifications.unreadGroup.length

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
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm hidden md:block">👋 {user?.name}</span>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-white hover:text-ncat-gold transition"
            >
              🔔
              {notifications.total > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {notifications.total}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <p className="font-bold text-ncat-blue">Notifications</p>
                  {notifications.total > 0 && (
                    <span className="bg-red-100 text-red-500 text-xs font-bold px-2 py-1 rounded-full">
                      {notifications.total} new
                    </span>
                  )}
                </div>

                {notifications.total === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-2xl mb-2">🔔</p>
                    <p className="text-gray-400 text-sm">No new notifications</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">

                    {notifications.connectionRequests.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Connection Requests</p>
                      </div>
                    )}
                    {notifications.connectionRequests.map(req => (
                      <div key={req.id} className="p-4 border-b border-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`w-10 h-10 ${getColor(req.fromUser.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {getInitials(req.fromUser.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{req.fromUser.name}</p>
                            <p className="text-xs text-gray-400 truncate">{req.fromUser.major} · wants to connect</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAccept(req.id)}
                            className="flex-1 bg-ncat-blue text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 transition">
                            Accept
                          </button>
                          <button onClick={() => handleDecline(req.id)}
                            className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-xl hover:bg-gray-50 transition">
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}

                    {notifications.messageRequests.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Message Requests</p>
                      </div>
                    )}
                    {notifications.messageRequests.map(req => (
                      <div key={req.userId} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => { setShowNotifications(false); navigate('/messages') }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getColor(req.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {getInitials(req.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{req.name}</p>
                            <p className="text-xs text-gray-800 font-bold truncate">{req.lastMessage || 'Sent you a message request'}</p>
                          </div>
                          <span className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}

                    {notifications.unreadDirect.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">New Messages</p>
                      </div>
                    )}
                    {notifications.unreadDirect.map(msg => (
                      <div key={msg.userId} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => { setShowNotifications(false); navigate('/messages') }}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${getColor(msg.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                            {getInitials(msg.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{msg.name}</p>
                            <p className="text-xs text-gray-800 font-bold truncate">{msg.lastMessage || 'Sent you a message'}</p>
                          </div>
                          <span className="w-2 h-2 bg-ncat-blue rounded-full flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}

                    {notifications.unreadGroup.length > 0 && (
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Group Chat Activity</p>
                      </div>
                    )}
                    {notifications.unreadGroup.map(chat => (
                      <div key={chat.chatId} className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                        onClick={() => { setShowNotifications(false); navigate('/messages') }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-ncat-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            👥
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{chat.chatName}</p>
                            <p className="text-xs text-gray-800 font-bold truncate">
                              {chat.lastSender ? `${chat.lastSender}: ${chat.lastMessage}` : `${chat.unreadCount} new message${chat.unreadCount > 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <button onClick={() => navigate('/profile')}
            className="bg-ncat-gold text-ncat-blue font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition">
            👤 Profile
          </button>
          <button onClick={handleLogout}
            className="bg-white text-ncat-blue font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition">
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Kudos Prompt Banner */}
        {kudosPrompt && (
          <div className="bg-ncat-gold rounded-2xl p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="font-bold text-ncat-blue text-lg">⭐ Give Kudos!</p>
              <p className="text-ncat-blue text-sm">Your <span className="font-semibold">{kudosPrompt.courseCode}</span> session just ended. Want to recognize your study group?</p>
            </div>
            <div className="flex gap-2 ml-4">
              <button onClick={() => { setKudosSession(kudosPrompt); setShowKudos(true); setKudosPrompt(null) }}
                className="bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm whitespace-nowrap">
                Yes! ⭐
              </button>
              <button onClick={() => setKudosPrompt(null)}
                className="bg-white text-ncat-blue font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm whitespace-nowrap">
                Maybe Later
              </button>
            </div>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="bg-ncat-blue rounded-2xl p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 🐾</h1>
          <p className="text-blue-200">{user?.major} · {user?.year} · NC A&T State University</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { emoji: '➕', label: 'Create Session', color: 'bg-green-50 border-green-200', onClick: () => setShowCreate(true) },
            { emoji: '🔍', label: 'Find Sessions', color: 'bg-blue-50 border-blue-200', onClick: () => navigate('/find-sessions') },
            { emoji: '🤝', label: 'Find Partners', color: 'bg-yellow-50 border-yellow-200', onClick: () => navigate('/partners') },
            { emoji: '💬', label: 'Messages', color: 'bg-red-50 border-red-200', onClick: () => navigate('/messages'), badge: totalMessageNotifs },
          ].map((action, i) => (
            <button key={i} onClick={action.onClick} className={`${action.color} border rounded-2xl p-4 text-center hover:shadow-md transition relative`}>
              <div className="text-3xl mb-2">{action.emoji}</div>
              <p className="text-sm font-semibold text-gray-700">{action.label}</p>
              {action.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {action.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* My Sessions */}
        <div>
          <h2 className="text-xl font-bold text-ncat-blue mb-4">📋 My Sessions</h2>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${activeTab === 'upcoming' ? 'bg-ncat-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-ncat-blue'}`}>
              Upcoming ({mySessions.upcoming.length})
            </button>
            <button onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${activeTab === 'past' ? 'bg-ncat-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-ncat-blue'}`}>
              Past ({mySessions.past.length})
            </button>
          </div>

          {(activeTab === 'upcoming' ? mySessions.upcoming : mySessions.past).length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">{activeTab === 'upcoming' ? '📅' : '📜'}</p>
              <p className="text-gray-500 font-medium">
                {activeTab === 'upcoming' ? "No upcoming sessions — create one or find one to join!" : "No past sessions yet"}
              </p>
              {activeTab === 'upcoming' && (
                <div className="flex gap-3 justify-center mt-4">
                  <button onClick={() => setShowCreate(true)} className="bg-ncat-gold text-ncat-blue font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm">
                    Create Session
                  </button>
                  <button onClick={() => navigate('/find-sessions')} className="bg-ncat-blue text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm">
                    Find Sessions
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(activeTab === 'upcoming' ? mySessions.upcoming : mySessions.past).map(session => (
                <div key={session.id} className={`bg-white rounded-2xl border p-5 hover:shadow-md transition ${activeTab === 'past' ? 'opacity-75 border-gray-100' : 'border-gray-100'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-ncat-blue font-bold text-lg">{session.courseCode}</span>
                    <div className="flex gap-2 items-center">
                      {session.hostId === user?.id && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-ncat-gold text-ncat-blue">Host</span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${activeTab === 'past' ? 'bg-gray-100 text-gray-500' : session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {activeTab === 'past' ? 'completed' : session.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {formatTime(session.time)}</p>
                  <p className="text-gray-500 text-sm mb-1">📍 {session.location}</p>
                  <div className="flex items-center gap-2 mb-3 cursor-pointer group" onClick={() => navigate(`/profile/${session.host?.id}`)}>
                    <div className={`w-6 h-6 ${getColor(session.host?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                      {getInitials(session.host?.name)}
                    </div>
                    <span className="text-sm text-ncat-blue font-semibold group-hover:underline">{session.host?.name}</span>
                  </div>
                  {session.description && (
                    <p className="text-gray-600 text-sm mb-3 bg-gray-50 rounded-lg p-2">{session.description}</p>
                  )}
                  {session.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {session.tags.map(tag => (
                        <span key={tag} className="text-xs bg-blue-50 text-ncat-blue font-semibold px-2 py-1 rounded-full">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                    {activeTab === 'upcoming' && session.hostId !== user?.id && (
                      <button
                        onClick={() => setLeaveConfirm(session)}
                        className="text-red-400 hover:text-red-600 text-xs font-semibold transition"
                      >
                        Leave
                      </button>
                    )}
                  </div>

                  {activeTab === 'past' && (
                    <div className="relative group mt-3">
                      <button
                        onClick={() => {
                          if (!isKudosEligible(session)) return
                          setKudosSession(session)
                          setShowKudos(true)
                        }}
                        disabled={!isKudosEligible(session)}
                        className={`w-full text-sm font-bold py-2 rounded-xl transition ${isKudosEligible(session) ? 'bg-ncat-gold text-ncat-blue hover:opacity-90' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                      >
                        ⭐ Give Kudos
                      </button>
                      {!isKudosEligible(session) && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none text-center z-10">
                          Kudos can only be given within 24 hours of the session ending
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Leave Session Warning Modal */}
      {leaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">⚠️</p>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Leave Session?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                If you leave <span className="font-semibold text-ncat-blue">{leaveConfirm.courseCode}</span> you will be removed from the group chat.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                You'll need to wait <span className="font-semibold">30 minutes</span> or get host approval to rejoin.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setLeaveConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
              >
                Stay
              </button>
              <button
                onClick={() => handleLeaveSession(leaveConfirm.id)}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ncat-blue">Create Study Session</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Course</label>
                <CourseSelector
                  value={newSession.courseCode ? `${newSession.courseCode} — ${newSession.courseName}` : ''}
                  onChange={({ code, name }) => setNewSession({...newSession, courseCode: code, courseName: name})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ncat-blue mb-1">Date</label>
                  <input type="date" value={newSession.date}
                    onChange={e => setNewSession({...newSession, date: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ncat-blue mb-1">Time</label>
                  <select value={newSession.time} onChange={e => setNewSession({...newSession, time: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue">
                    <option value="">Select time</option>
                    {['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00','19:30','20:00','20:30','21:00','21:30','22:00'].map(t => {
                      const [h, m] = t.split(':')
                      const hour = parseInt(h)
                      const ampm = hour >= 12 ? 'PM' : 'AM'
                      const display = `${hour % 12 || 12}:${m} ${ampm}`
                      return <option key={t} value={t}>{display}</option>
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Location</label>
                <select value={newSession.location} onChange={e => setNewSession({...newSession, location: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue">
                  <option value="">Select a location</option>
                  <option>Bluford Library</option>
                  <option>Crosby Hall</option>
                  <option>GCB</option>
                  <option>Frye Hall</option>
                  <option>Martin Sr. Engineering Complex</option>
                  <option>Marteena Hall</option>
                  <option>McNair Hall</option>
                  <option>Merrick Hall</option>
                  <option>Price Heat</option>
                  <option>Proctor Hall</option>
                  <option>Smith Hall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Description</label>
                <textarea placeholder="What will you study? Any specific topics?"
                  value={newSession.description} onChange={e => setNewSession({...newSession, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue h-20 resize-none" />
              </div>

              {/* Hashtags */}
              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-2">
                  Tags <span className="text-gray-400 font-normal">(up to 5)</span>
                </label>
                {newSession.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3 p-2 bg-gray-50 rounded-xl">
                    {newSession.tags.map(tag => (
                      <span key={tag} onClick={() => toggleTag(tag)}
                        className="bg-ncat-blue text-white text-xs font-semibold px-3 py-1 rounded-full cursor-pointer hover:opacity-80">
                        {tag} ✕
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-2">
                  {hashtagCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveHashtagCategory(cat)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition ${activeHashtagCategory === cat ? 'bg-ncat-blue text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hashtags.filter(h => h.category === activeHashtagCategory).map(({ tag }) => (
                    <button key={tag} onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${newSession.tags.includes(tag) ? 'bg-ncat-gold text-ncat-blue border-ncat-gold' : 'bg-white text-gray-600 border-gray-200 hover:border-ncat-blue'}`}>
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Max Participants</label>
                <select value={newSession.maxParticipants}
                  onChange={e => setNewSession({...newSession, maxParticipants: parseInt(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue">
                  {[2,3,4,5,6,7,8,10].map(n => <option key={n} value={n}>{n} people</option>)}
                </select>
              </div>

              <button onClick={handleCreateSession}
                className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition">
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
{/* Leave Session Warning Modal */}
{leaveConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
      <div className="text-center mb-6">
        <p className="text-4xl mb-3">⚠️</p>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Leave Session?</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          If you leave <span className="font-semibold text-ncat-blue">{leaveConfirm.courseCode}</span> you will be removed from the group chat.
        </p>
        <p className="text-gray-500 text-sm mt-2">
          You'll need to wait <span className="font-semibold">30 minutes</span> or get host approval to rejoin.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => setLeaveConfirm(null)}
          className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
        >
          Stay
        </button>
        <button
          onClick={() => handleLeaveSession(leaveConfirm.id)}
          className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
        >
          Leave
        </button>
      </div>
    </div>
  </div>
)}
      {/* Kudos Modal */}
      {showKudos && kudosSession && (
        <KudosModal
          session={kudosSession}
          onClose={() => { setShowKudos(false); setKudosSession(null) }}
          onSuccess={() => { setShowKudos(false); setKudosSession(null); showToast('Kudos sent! ⭐') }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}