import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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

export default function CourseSessions() {
  const navigate = useNavigate()
  const { courseCode } = useParams()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [selectedSession, setSelectedSession] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchSessions(token)
  }, [courseCode])

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const userId = JSON.parse(localStorage.getItem('user')).id
      const today = new Date().toISOString().split('T')[0]
      const filtered = res.data.filter(s =>
        s.courseCode === decodeURIComponent(courseCode) &&
        s.hostId !== userId &&
        s.date >= today
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

  const courseName = sessions[0]?.courseName || decodeURIComponent(courseCode)

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
        <button
          onClick={() => navigate('/find-sessions')}
          className="text-white hover:text-ncat-gold transition font-medium"
        >
          ← Back
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="bg-ncat-blue rounded-2xl p-6 mb-8 text-white">
          <h1 className="text-3xl font-bold mb-1">{decodeURIComponent(courseCode)}</h1>
          <p className="text-blue-200 text-lg">{courseName}</p>
          <p className="text-blue-300 text-sm mt-2">{sessions.length} upcoming session{sessions.length !== 1 ? 's' : ''} available</p>
        </div>

        {/* Sessions */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="text-gray-500 font-medium">No upcoming sessions for this course</p>
            <button
              onClick={() => navigate('/find-sessions')}
              className="mt-4 bg-ncat-blue text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm"
            >
              Browse Other Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(session => (
              <div
                key={session.id}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
                onClick={() => setSelectedSession(session)}
              >
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-ncat-blue text-lg">{session.courseCode}</span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-1">📅 {session.date} at {formatTime(session.time)}</p>
                <p className="text-gray-500 text-sm mb-1">📍 {session.location}</p>
                <p className="text-gray-500 text-sm mb-3 cursor-pointer hover:text-ncat-blue transition"
                onClick={(e) => { e.stopPropagation(); navigate(`/profile/${session.host?.id}`) }}
                >
                  👤 Host: <span className="hover:underline">{session.host?.name}</span>
                  </p>
                {session.description && (
                  <p className="text-gray-600 text-sm bg-gray-50 rounded-lg p-2 mb-3">{session.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">👥 {session.members?.length}/{session.maxParticipants}</span>
                  <span className="text-ncat-blue text-sm font-semibold">Tap to join →</span>
                </div>
              </div>
            ))}
          </div>
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
            <p className="text-gray-500 text-sm mb-1">📅 {selectedSession.date} at {formatTime(selectedSession.time)}</p>
            <p className="text-gray-500 text-sm mb-1">📍 {selectedSession.location}</p>
            <p className="text-gray-500 text-sm mb-3">
              👤 Host:{' '}
              <span
               className="text-ncat-blue hover:underline cursor-pointer font-semibold"
               onClick={(e) => { e.stopPropagation(); navigate(`/profile/${session.host?.id}`) }}
               >
                 {session.host?.name}
                 </span>
                 </p>
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