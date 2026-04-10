import { useState } from 'react'
import axios from 'axios'
import API_URL from '../config'
import kudosTags from '../data/kudos'

export default function KudosModal({ session, onClose, onSuccess }) {
  const currentUser = JSON.parse(localStorage.getItem('user'))
  
  // Build list of session members excluding current user
  const sessionMembers = [
    session.host,
    ...session.members.map(m => m.user)
  ].filter(u => u && u.id !== currentUser?.id)

  const [selections, setSelections] = useState({})
  const [sending, setSending] = useState(false)
  const [activeCategory, setActiveCategory] = useState('Study Skills')
  const [activeMember, setActiveMember] = useState(sessionMembers[0]?.id || null)

  const categories = [...new Set(kudosTags.map(k => k.category))]

  const selectTag = (memberId, tag) => {
    setSelections(prev => ({ ...prev, [memberId]: tag }))
  }

  const handleSend = async () => {
    const kudosList = Object.entries(selections)
      .filter(([, tag]) => tag)
      .map(([toUserId, tag]) => ({ toUserId, tag }))

    if (kudosList.length === 0) return

    const token = localStorage.getItem('token')
    setSending(true)
    try {
      await axios.post(`${API_URL}/api/kudos`, {
        sessionId: session.id,
        kudosList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onSuccess()
    } catch (err) {
      console.error(err)
    }
    setSending(false)
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
  const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

  const selectedCount = Object.values(selections).filter(Boolean).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-ncat-blue p-6 rounded-t-2xl">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h2 className="text-xl font-bold text-white">Give Kudos & BuddyStarz ⭐</h2>
              <p className="text-blue-200 text-sm">{session.courseCode} session</p>
            </div>
            <button onClick={onClose} className="text-white opacity-70 hover:opacity-100 text-2xl">✕</button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-4">
            Pick <span className="font-semibold text-ncat-blue">one tag</span> for each person you want to recognize. They'll also receive a ⭐ BuddyStar!
          </p>

          {/* Member selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {sessionMembers.map(member => (
              <button
                key={member.id}
                onClick={() => setActiveMember(member.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                  activeMember === member.id
                    ? 'bg-ncat-blue border-ncat-blue text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-ncat-blue'
                }`}
              >
                <div className={`w-6 h-6 ${getColor(member.name)} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                  {getInitials(member.name)}
                </div>
                <span className="text-sm font-semibold">{member.name.split(' ')[0]}</span>
                {selections[member.id] && (
                  <span className="text-xs bg-ncat-gold text-ncat-blue px-1.5 py-0.5 rounded-full">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Selected tag for active member */}
          {activeMember && selections[activeMember] && (
            <div className="mb-4 p-3 bg-ncat-gold bg-opacity-10 rounded-xl border border-ncat-gold border-opacity-30">
              <p className="text-sm text-ncat-blue font-semibold">
                Selected for {sessionMembers.find(m => m.id === activeMember)?.name.split(' ')[0]}: 
                <span className="ml-2">{selections[activeMember]}</span>
                <button 
                  onClick={() => setSelections(prev => ({ ...prev, [activeMember]: null }))}
                  className="ml-2 text-gray-400 hover:text-red-400"
                >✕</button>
              </p>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-ncat-blue text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tags grid */}
          <div className="flex flex-wrap gap-2 mb-6">
            {kudosTags
              .filter(k => k.category === activeCategory)
              .map(({ tag }) => (
                <button
                  key={tag}
                  onClick={() => activeMember && selectTag(activeMember, tag)}
                  disabled={!activeMember}
                  className={`px-3 py-2 rounded-xl text-sm font-semibold transition border ${
                    activeMember && selections[activeMember] === tag
                      ? 'bg-ncat-gold text-ncat-blue border-ncat-gold'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-ncat-blue hover:text-ncat-blue'
                  }`}
                >
                  {tag}
                </button>
              ))}
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={selectedCount === 0 || sending}
            className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40"
          >
            {sending ? 'Sending...' : `Send Kudos to ${selectedCount} ${selectedCount === 1 ? 'person' : 'people'} ⭐`}
          </button>
        </div>
      </div>
    </div>
  )
}