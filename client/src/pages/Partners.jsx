import Logo from '../components/Logo'
import API_URL from '../config'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Toast from '../components/Toast'

export default function Partners() {
  const navigate = useNavigate()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

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

  const handleConnect = async (partnerId, partnerName) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/connections`, { toUserId: partnerId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast(`Connection request sent to ${partnerName}! 🤝`)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send request', 'error')
    }
  }

  const filtered = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.major?.toLowerCase().includes(search.toLowerCase())
  )

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase()

  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-teal-500']
  const getColor = (name) => colors[name.charCodeAt(0) % colors.length]

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
            <p className="text-gray-500 font-medium">No partners found — try a different search!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(partner => (
              <div key={partner.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-14 h-14 ${getColor(partner.name)} rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
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
                  <button
                    onClick={() => handleConnect(partner.id, partner.name)}
                    className="bg-ncat-blue text-white text-sm font-bold px-4 py-2 rounded-xl hover:opacity-90 transition"
                  >
                    Connect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}