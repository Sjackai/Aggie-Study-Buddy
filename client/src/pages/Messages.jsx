import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

export default function Messages() {
  const navigate = useNavigate()
  const [threads, setThreads] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const messagesEndRef = useRef(null)
  const currentUser = JSON.parse(localStorage.getItem('user'))

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchThreads(token)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchThreads = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setThreads(res.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const openThread = async (thread) => {
    const token = localStorage.getItem('token')
    setSelectedThread(thread)
    try {
      const res = await axios.get(`${API_URL}/api/messages/${thread.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
      fetchThreads(token)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSend = async () => {
    const text = newMessage.trim()
    if (!text || !selectedThread) return
    const token = localStorage.getItem('token')
    setSending(true)
    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        receiverId: selectedThread.userId,
        text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
      fetchThreads(token)
    } catch (err) {
      showToast('Failed to send message', 'error')
    }
    setSending(false)
  }

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
  const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
  const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

  const formatTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

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

      <div className="flex flex-1 max-w-6xl mx-auto w-full px-6 py-8 gap-6">

        {/* Threads List */}
        <div className="w-full md:w-80 flex-shrink-0">
          <h2 className="text-xl font-bold text-ncat-blue mb-4">Messages 💬</h2>

          {threads.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-500 font-medium text-sm">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Connect with study partners to start chatting!</p>
              <button
                onClick={() => navigate('/partners')}
                className="mt-4 bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm"
              >
                Find Partners
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map(thread => (
                <button
                  key={thread.userId}
                  onClick={() => openThread(thread)}
                  className={`w-full text-left p-4 rounded-2xl border transition ${
                    selectedThread?.userId === thread.userId
                      ? 'bg-ncat-blue border-ncat-blue'
                      : 'bg-white border-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${getColor(thread.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {getInitials(thread.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className={`font-semibold text-sm truncate ${selectedThread?.userId === thread.userId ? 'text-white' : 'text-gray-800'}`}>
                          {thread.name}
                        </p>
                        {thread.unread > 0 && (
                          <span className="bg-ncat-gold text-ncat-blue text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                            {thread.unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-xs truncate mt-0.5 ${selectedThread?.userId === thread.userId ? 'text-blue-200' : 'text-gray-400'}`}>
                        {thread.lastMessage?.text || 'Start a conversation'}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {!selectedThread ? (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-6xl mb-4">💬</p>
                <p className="text-gray-500 font-medium">Select a conversation to start chatting</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col overflow-hidden">

              {/* Chat Header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className={`w-10 h-10 ${getColor(selectedThread.name)} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {getInitials(selectedThread.name)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{selectedThread.name}</p>
                  <p className="text-xs text-gray-400">{selectedThread.major || 'NC A&T Student'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">No messages yet — say hi! 👋</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                        msg.senderId === currentUser?.id
                          ? 'bg-ncat-blue text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="bg-ncat-blue text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40"
                >
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}