import Logo from '../components/Logo'
import CourseSelector from '../components/CourseSelector'
import Toast from '../components/Toast'
import KudosModal from '../components/KudosModal'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'

export default function Dashboard() {
  const [showKudos, setShowKudos] = useState(false)
  const [kudosSession, setKudosSession] = useState(null)
  const [kudosPrompt, setKudosPrompt] = useState(null)
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [mySessions, setMySessions] = useState({ upcoming: [], past: [] })
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [newSession, setNewSession] = useState({
    courseCode: '', courseName: '', date: '', time: '', location: '', description: '', maxParticipants: 6
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
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
  }, [])

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

  const checkKudosEligible = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/kudos/eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data.length > 0) {
        // Show prompt for the first eligible session
        setKudosPrompt(res.data[0])
      }
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
      setNewSession({ courseCode: '', courseName: '', date: '', time: '', location: '', description: '', maxParticipants: 6 })
      fetchMySessions(token, stored.id)
      showToast('Session created! 🎉')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create session', 'error')
    }
  }

  // Check if session is within 24hr kudos window
  const isKudosEligible = (session) => {
    const sessionDate = new Date(session.date)
    const now = new Date()
    const diffHours = (now - sessionDate) / (1000 * 60 * 60)
    return diffHours <= 48 && diffHours >= 0
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">👋 {user?.name}</span>
          <button
            onClick={() => navigate('/profile')}
            className="bg-ncat-gold text-ncat-blue font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition"
          >
            👤 Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-white text-ncat-blue font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition"
          >
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
              <button
                onClick={() => {
                  setKudosSession(kudosPrompt)
                  setShowKudos(true)
                  setKudosPrompt(null)
                }}
                className="bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm whitespace-nowrap"
              >
                Yes! ⭐
              </button>
              <button
                onClick={() => setKudosPrompt(null)}
                className="bg-white text-ncat-blue font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm whitespace-nowrap"
              >
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
            { emoji: '💬', label: 'Messages', color: 'bg-red-50 border-red-200', onClick: () => navigate('/messages') },
          ].map((action, i) => (
            <button key={i} onClick={action.onClick} className={`${action.color} border rounded-2xl p-4 text-center hover:shadow-md transition`}>
              <div className="text-3xl mb-2">{action.emoji}</div>
              <p className="text-sm font-semibold text-gray-700">{action.label}</p>
            </button>
          ))}
        </div>

        {/* My Sessions */}
        <div>
          <h2 className="text-xl font-bold text-ncat-blue mb-4">📋 My Sessions</h2>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${activeTab === 'upcoming' ? 'bg-ncat-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-ncat-blue'}`}
            >
              Upcoming ({mySessions.upcoming.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-xl font-semibold text-sm transition ${activeTab === 'past' ? 'bg-ncat-blue text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-ncat-blue'}`}
            >
              Past ({mySessions.past.length})
            </button>
          </div>

          {/* Session Cards */}
          {(activeTab === 'upcoming' ? mySessions.upcoming : mySessions.past).length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">{activeTab === 'upcoming' ? '📅' : '📜'}</p>
              <p className="text-gray-500 font-medium">
                {activeTab === 'upcoming'
                  ? "No upcoming sessions — create one or find one to join!"
                  : "No past sessions yet"}
              </p>
              {activeTab === 'upcoming' && (
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="bg-ncat-gold text-ncat-blue font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm"
                  >
                    Create Session
                  </button>
                  <button
                    onClick={() => navigate('/find-sessions')}
                    className="bg-ncat-blue text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm"
                  >
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
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-ncat-gold text-ncat-blue">
                          Host
                        </span>
                      )}
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${activeTab === 'past' ? 'bg-gray-100 text-gray-500' : session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {activeTab === 'past' ? 'completed' : session.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {session.time}</p>
                  <p className="text-gray-500 text-sm mb-1">📍 {session.location}</p>
                  <p className="text-gray-500 text-sm mb-3">👤 Host: {session.host?.name}</p>
                  {session.description && (
                    <p className="text-gray-600 text-sm mb-3 bg-gray-50 rounded-lg p-2">{session.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                  </div>

                  {activeTab === 'past' && isKudosEligible(session) && (
                    <button
                      onClick={() => {
                        setKudosSession(session)
                        setShowKudos(true)
                      }}
                      className="mt-3 w-full bg-ncat-gold text-ncat-blue text-sm font-bold py-2 rounded-xl hover:opacity-90 transition"
                    >
                      ⭐ Give Kudos
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
                  <input
                    type="date"
                    value={newSession.date}
                    onChange={e => setNewSession({...newSession, date: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ncat-blue mb-1">Time</label>
                  <input
                    type="time"
                    value={newSession.time}
                    onChange={e => setNewSession({...newSession, time: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Location</label>
                <select
                  value={newSession.location}
                  onChange={e => setNewSession({...newSession, location: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                >
                  <option value="">Select a location</option>
                  <option>Bluford Library</option>
                  <option>Crosby Hall</option>
                  <option>GCB</option>
                  <option>Frye Hall</option>
                  <option>Martin Sr. Engineering Complex</option>
                  <option>Marteena Hall</option>
                  <option>McNair Hall</option>
                  <option>Merrick Hall</option>
                  <option>Price Hall</option>
                  <option>Proctor Hall</option>
                  <option>Smith Hall</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Description</label>
                <textarea
                  placeholder="What will you study? Any specific topics?"
                  value={newSession.description}
                  onChange={e => setNewSession({...newSession, description: e.target.value})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ncat-blue mb-1">Max Participants</label>
                <select
                  value={newSession.maxParticipants}
                  onChange={e => setNewSession({...newSession, maxParticipants: parseInt(e.target.value)})}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                >
                  {[2,3,4,5,6,7,8,10].map(n => <option key={n} value={n}>{n} people</option>)}
                </select>
              </div>

              <button
                onClick={handleCreateSession}
                className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kudos Modal */}
      {showKudos && kudosSession && (
        <KudosModal
          session={kudosSession}
          onClose={() => {
            setShowKudos(false)
            setKudosSession(null)
          }}
          onSuccess={() => {
            setShowKudos(false)
            setKudosSession(null)
            showToast('Kudos sent! ⭐')
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}