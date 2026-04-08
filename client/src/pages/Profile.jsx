import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(null)
  const [form, setForm] = useState({
    name: '', major: '', year: '', bio: ''
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchProfile(token)
    fetchSessions(token)
  }, [])

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data)
      setForm({
        name: res.data.name || '',
        major: res.data.major || '',
        year: res.data.year || '',
        bio: res.data.bio || ''
      })
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(`${API_URL}/api/users/me`, form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      setEditing(false)
      showToast('Profile updated! 🐾')
    } catch (err) {
      showToast('Failed to update profile', 'error')
    }
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
  const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  const userId = user?.id
  const hostedSessions = sessions.filter(s => s.hostId === userId)
  const joinedSessions = sessions.filter(s => s.members?.some(m => m.userId === userId))
  const today = new Date().toISOString().split('T')[0]
  const upcomingSessions = [...hostedSessions, ...joinedSessions].filter(s => s.date >= today)

  const achievements = [
    { icon: '🎓', title: 'First Session', desc: 'Created your first study session', earned: hostedSessions.length >= 1 },
    { icon: '🤝', title: 'Team Player', desc: 'Joined 3+ study sessions', earned: joinedSessions.length >= 3 },
    { icon: '⭐', title: 'Study Star', desc: 'Hosted 5+ sessions', earned: hostedSessions.length >= 5 },
    { icon: '🔥', title: 'On Fire', desc: 'Hosted 10+ sessions', earned: hostedSessions.length >= 10 },
    { icon: '📚', title: 'Scholar', desc: 'Participated in 10+ sessions', earned: joinedSessions.length >= 10 },
    { icon: '🏆', title: 'Aggie Legend', desc: 'Hosted 20+ sessions', earned: hostedSessions.length >= 20 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white hover:text-ncat-gold transition font-medium"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Profile Header */}
        <div className="bg-ncat-blue rounded-2xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-32 translate-x-32" />
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className={`w-24 h-24 ${getColor(user?.name)} rounded-full flex items-center justify-center text-white font-bold text-3xl flex-shrink-0 border-4 border-ncat-gold`}>
              {getInitials(user?.name)}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              {editing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="text-2xl font-bold bg-white bg-opacity-20 text-white border border-white border-opacity-40 rounded-xl px-3 py-1 mb-2 w-full md:w-auto"
                />
              ) : (
                <h1 className="text-3xl font-bold text-white mb-1">{user?.name}</h1>
              )}
              <p className="text-blue-200 mb-1">{user?.email}</p>
              {editing ? (
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                  <input
                    type="text"
                    value={form.major}
                    onChange={e => setForm({...form, major: e.target.value})}
                    placeholder="Major"
                    className="bg-white bg-opacity-20 text-white border border-white border-opacity-40 rounded-xl px-3 py-1 text-sm placeholder-blue-300"
                  />
                  <select
                    value={form.year}
                    onChange={e => setForm({...form, year: e.target.value})}
                    className="bg-white bg-opacity-20 text-white border border-white border-opacity-40 rounded-xl px-3 py-1 text-sm"
                  >
                    <option value="">Select Year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              ) : (
                <p className="text-blue-200">{user?.major || 'No major set'} · {user?.year || 'No year set'}</p>
              )}
            </div>

            {/* Edit Button */}
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-ncat-gold text-ncat-blue font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="bg-white bg-opacity-20 text-white font-bold px-5 py-2 rounded-xl hover:bg-opacity-30 transition text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-white bg-opacity-20 text-white font-bold px-5 py-2 rounded-xl hover:bg-opacity-30 transition text-sm"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { number: hostedSessions.length, label: 'Sessions Hosted' },
            { number: joinedSessions.length, label: 'Sessions Joined' },
            { number: upcomingSessions.length, label: 'Upcoming' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition">
              <p className="text-3xl font-bold text-ncat-blue mb-1">{stat.number}</p>
              <p className="text-gray-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-ncat-blue mb-3">About Me</h2>
          {editing ? (
            <textarea
              value={form.bio}
              onChange={e => setForm({...form, bio: e.target.value})}
              placeholder="Tell other Aggies about yourself — your major, study style, availability..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue h-24 resize-none"
            />
          ) : (
            <p className="text-gray-600 leading-relaxed">
              {user?.bio || 'No bio yet — click Edit Profile to add one!'}
            </p>
          )}
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-ncat-blue mb-4">Achievements 🏆</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border text-center transition ${
                  achievement.earned
                    ? 'border-ncat-gold bg-yellow-50'
                    : 'border-gray-100 bg-gray-50 opacity-50'
                }`}
              >
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className={`font-bold text-sm mb-1 ${achievement.earned ? 'text-ncat-blue' : 'text-gray-400'}`}>
                  {achievement.title}
                </p>
                <p className="text-xs text-gray-400">{achievement.desc}</p>
                {achievement.earned && (
                  <span className="inline-block mt-2 bg-ncat-gold text-ncat-blue text-xs font-bold px-2 py-0.5 rounded-full">
                    Earned!
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-ncat-blue mb-4">Recent Sessions</h2>
          {hostedSessions.length === 0 ? (
            <p className="text-gray-400 text-sm">No sessions yet — create one!</p>
          ) : (
            <div className="space-y-3">
              {hostedSessions.slice(0, 3).map(session => (
                <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-ncat-blue text-sm">{session.courseCode}</p>
                    <p className="text-gray-400 text-xs">{session.date} · {session.location}</p>
                  </div>
                  <span className="text-xs bg-ncat-gold text-ncat-blue font-bold px-2 py-1 rounded-full">Host</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}