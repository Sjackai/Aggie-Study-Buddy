import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'
import MajorSelector from '../components/MajorSelector'
import courses from '../data/courses'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'


const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

const vibeTemplates = [
  { id: 'studying', label: '📚 Currently studying', fills: courses.map(c => `${c.code} — ${c.name}`) },
  { id: 'preparing', label: '🎯 Preparing for', fills: ['Midterm Exam', 'Final Exam', 'Quiz', 'Lab Report', 'Presentation', 'Project Defense'] },
  { id: 'working', label: '🧠 Working on', fills: ['Senior Project', 'Group Project', 'Research Paper', 'Thesis', 'Homework', 'Lab Assignment', 'Capstone Project'] },
  { id: 'grinding', label: '🔥 Grinding until', fills: ['Tonight', 'This Weekend', 'Midnight', 'Finals Week', 'I Pass This Class', 'Graduation'] },
  { id: 'focused', label: '🎯 Focused on', fills: ['Getting an A', 'Passing This Class', 'Raising My GPA', 'Graduating', 'Landing an Internship', "Making the Dean's List"] },
  { id: 'break', label: '😴 Taking a study break', fills: [] },
  { id: 'done', label: '✅ Done studying for the day', fills: [] },
  { id: 'open', label: '🤝 Open to study partners', fills: [] },
]

const borderOptions = [
  { label: 'None', value: '' },
  { label: 'Aggie Gold', value: '#FFB81C' },
  { label: 'Aggie Blue', value: '#0039A6' },
  { label: 'White', value: '#FFFFFF' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Orange', value: '#f97316' },
]

const getCompletionScore = (user) => {
  const fields = [user?.name, user?.major, user?.year, user?.bio, user?.avatar, user?.banners?.length > 0, user?.vibeTemplate, user?.borderColor]
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
}

const buildVibeStatus = (template, fill) => {
  if (!template) return null
  const t = vibeTemplates.find(v => v.id === template)
  if (!t) return null
  if (t.fills.length === 0) return t.label
  return `${t.label} ${fill || '...'}`
}


function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight), mediaWidth, mediaHeight)
}

async function getCroppedBlob(imgElement, crop, aspect) {
  const canvas = document.createElement('canvas')
  const outputWidth = aspect === 1 ? 400 : 1200
  const outputHeight = aspect === 1 ? 400 : 400
  canvas.width = outputWidth
  canvas.height = outputHeight
  const ctx = canvas.getContext('2d')
  ctx.imageSmoothingQuality = 'high'
  const scaleX = imgElement.naturalWidth / imgElement.width
  const scaleY = imgElement.naturalHeight / imgElement.height
  ctx.drawImage(imgElement, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, outputWidth, outputHeight)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => { if (blob) resolve(blob); else reject(new Error('Canvas is empty')) }, 'image/jpeg', 0.95)
  })
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [sessions, setSessions] = useState([])
  const [kudosData, setKudosData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [toast, setToast] = useState(null)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [showVibeModal, setShowVibeModal] = useState(false)
  const [showBorderPicker, setShowBorderPicker] = useState(false)
  const [showAvatarPopup, setShowAvatarPopup] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [selectedFill, setSelectedFill] = useState('')
  const [customBorderColor, setCustomBorderColor] = useState('#FFB81C')
  const [activeBanner, setActiveBanner] = useState(0)
  const [bannerFading, setBannerFading] = useState(false)
  const [cropModal, setCropModal] = useState(null)
  const [imgSrc, setImgSrc] = useState('')
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()
  const imgRef = useRef(null)
  const avatarInputRef = useRef(null)
  const bannerInputRef = useRef(null)
  const [form, setForm] = useState({ name: '', major: '', year: '', bio: '', isPrivate: false })
  const [xpData, setXpData] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchProfile(token)
    fetchSessions(token)
    fetchKudos(token)
    fetchXP(token)
  }, [])

  useEffect(() => {
    if (!user?.banners || user.banners.length <= 1) return
    const interval = setInterval(() => {
      setBannerFading(true)
      setTimeout(() => {
        setActiveBanner(prev => (prev + 1) % user.banners.length)
        setBannerFading(false)
      }, 500)
    }, 10000)
    return () => clearInterval(interval)
  }, [user?.banners])

  const fetchProfile = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      setForm({ name: res.data.name || '', major: res.data.major || '', year: res.data.year || '', bio: res.data.bio || '', isPrivate: res.data.isPrivate || false })
      setSelectedTemplate(res.data.vibeTemplate || '')
      setSelectedFill(res.data.vibeFill || '')
      setCustomBorderColor(res.data.borderColor || '#FFB81C')
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, { headers: { Authorization: `Bearer ${token}` } })
      setSessions(res.data)
    } catch (err) { console.error(err) }
  }
