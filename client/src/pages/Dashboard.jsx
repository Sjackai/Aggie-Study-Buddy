import Toast from '../components/Toast'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Dashboard() {
  const [toast, setToast] = useState(null)
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
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
    fetchSessions(token)
  }, [])

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const handleJoin = async (sessionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`http://localhost:5000/api/sessions/${sessionId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchSessions(token)
      showToast('Joined session successfully! 🐾')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to join session', 'error')
    }
  }

  const handleCreateSession = async () => {
    const token = localStorage.getItem('token')
    try {
      await axios.post('http://localhost:5000/api/sessions', newSession, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowCreate(false)
      setNewSession({ courseCode: '', courseName: '', date: '', time: '', location: '', description: '', maxParticipants: 6 })
      fetchSessions(token)
      showToast('Session created! 🎉')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to create session', 'error')
    }
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
          <div className="w-9 h-9 bg-ncat-gold rounded-full flex items-center justify-center">
            <span className="text-ncat-blue font-bold text-xs">A&T</span>
          </div>
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-blue-200 text-sm">👋 {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-white text-ncat-blue font-semibold text-sm px-4 py-2 rounded-xl hover:opacity-90 transition"
          >
            Log Out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Welcome Banner */}
        <div className="bg-ncat-blue rounded-2xl p-6 mb-8 text-white">
          <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name?.split(' ')[0]}! 🐾</h1>
          <p className="text-blue-200">{user?.major} · {user?.year} · NC A&T State University</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { emoji: '➕', label: 'Create Session', color: 'bg-green-50 border-green-200', onClick: () => setShowCreate(true) },
            { emoji: '🔍', label: 'Find Partners', color: 'bg-blue-50 border-blue-200', onClick: () => navigate('/partners') },
            { emoji: '💬', label: 'Messages', color: 'bg-yellow-50 border-yellow-200', onClick: () => {} },
            { emoji: '🗺️', label: 'Campus Map', color: 'bg-red-50 border-red-200', onClick: () => {} },
          ].map((action, i) => (
            <button key={i} onClick={action.onClick} className={`${action.color} border rounded-2xl p-4 text-center hover:shadow-md transition`}>
              <div className="text-3xl mb-2">{action.emoji}</div>
              <p className="text-sm font-semibold text-gray-700">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Sessions */}
        <div>
          <h2 className="text-xl font-bold text-ncat-blue mb-4">📅 Study Sessions</h2>
          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-4xl mb-3">📚</p>
              <p className="text-gray-500 font-medium">No sessions yet — be the first to create one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map(session => (
                <div key={session.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-ncat-blue font-bold text-lg">{session.courseCode}</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {session.status}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {session.time}</p>
                  <p className="text-gray-500 text-sm mb-1">📍 {session.location}</p>
                  <p className="text-gray-500 text-sm mb-3">👤 Host: {session.host?.name}</p>
                  {session.description && (
                    <p className="text-gray-600 text-sm mb-3 bg-gray-50 rounded-lg p-2">{session.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                    <button
                      onClick={() => handleJoin(session.id)}
                      disabled={session.status === 'full'}
                      className="bg-ncat-gold text-ncat-blue text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition disabled:opacity-40"
                    >
                      Join
                    </button>
                  </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ncat-blue mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. COMP 285"
                    value={newSession.courseCode}
                    onChange={e => setNewSession({...newSession, courseCode: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ncat-blue mb-1">Course Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Programming I"
                    value={newSession.courseName}
                    onChange={e => setNewSession({...newSession, courseName: e.target.value})}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                  />
                </div>
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

      {/* Toast Notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

    </div>
  )
}