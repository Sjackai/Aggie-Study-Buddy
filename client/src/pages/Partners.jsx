import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Toast from '../components/Toast'
import Logo from '../components/Logo'

export default function Partners() {
  const navigate = useNavigate()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
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
        text: `Hey ${selectedPartner.name}! I saw your profile and would love to study together 🐾`
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedPartner(null)
      navigate('/messages')
    } catch (err) {
      showToast('Failed to send message', 'error')
    }
  }

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.major?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
  const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

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
          onClick={() => navigate('/dashboard')}
          className="text-white hover:text-ncat-gold transition font-medium"
        >
          ← Back to Dashboard
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ncat-blue mb-2">Find Study Partners 🔍</h1>
          <p className="text-gray-500">Connect with fellow Aggies and study together</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by name or major..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-2xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-ncat-blue bg-white shadow-sm"
          />
        </div>

        {/* Partners Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">🤝</p>
            <p className="text-gray-500 font-medium">No partners found!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(partner => (
              <div
                key={partner.id}
                onClick={() => setSelectedPartner(partner)}
                className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-center gap-4 mb-4">
                  
                  <div 
                  onClick={() => navigate(`/profile/${partner.id}`)}
                  className={`w-14 h-14 ${getColor(partner.name)} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                    {getInitials(partner.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">{partner.name}</h3>
                    <p className="text-sm text-gray-500">{partner.major || 'Undeclared'}</p>
                    <p className="text-sm text-gray-400">{partner.year || 'N/A'}</p>
                  </div>
                </div>

                {partner.bio && (
                  <p className="text-sm text-gray-600 mb-4 bg-gray-50 rounded-lg p-2 line-clamp-2">{partner.bio}</p>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-sm">⭐</span>
                    <span className="text-sm font-semibold text-gray-700">{partner.rating?.toFixed(1) || '0.0'}</span>
                  </div>
                  <span className="text-ncat-blue text-sm font-semibold">View Profile →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Partner Profile Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">

            {/* Modal Header */}
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
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {selectedPartner.bio && (
                <div className="mb-4">
                  <p className="text-sm font-semibold text-ncat-blue mb-1">About</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedPartner.bio}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mb-6">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold text-gray-700">{selectedPartner.rating?.toFixed(1) || '0.0'}</span>
                <span className="text-gray-400 text-sm">rating</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleConnect}
                  className="flex-1 bg-ncat-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition"
                >
                  🤝 Connect
                </button>
                <button
                  onClick={handleMessage}
                  className="flex-1 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition"
                >
                  💬 Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}