const fetchXP = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/api/games/my-xp`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setXpData(res.data)
  } catch (err) {
    console.error(err)
  }
}
  const fetchKudos = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/kudos/my`, { headers: { Authorization: `Bearer ${token}` } })
      setKudosData(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(`${API_URL}/api/users/me`, form, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      setEditing(false)
      showToast('Profile updated! 🐾')
    } catch (err) { showToast('Failed to update profile', 'error') }
  }

  const onSelectFile = (e, type) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => { setImgSrc(reader.result); setCropModal(type); setCrop(undefined) }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const onImageLoad = useCallback((e) => {
    const { width, height } = e.currentTarget
    const aspect = cropModal === 'avatar' ? 1 : 3
    setCrop(centerAspectCrop(width, height, aspect))
  }, [cropModal])

  const handleCropConfirm = async () => {
    if (!completedCrop?.width || !completedCrop?.height || !imgRef.current) return
    const aspect = cropModal === 'avatar' ? 1 : 3
    const token = localStorage.getItem('token')
    try {
      if (cropModal === 'avatar') setUploadingAvatar(true)
      else setUploadingBanner(true)
      const blob = await getCroppedBlob(imgRef.current, completedCrop, aspect)
      const formData = new FormData()
      formData.append('image', blob, cropModal === 'avatar' ? 'avatar.jpg' : 'banner.jpg')
      const endpoint = cropModal === 'avatar' ? '/api/upload/avatar' : '/api/upload/banner'
      const res = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      showToast(cropModal === 'avatar' ? 'Profile picture updated! 📸' : 'Banner added! 🖼️')
      setCropModal(null)
      setImgSrc('')
    } catch (err) {
      console.error(err)
      showToast(err.response?.data?.error || 'Failed to upload', 'error')
    }
    setUploadingAvatar(false)
    setUploadingBanner(false)
  }

  const handleRemoveBanner = async (url) => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.delete(`${API_URL}/api/upload/banner`, { headers: { Authorization: `Bearer ${token}` }, data: { url } })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      setActiveBanner(0)
      showToast('Banner removed')
    } catch (err) { showToast('Failed to remove banner', 'error') }
  }

  const handleRemoveAvatar = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.delete(`${API_URL}/api/upload/avatar`, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      showToast('Profile picture removed')
    } catch (err) { showToast('Failed to remove avatar', 'error') }
  }

  const handleSaveVibe = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(`${API_URL}/api/users/me`, { ...form, vibeTemplate: selectedTemplate, vibeFill: selectedFill }, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      setShowVibeModal(false)
      showToast('Study vibe updated! 🔥')
    } catch (err) { showToast('Failed to update vibe', 'error') }
  }

  const handleSaveBorder = async () => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.put(`${API_URL}/api/users/me`, { ...form, borderColor: customBorderColor }, { headers: { Authorization: `Bearer ${token}` } })
      setUser(res.data)
      localStorage.setItem('user', JSON.stringify(res.data))
      setShowBorderPicker(false)
      showToast('Avatar border updated! ✨')
    } catch (err) { showToast('Failed to update border', 'error') }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  const userId = user?.id
  const hostedSessions = sessions.filter(s => s.hostId === userId)
  const joinedSessions = sessions.filter(s => s.members?.some(m => m.userId === userId))
  const completionScore = getCompletionScore(user)
  const vibeStatus = buildVibeStatus(user?.vibeTemplate, user?.vibeFill)
  const borderColor = user?.borderColor || '#FFB81C'
  const banners = user?.banners || []
  const currentBanner = banners[activeBanner]
  const activeTemplate = vibeTemplates.find(v => v.id === selectedTemplate)

  const allAchievements = [
    { icon: '🎓', title: 'First Session', desc: 'Created your first study session', earned: hostedSessions.length >= 1 },
    { icon: '🤝', title: 'Team Player', desc: 'Joined 3+ study sessions', earned: joinedSessions.length >= 3 },
    { icon: '⭐', title: 'Study Star', desc: 'Hosted 5+ sessions', earned: hostedSessions.length >= 5 },
    { icon: '🔥', title: 'On Fire', desc: 'Hosted 10+ sessions', earned: hostedSessions.length >= 10 },
    { icon: '📚', title: 'Scholar', desc: 'Participated in 10+ sessions', earned: joinedSessions.length >= 10 },
    { icon: '🏆', title: 'Aggie Legend', desc: 'Hosted 20+ sessions', earned: hostedSessions.length >= 20 },
    { icon: '🌟', title: 'Rising Star', desc: 'Joined your first session', earned: joinedSessions.length >= 1 },
    { icon: '💪', title: 'Consistent', desc: 'Hosted 3+ sessions', earned: hostedSessions.length >= 3 },
    { icon: '🎯', title: 'Goal Setter', desc: 'Completed onboarding', earned: true },
    { icon: '🧠', title: 'Knowledge Sharer', desc: 'Received a Kudos tag', earned: kudosData && Object.keys(kudosData.tagCounts || {}).length > 0 },
    { icon: '👋', title: 'Welcome Aggie', desc: 'Created your account', earned: true },
    { icon: '🔍', title: 'Explorer', desc: 'Visited Find Sessions', earned: true },
    { icon: '📸', title: 'Looking Good', desc: 'Uploaded a profile picture', earned: !!user?.avatar },
    { icon: '🖼️', title: 'Banner Up', desc: 'Uploaded a profile banner', earned: banners.length > 0 },
    { icon: '🔥', title: 'Vibe Check', desc: 'Set your study vibe status', earned: !!user?.vibeTemplate },
    { icon: '👑', title: 'Session King', desc: 'Hosted 50+ sessions', earned: hostedSessions.length >= 50 },
  ]

  const displayedAchievements = showAllAchievements ? allAchievements : allAchievements.slice(0, 6)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-white hover:text-ncat-gold transition font-medium">
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
{/* Profile Completion Bar */}
{completionScore < 100 && (
  <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
    <div className="flex justify-between items-center mb-2">
      <p className="text-sm font-semibold text-gray-700">Profile Completion</p>
      <p className="text-sm font-bold text-ncat-blue">{completionScore}%</p>
    </div>
    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
        style={{ width: `${completionScore}%`, background: 'linear-gradient(90deg, #0039A6, #FFB81C)' }} />
    </div>
    <p className="text-xs text-gray-400 mt-1.5">
      {!user?.avatar && '📸 Add a profile picture · '}
      {banners.length === 0 && '🖼️ Add a banner · '}
      {!user?.bio && '✍️ Add a bio · '}
      {!user?.vibeTemplate && '🔥 Set your study vibe'}
    </p>
  </div>
)}
        </div>

        {/* Banner Slideshow */}
        <div className="relative rounded-2xl overflow-hidden mb-0 group">
          <div
            className="w-full h-48 flex items-center justify-center cursor-pointer transition-opacity duration-500"
            style={{ background: currentBanner ? 'transparent' : 'linear-gradient(135deg, #0039A6, #002580)', opacity: bannerFading ? 0 : 1 }}
            onClick={() => { if (banners.length < 3) bannerInputRef.current?.click() }}
          >
            {currentBanner ? (
              <img src={currentBanner} alt="Banner" className="w-full h-full object-cover" />
            ) : (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 relative">
    <div className="flex flex-col items-center opacity-30">
      <Logo size={48} />
      <p className="text-gray-600 font-bold text-lg mt-2">Aggie StudyBuddy</p>
    </div>
    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
      <div className="text-center text-gray-600">
        <p className="text-sm font-semibold">Click to upload banner</p>
        <p className="text-xs opacity-70 mt-1">Up to 3 images</p>
      </div>
    </div>
  </div>
)}
          </div>
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition pointer-events-none" />
          <div className="absolute top-3 right-3 flex gap-2">
            {banners.length < 3 && (
              <button onClick={() => bannerInputRef.current?.click()}
                className="bg-black bg-opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-opacity-70 transition">
                + Add Banner
              </button>
            )}
            {currentBanner && (
              <button onClick={() => handleRemoveBanner(currentBanner)}
                className="bg-red-500 bg-opacity-80 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-opacity-100 transition">
                ✕ Remove
              </button>
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
          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={e => onSelectFile(e, 'banner')} />
        </div>

        {/* Profile Header */}
        <div className="bg-ncat-blue rounded-b-2xl px-8 pb-8 pt-0 mb-6 relative">
          <div className="flex flex-col md:flex-row items-start gap-6">

            {/* Avatar */}
            <div className="relative -mt-12 flex-shrink-0">
              <div className="w-24 h-24 rounded-full hover:opacity-90 transition flex-shrink-0"
                style={{ padding: '3px', background: borderColor }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-ncat-blue flex items-center justify-center cursor-pointer"
                  onClick={() => avatarInputRef.current?.click()}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-2xl">{getInitials(user?.name)}</span>
                  )}
                </div>
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  <p className="text-white text-xs font-bold">...</p>
                </div>
              )}
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={e => onSelectFile(e, 'avatar')} />

              {/* Border picker button */}
              <button onClick={() => setShowBorderPicker(true)}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-ncat-gold rounded-full flex items-center justify-center text-ncat-blue text-xs font-bold hover:opacity-90 transition shadow-lg"
                title="Change border color">
                🎨
              </button>

              {/* View popup button */}
              <button onClick={() => setShowAvatarPopup(true)}
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-7 h-7 bg-white rounded-full flex items-center justify-center text-ncat-blue text-xs font-bold hover:opacity-90 transition shadow-lg"
                title="View profile picture">
                👁️
              </button>

              {/* Remove avatar button */}
              {user?.avatar && (
                <button onClick={handleRemoveAvatar}
                  className="absolute -top-1 -left-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition shadow-lg"
                  title="Remove profile picture">
                  ✕
                </button>
              )}
            </div>

            <div className="flex-1 pt-3">
              {editing ? (
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="text-2xl font-bold bg-white bg-opacity-20 text-white border border-white border-opacity-40 rounded-xl px-3 py-1 mb-2 w-full md:w-auto" />
              ) : (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
                  {user?.isPrivate && <span className="bg-white bg-opacity-20 text-white text-xs px-2 py-1 rounded-full">🔒 Private</span>}
                </div>
              )}
              <p className="text-blue-200 text-sm mb-2">{user?.email}</p>
              {editing ? (
                <div className="flex flex-col md:flex-row gap-2 mt-2">
                  <MajorSelector value={form.major} onChange={(val) => setForm({...form, major: val})} />
                  <select value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                    className="bg-white bg-opacity-20 text-white border border-white border-opacity-40 rounded-xl px-3 py-2 text-sm">
                    <option value="">Select Year</option>
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              ) : (
                <p className="text-blue-200 text-sm">{user?.major || 'No major set'} · {user?.year || 'No year set'}</p>
              )}
              {vibeStatus && (
                <div className="mt-2 inline-flex items-center gap-2 bg-white bg-opacity-10 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white border-opacity-20">
                  {vibeStatus}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-3">
              {editing ? (
                <>
                  <button onClick={handleSave} className="bg-ncat-gold text-ncat-blue font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm">Save</button>
                  <button onClick={() => setEditing(false)} className="bg-white bg-opacity-20 text-white font-bold px-5 py-2 rounded-xl hover:bg-opacity-30 transition text-sm">Cancel</button>
                </>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(true)} className="bg-white bg-opacity-20 text-white font-bold px-4 py-2 rounded-xl hover:bg-opacity-30 transition text-sm">✏️ Edit</button>
                  <button onClick={() => setShowVibeModal(true)} className="bg-ncat-gold text-ncat-blue font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">🔥 Vibe</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  {[
    { number: hostedSessions.length, label: 'Sessions Hosted' },
    { number: joinedSessions.length, label: 'Sessions Joined' },
    { number: xpData?.totalXP || 0, label: 'Total XP ⚡' },
    { number: xpData?.gamesWon || 0, label: 'Games Won 🏆' },
  ].map((stat, i) => (
    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:shadow-md transition">
      <p className="text-3xl font-bold text-ncat-blue mb-1">{stat.number}</p>
      <p className="text-gray-500 text-sm">{stat.label}</p>
    </div>
  ))}
</div>

        {/* Bio */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold text-ncat-blue">About Me</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-xs text-ncat-blue font-semibold hover:underline transition">
                ✏️ Edit
              </button>
            )}
          </div>
          {editing ? (
            <div>
              <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})}
                placeholder="Tell other Aggies about yourself..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue h-24 resize-none mb-3" />
              <div className="flex gap-2 justify-end">
                <button onClick={() => setEditing(false)}
                  className="text-xs border border-gray-200 text-gray-600 font-bold px-4 py-2 rounded-xl hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleSave}
                  className="text-xs bg-ncat-gold text-ncat-blue font-bold px-4 py-2 rounded-xl hover:opacity-90 transition">Save</button>
              </div>
            </div>
          ) : (
            <p className="text-gray-600 leading-relaxed">{user?.bio || 'No bio yet — click Edit to add one!'}</p>
          )}
        </div>

        {/* Privacy Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-ncat-blue mb-4">Privacy Settings 🔒</h2>
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input type="checkbox" id="isPrivateProfile"
              checked={editing ? form.isPrivate : (user?.isPrivate || false)}
              onChange={e => editing && setForm({...form, isPrivate: e.target.checked})}
              disabled={!editing}
              className="mt-0.5 w-4 h-4 accent-ncat-blue cursor-pointer" />
            <div>
              <label htmlFor="isPrivateProfile" className="text-sm font-semibold text-gray-700 cursor-pointer">Make my profile private</label>
              <p className="text-xs text-gray-400 mt-0.5">You won't appear in course or major suggestions. People can still find you by searching your name.</p>
              {!editing && <p className="text-xs text-ncat-blue mt-1 font-semibold">Click "Edit" to change this setting</p>}
            </div>
          </div>
        </div>
        {/* Notification Settings */}
