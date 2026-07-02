import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${minutes} ${ampm}`
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

const buildVibeStatus = (template, fill) => {
  const vibeTemplates = [
    { id: 'studying', label: '📚 Currently studying' },
    { id: 'preparing', label: '🎯 Preparing for' },
    { id: 'working', label: '🧠 Working on' },
    { id: 'grinding', label: '🔥 Grinding until' },
    { id: 'focused', label: '🎯 Focused on' },
    { id: 'break', label: '😴 Taking a study break' },
    { id: 'done', label: '✅ Done studying for the day' },
    { id: 'open', label: '🤝 Open to study partners' },
  ]
  if (!template) return null
  const t = vibeTemplates.find(v => v.id === template)
  if (!t) return null
  if (!fill) return t.label
  return `${t.label} ${fill}`
}

export default function PublicProfile() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [kudosData, setKudosData] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [activeBanner, setActiveBanner] = useState(0)
  const [bannerFading, setBannerFading] = useState(false)
  const [showAvatarPopup, setShowAvatarPopup] = useState(false)
  const currentUser = JSON.parse(localStorage.getItem('user'))

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchProfile(token)
    fetchKudos(token)
    fetchSessions(token)
  }, [userId])

  useEffect(() => {
    if (!profile?.banners || profile.banners.length <= 1) return
    const interval = setInterval(() => {
      setBannerFading(true)
      setTimeout(() => {
        setActiveBanner(prev => (prev + 1) % profile.banners.length)
        setBannerFading(false)
      }, 500)
    }, 10000)
    return () => clearInterval(interval)
  }, [profile?.banners])

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(res.data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchKudos = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/kudos/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setKudosData(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const today = new Date().toISOString().split('T')[0]
      const hosted = res.data.filter(s => s.hostId === userId && s.date >= today)
      setSessions(hosted)
    } catch (err) { console.error(err) }
  }

  const handleConnect = async () => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/connections`, { toUserId: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Connection request sent! 🤝')
    } catch (err) { showToast(err.response?.data?.error || 'Failed to send request', 'error') }
  }

  const handleMessage = async () => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/messages`, {
        receiverId: userId,
        text: `Hey ${profile?.name?.split(' ')[0]}! I'd love to study together 🐾`
      }, { headers: { Authorization: `Bearer ${token}` } })
      navigate(`/messages?userId=${userId}`)
    } catch (err) { showToast('Failed to send message', 'error') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-3">😕</p>
        <p className="text-gray-500 font-medium">Profile not found</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-ncat-blue text-white font-bold px-5 py-2 rounded-xl">Go Back</button>
      </div>
    </div>
  )

  const isOwnProfile = currentUser?.id === userId
  const borderColor = profile.borderColor || '#FFB81C'
  const banners = profile.banners || []
  const currentBanner = banners[activeBanner]
  const vibeStatus = buildVibeStatus(profile.vibeTemplate, profile.vibeFill)

  const achievements = [
    { icon: '🎓', title: 'First Session', desc: 'Created first study session', earned: sessions.length >= 1 },
    { icon: '⭐', title: 'Study Star', desc: 'Hosted 5+ sessions', earned: sessions.length >= 5 },
    { icon: '🔥', title: 'On Fire', desc: 'Hosted 10+ sessions', earned: sessions.length >= 10 },
    { icon: '🏆', title: 'Aggie Legend', desc: 'Hosted 20+ sessions', earned: sessions.length >= 20 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate(-1)} className="text-white hover:text-ncat-gold transition font-medium">← Back</button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Banner Slideshow */}
        <div className="relative rounded-2xl overflow-hidden mb-0">
          <div className="w-full h-48 transition-opacity duration-500"
            style={{ background: currentBanner ? 'transparent' : 'linear-gradient(135deg, #0039A6, #002580)', opacity: bannerFading ? 0 : 1 }}>
            {currentBanner ? (
              <img src={currentBanner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200">
    <div className="flex flex-col items-center opacity-30">
      <Logo size={48} />
      <p className="text-gray-600 font-bold text-lg mt-2">Aggie StudyBuddy</p>
    </div>
  </div>
)}
          </div>
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
              {banners.map((_, i) => (
                <button key={i} onClick={() => setActiveBanner(i)}
                  className={`w-2 h-2 rounded-full transition ${i === activeBanner ? 'bg-white' : 'bg-white bg-opacity-50'}`} />
              ))}
            </div>
          )}
        </div>

        {/* Profile Header */}
        <div className="bg-ncat-blue rounded-b-2xl px-8 pb-8 pt-0 mb-6 relative">
          <div className="flex flex-col md:flex-row items-start gap-6">

            {/* Avatar */}
            <div className="relative -mt-12 flex-shrink-0">
              <div className="w-24 h-24 rounded-full flex-shrink-0 cursor-pointer"
                style={{ padding: '3px', background: borderColor }}
                onClick={() => setShowAvatarPopup(true)}>
                <div className="w-full h-full rounded-full overflow-hidden bg-ncat-blue flex items-center justify-center hover:opacity-90 transition">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">{getInitials(profile.name)}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 pt-3">
              <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
              <p className="text-blue-200 text-sm mb-1">{profile.major || 'Undeclared'} · {profile.year || 'N/A'}</p>
              {vibeStatus && (
                <div className="mt-2 inline-flex items-center gap-2 bg-white bg-opacity-10 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white border-opacity-20">
                  {vibeStatus}
                </div>
              )}
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2 pt-3">
                <button onClick={handleConnect}
                  className="bg-white text-ncat-blue font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">
                  🤝 Connect
                </button>
                <button onClick={handleMessage}
                  className="bg-ncat-gold text-ncat-blue font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">
                  💬 Message
                </button>
              </div>
            )}

            {isOwnProfile && (
              <button onClick={() => navigate('/profile')}
                className="bg-white bg-opacity-20 text-white font-bold px-4 py-2 rounded-xl hover:bg-opacity-30 transition text-sm mt-3">
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-ncat-blue mb-3">About</h2>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Kudos */}
        {kudosData && Object.keys(kudosData.tagCounts).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-ncat-blue mb-4">Kudos Received 🏅</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(kudosData.tagCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                <span key={tag} className="bg-ncat-gold bg-opacity-20 text-ncat-blue text-sm font-semibold px-3 py-1.5 rounded-full border border-ncat-gold border-opacity-30">
                  {tag} x{count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-ncat-blue mb-4">Achievements 🏆</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, i) => (
              <div key={i} className={`p-4 rounded-xl border text-center transition ${achievement.earned ? 'border-ncat-gold bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-40'}`}>
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className={`font-bold text-xs mb-1 ${achievement.earned ? 'text-ncat-blue' : 'text-gray-400'}`}>{achievement.title}</p>
                {achievement.earned && <span className="inline-block mt-1 bg-ncat-gold text-ncat-blue text-xs font-bold px-2 py-0.5 rounded-full">Earned!</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-ncat-blue mb-4">Upcoming Sessions 📅</h2>
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => navigate('/find-sessions')}>
                  <div>
                    <p className="font-semibold text-ncat-blue text-sm">{session.courseCode}</p>
                    <p className="text-gray-400 text-xs">{session.date} at {formatTime(session.time)} · {session.location}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${session.status === 'full' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {session.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Avatar Popup */}
      {showAvatarPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-end justify-center z-50 pb-12"
          onClick={() => setShowAvatarPopup(false)}>
          <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <div className="rounded-full overflow-hidden border-4"
              style={{ width: '320px', height: '320px', borderColor: borderColor }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${getColor(profile.name)} flex items-center justify-center`}>
                  <span className="text-white font-bold" style={{ fontSize: '100px' }}>
                    {getInitials(profile.name)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-white font-bold text-xl">{profile.name}</p>
            <p className="text-gray-400 text-sm">Tap anywhere to close</p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}