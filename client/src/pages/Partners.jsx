import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Toast from '../components/Toast'
import Logo from '../components/Logo'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function Partners() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [partners, setPartners] = useState({ inMyCourses: [], mutualConnections: [], sameMajor: [], discover: [] })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [toast, setToast] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchPartners(token)
  }, [])

  const fetchPartners = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/users/partners`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setPartners(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleConnect = async () => {
    if (!selectedPartner) return
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/connections`, { toUserId: selectedPartner.id }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast(`Connection request sent to ${selectedPartner.name}! 🤝`)
      setSelectedPartner(null)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send request', 'error')
    }
  }

  const handleMessage = async () => {
    if (!selectedPartner) return
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/messages`, {
        receiverId: selectedPartner.id,
        text: `Hey ${selectedPartner.name?.split(' ')[0]}! I'd love to study together 🐾`
      }, { headers: { Authorization: `Bearer ${token}` } })
      setSelectedPartner(null)
      navigate(`/messages?userId=${selectedPartner.id}`)
    } catch (err) {
      showToast('Failed to send message', 'error')
    }
  }

  const allUsers = [
    ...partners.inMyCourses,
    ...partners.mutualConnections,
    ...partners.sameMajor,
    ...partners.discover
  ]

  const filtered = search
    ? allUsers.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.major?.toLowerCase().includes(search.toLowerCase())
      )
    : null

  const renderPartnerCard = (partner) => (
    <div
      key={partner.id}
      onClick={() => setSelectedPartner(partner)}
      className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-14 h-14 ${getColor(partner.name)} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 relative`}>
          {getInitials(partner.name)}
          {partner.isConnected && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-bold text-gray-800">{partner.name}</h3>
          <p className="text-sm text-gray-500">{partner.major || 'Undeclared'} · {partner.year || 'N/A'}</p>
          {partner.sharedCourses?.length > 0 && (
            <p className="text-xs text-ncat-blue font-semibold mt-0.5">
              📚 {partner.sharedCourses.slice(0, 2).join(', ')}
              {partner.sharedCourses.length > 2 && ` +${partner.sharedCourses.length - 2} more`}
            </p>
          )}
          {partner.mutualCount > 0 && (
            <p className="text-xs text-gray-400 mt-0.5">🤝 {partner.mutualCount} mutual connection{partner.mutualCount > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>

      {partner.bio && (
        <p className="text-sm text-gray-600 mb-3 bg-gray-50 rounded-lg p-2 line-clamp-2">{partner.bio}</p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {partner.isConnected && (
            <span className="text-xs bg-green-50 text-green-600 font-semibold px-2 py-1 rounded-full border border-green-200">
              ✓ Connected
            </span>
          )}
          <span className="text-xs text-gray-400">{partner.sessionCount} sessions</span>
        </div>
        <span
          onClick={(e) => { e.stopPropagation(); navigate(`/profile/${partner.id}`) }}
          className="text-ncat-blue text-sm font-semibold hover:underline cursor-pointer"
        >
          View Profile →
        </span>
      </div>
    </div>
  )

  const renderSection = (title, users) => {
    if (users.length === 0) return null
    return (
      <div className="mb-8">
        <h2 className="text-lg font-bold text-ncat-blue mb-4">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(renderPartnerCard)}
        </div>
      </div>
    )
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
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ncat-blue mb-2">Find Study Partners 🔍</h1>
          <p className="text-gray-500">Connect with fellow Aggies and study together</p>
        </div>

        <div className="relative mb-8">
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or major..."
            value={search}
            onChange={e => {
              setSearch(e.target.value)
              setSearchParams(e.target.value ? { q: e.target.value } : {})
            }}
            className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncat-blue bg-white shadow-sm"
          />
        </div>

        {filtered ? (
          <div>
            <h2 className="text-lg font-bold text-ncat-blue mb-4">Search Results ({filtered.length})</h2>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-gray-500 font-medium">No Aggies found for "{search}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(renderPartnerCard)}
              </div>
            )}
          </div>
        ) : (
          <div>
            {renderSection('📚 In Your Courses', partners.inMyCourses)}
            {renderSection('🤝 Mutual Connections', partners.mutualConnections)}
            {renderSection('🎓 Same Major', partners.sameMajor)}
            {renderSection('🔍 Discover Aggies', partners.discover)}

            {allUsers.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <p className="text-4xl mb-3">🤝</p>
                <p className="text-gray-500 font-medium">No Aggies found yet</p>
                <p className="text-gray-400 text-sm mt-1">Complete your onboarding to get better recommendations!</p>
                <button
                  onClick={() => navigate('/onboarding')}
                  className="mt-4 bg-ncat-blue text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm"
                >
                  Complete Onboarding
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Partner Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="bg-ncat-blue p-6 relative">
              <button
                onClick={() => setSelectedPartner(null)}
                className="absolute top-4 right-4 text-white opacity-70 hover:opacity-100 text-2xl"
              >
                ✕
              </button>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 ${getColor(selectedPartner.name)} rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-ncat-gold`}>
                  {getInitials(selectedPartner.name)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedPartner.name}</h2>
                  <p className="text-blue-200">{selectedPartner.major || 'Undeclared'} · {selectedPartner.year || 'N/A'}</p>
                  {selectedPartner.isConnected && (
                    <span className="inline-block mt-1 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ✓ Connected
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {selectedPartner.sharedCourses?.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-xl">
                  <p className="text-xs font-semibold text-ncat-blue mb-1">Shared Courses</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPartner.sharedCourses.map(c => (
                      <span key={c} className="text-xs bg-ncat-blue text-white px-2 py-1 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPartner.bio && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-ncat-blue mb-1">About</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedPartner.bio}</p>
                </div>
              )}

              <div className="flex gap-3 mb-3">
                {!selectedPartner.isConnected ? (
                  <button
                    onClick={handleConnect}
                    className="flex-1 bg-ncat-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
                  >
                    🤝 Connect
                  </button>
                ) : (
                  <div className="flex-1 bg-green-50 text-green-600 font-bold py-3 rounded-xl text-center text-sm border border-green-200">
                    ✓ Connected
                  </div>
                )}
                <button
                  onClick={handleMessage}
                  className="flex-1 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition"
                >
                  💬 Message
                </button>
              </div>

              <button
                onClick={() => { setSelectedPartner(null); navigate(`/profile/${selectedPartner.id}`) }}
                className="w-full border border-gray-200 text-ncat-blue font-semibold py-2 rounded-xl hover:bg-gray-50 transition text-sm"
              >
                View Full Profile →
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}