<div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
  <h2 className="text-lg font-bold text-ncat-blue mb-4">Notification Settings 🔔</h2>
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{user?.gameNotifications !== false ? '🔔' : '🔕'}</span>
      <div>
        <p className="text-sm font-semibold text-gray-700">Brain Game Alerts</p>
        <p className="text-xs text-gray-400 mt-0.5">Get notified when a live Brain Game is starting</p>
      </div>
    </div>
    <button
      onClick={async () => {
        const token = localStorage.getItem('token')
        const newVal = user?.gameNotifications === false ? true : false
        try {
          const res = await axios.put(`${API_URL}/api/users/me`,
            { ...form, gameNotifications: newVal },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          setUser(res.data)
          localStorage.setItem('user', JSON.stringify(res.data))
          showToast(newVal ? 'Game notifications enabled 🔔' : 'Game notifications disabled 🔕')
        } catch (err) {
          showToast('Failed to update', 'error')
        }
      }}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${user?.gameNotifications !== false ? 'bg-ncat-blue' : 'bg-gray-300'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${user?.gameNotifications !== false ? 'translate-x-7' : 'translate-x-1'}`} />
    </button>
  </div>
</div>

        {/* Kudos */}
        {kudosData && Object.keys(kudosData.tagCounts || {}).length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
            <h2 className="text-lg font-bold text-ncat-blue mb-4">Kudos Received 🏅</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(kudosData.tagCounts).sort((a, b) => b[1] - a[1]).map(([tag, count]) => (
                <span key={tag} className="bg-ncat-gold bg-opacity-20 text-ncat-blue text-xs font-semibold px-3 py-1.5 rounded-full border border-ncat-gold border-opacity-30">
                  {tag} x{count}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* Brain Games Stats */}
{xpData && xpData.gamesPlayed > 0 && (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
    <h2 className="text-lg font-bold text-ncat-blue mb-4">Brain Games 🎮</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Total XP', value: xpData.totalXP, emoji: '⚡' },
        { label: 'Games Played', value: xpData.gamesPlayed, emoji: '🎮' },
        { label: 'Games Won', value: xpData.gamesWon, emoji: '🏆' },
        { label: 'Win Streak', value: xpData.winStreak, emoji: '🔥' },
      ].map((stat, i) => (
        <div key={i} className="bg-gray-50 rounded-2xl p-4 text-center">
          <p className="text-2xl mb-1">{stat.emoji}</p>
          <p className="text-2xl font-bold text-ncat-blue">{stat.value}</p>
          <p className="text-xs text-gray-500">{stat.label}</p>
        </div>
      ))}
    </div>
  </div>
)}
        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-ncat-blue">Achievements 🏆</h2>
            <button onClick={() => setShowAllAchievements(!showAllAchievements)} className="text-ncat-blue text-sm font-semibold hover:underline transition">
              {showAllAchievements ? 'Show Less' : `Show All (${allAchievements.length})`}
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayedAchievements.map((achievement, i) => (
              <div key={i} className={`p-4 rounded-xl border text-center transition ${achievement.earned ? 'border-ncat-gold bg-yellow-50' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                <div className="text-3xl mb-2">{achievement.icon}</div>
                <p className={`font-bold text-sm mb-1 ${achievement.earned ? 'text-ncat-blue' : 'text-gray-400'}`}>{achievement.title}</p>
                <p className="text-xs text-gray-400">{achievement.desc}</p>
                {achievement.earned && <span className="inline-block mt-2 bg-ncat-gold text-ncat-blue text-xs font-bold px-2 py-0.5 rounded-full">Earned!</span>}
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

      {/* Avatar Popup */}
      {showAvatarPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-end justify-center z-50 pb-12"
          onClick={() => setShowAvatarPopup(false)}>
          <div className="flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            <div className="rounded-full overflow-hidden border-4"
              style={{ width: '320px', height: '320px', borderColor: borderColor }}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${getColor(user?.name)} flex items-center justify-center`}>
                  <span className="text-white font-bold" style={{ fontSize: '100px' }}>
                    {getInitials(user?.name)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-white font-bold text-xl">{user?.name}</p>
            <p className="text-gray-400 text-sm">Tap anywhere to close</p>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {cropModal && imgSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ncat-blue">
                {cropModal === 'avatar' ? '📸 Crop Profile Picture' : '🖼️ Crop Banner'}
              </h2>
              <button onClick={() => { setCropModal(null); setImgSrc('') }} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              {cropModal === 'avatar' ? 'Drag to crop a square area for your profile picture' : 'Drag to crop a wide area for your banner'}
            </p>
            <div className="flex justify-center mb-4 max-h-80 overflow-auto">
              <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={cropModal === 'avatar' ? 1 : 3}
                circularCrop={cropModal === 'avatar'}>
                <img ref={imgRef} src={imgSrc} alt="Crop preview" onLoad={onImageLoad}
                  style={{ maxHeight: '300px', maxWidth: '100%' }} />
              </ReactCrop>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setCropModal(null); setImgSrc('') }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button onClick={handleCropConfirm} disabled={uploadingAvatar || uploadingBanner}
                className="flex-1 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40">
                {uploadingAvatar || uploadingBanner ? 'Uploading...' : 'Save & Upload ✓'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Study Vibe Modal */}
      {showVibeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ncat-blue">Set Your Study Vibe 🔥</h2>
              <button onClick={() => setShowVibeModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="space-y-3 mb-6">
              {vibeTemplates.map(template => (
                <button key={template.id} onClick={() => { setSelectedTemplate(template.id); setSelectedFill('') }}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition font-semibold text-sm ${
                    selectedTemplate === template.id ? 'border-ncat-blue bg-blue-50 text-ncat-blue' : 'border-gray-200 text-gray-600 hover:border-ncat-blue'
                  }`}>
                  {template.label}
                </button>
              ))}
            </div>
            {selectedTemplate && activeTemplate?.fills.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-ncat-blue mb-2">Choose your fill</label>
                <select value={selectedFill} onChange={e => setSelectedFill(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue">
                  <option value="">Select...</option>
                  {activeTemplate.fills.map(fill => <option key={fill} value={fill}>{fill}</option>)}
                </select>
              </div>
            )}
            {selectedTemplate && (
              <div className="bg-blue-50 rounded-xl p-3 mb-6 border border-blue-100">
                <p className="text-sm text-ncat-blue font-semibold">Preview:</p>
                <p className="text-sm text-gray-700 mt-1">{buildVibeStatus(selectedTemplate, selectedFill)}</p>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setSelectedTemplate(''); setSelectedFill(''); handleSaveVibe() }}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition text-sm">Clear Vibe</button>
              <button onClick={handleSaveVibe} disabled={!selectedTemplate}
                className="flex-1 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40">Save Vibe 🔥</button>
            </div>
          </div>
        </div>
      )}

      {/* Border Color Picker Modal */}
      {showBorderPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ncat-blue">Avatar Border 🎨</h2>
              <button onClick={() => setShowBorderPicker(false)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {borderOptions.map(option => (
                <button key={option.value} onClick={() => setCustomBorderColor(option.value || 'transparent')}
                  className={`w-full aspect-square rounded-full border-4 transition hover:scale-110 ${customBorderColor === option.value ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ background: option.value || '#e5e7eb' }} title={option.label} />
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={customBorderColor} onChange={e => setCustomBorderColor(e.target.value)}
                  className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200" />
                <span className="text-sm text-gray-500 font-mono">{customBorderColor}</span>
              </div>
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-20 rounded-full p-1" style={{ background: customBorderColor }}>
                <div className="w-full h-full rounded-full bg-ncat-blue flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-xl">{getInitials(user?.name)}</span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={handleSaveBorder} className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition">
              Save Border ✨
            </button>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}