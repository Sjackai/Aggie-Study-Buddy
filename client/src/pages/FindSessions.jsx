import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Toast from '../components/Toast'

export default function FindSessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
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
      showToast('Joined session successfully! 🐾')
      setSelectedSession(null)
      fetchSessions(token)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to join session', 'error')
    }
  }

  const locations = [...new Set(sessions.map(s => s.location))]

  const filtered = sessions.filter(s => {
    const matchSearch = s.courseCode.toLowerCase().includes(search.toLowerCase()) ||
      s.courseName.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase())
    const matchLocation = !locationFilter || s.location === locationFilter
    return matchSearch && matchLocation
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
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-ncat-gold rounded-full flex items-center justify-center">
            <span className="text-ncat-blue font-bold text-xs">A&T</span>
          </div>
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white hover:text-ncat-gold transition font-medium"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ncat-blue mb-2">Find Study Sessions 🔍</h1>
          <p className="text-gray-500">Browse upcoming sessions from fellow Aggies</p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by course code or name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncat-blue bg-white shadow-sm"
            />
          </div>
          <select
            value={locationFilter}
            onChange={e => setLocationFilter(e.target.value)}
            className="border border-gray-200 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncat-blue bg-white shadow-sm"
          >
            <option value="">All Locations</option>
            {locations.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        {/* Results */}
        {Object.keys(grouped).length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500 font-medium">No sessions found — try a different search!</p>
          </div>
        ) : (
          Object.entries(grouped).map(([courseCode, courseSessions]) => (
            <div key={courseCode} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-ncat-blue">{courseCode}</h2>
                <span className="text-sm text-gray-400">{courseSessions[0].courseName}</span>
                <span className="bg-ncat-blue text-white text-xs font-bold px-2 py-1 rounded-full">
                  {courseSessions.length} session{courseSessions.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseSessions.map(session => (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
                    onClick={() => setSelectedSession(session)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-bold text-gray-800">{session.courseCode}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {session.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {session.time}</p>
                    <p className="text-gray-500 text-sm mb-1">📍 {session.location}</p>
                    <p className="text-gray-500 text-sm mb-3">👤 Host: {session.host?.name}</p>
                    {session.description && (
                      <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-2 mb-3">{session.description}</p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                      <span className="text-ncat-blue text-sm font-semibold">Tap to view →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ncat-blue">{selectedSession.courseCode}</h2>
              <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <p className="text-gray-500 text-sm mb-1">📅 {selectedSession.date} at {selectedSession.time}</p>
            <p className="text-gray-500 text-sm mb-1">📍 {selectedSession.location}</p>
            <p className="text-gray-500 text-sm mb-1">👤 Host: {selectedSession.host?.name}</p>
            <p className="text-gray-500 text-sm mb-4">👥 {selectedSession.members?.length}/{selectedSession.maxParticipants} spots filled</p>
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