import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Messages() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('direct')
  const [threads, setThreads] = useState([])
  const [groupChats, setGroupChats] = useState([])
  const [selectedThread, setSelectedThread] = useState(null)
  const [selectedGroupChat, setSelectedGroupChat] = useState(null)
  const [messages, setMessages] = useState([])
  const [groupMessages, setGroupMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const messagesEndRef = useRef(null)
  const groupMessagesEndRef = useRef(null)
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const pollRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchAll(token)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    groupMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages])

  useEffect(() => {
    if (selectedGroupChat) {
      const token = localStorage.getItem('token')
      pollRef.current = setInterval(() => {
        fetchGroupMessages(token, selectedGroupChat.id)
      }, 5000)
    }
    return () => clearInterval(pollRef.current)
  }, [selectedGroupChat])

  const fetchAll = async (token) => {
    try {
      const [threadsRes, groupChatsRes] = await Promise.all([
        axios.get(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/groupchats`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setThreads(threadsRes.data)
      setGroupChats(groupChatsRes.data)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const openThread = async (thread) => {
    const token = localStorage.getItem('token')
    setSelectedThread(thread)
    setSelectedGroupChat(null)
    setShowChat(true)
    clearInterval(pollRef.current)
    try {
      const res = await axios.get(`${API_URL}/api/messages/${thread.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
      fetchAll(token)
    } catch (err) {
      console.error(err)
    }
  }

  const openGroupChat = async (chat) => {
    const token = localStorage.getItem('token')
    setSelectedGroupChat(chat)
    setSelectedThread(null)
    setShowChat(true)
    fetchGroupMessages(token, chat.id)
  }

  const fetchGroupMessages = async (token, chatId) => {
    try {
      const res = await axios.get(`${API_URL}/api/groupchats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGroupMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendDirect = async () => {
    const text = newMessage.trim()
    if (!text || !selectedThread) return
    const token = localStorage.getItem('token')
    setSending(true)
    try {
      const res = await axios.post(`${API_URL}/api/messages`, {
        receiverId: selectedThread.userId,
        text
      }, { headers: { Authorization: `Bearer ${token}` } })
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
      fetchAll(token)
    } catch (err) {
      showToast('Failed to send message', 'error')
    }
    setSending(false)
  }

  const handleSendGroup = async () => {
    const text = newMessage.trim()
    if (!text || !selectedGroupChat) return
    const token = localStorage.getItem('token')
    setSending(true)
    try {
      const res = await axios.post(`${API_URL}/api/groupchats/${selectedGroupChat.id}/messages`, {
        text
      }, { headers: { Authorization: `Bearer ${token}` } })
      setGroupMessages(prev => [...prev, res.data])
      setNewMessage('')
    } catch (err) {
      showToast('Failed to send message', 'error')
    }
    setSending(false)
  }

  const handleLeaveGroupChat = async (chatId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/groupchats/${chatId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedGroupChat(null)
      setShowChat(false)
      showToast('Left group chat')
      fetchAll(token)
    } catch (err) {
      showToast('Failed to leave chat', 'error')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold text-lg">Loading...</p>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Messages</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-white hover:text-ncat-gold transition font-medium text-sm"
        >
          ← Dashboard
        </button>
      </nav>

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar — hidden on mobile when chat is open */}
        <div className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-100 flex-shrink-0`}>

          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setActiveTab('direct'); setSelectedGroupChat(null) }}
              className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'direct' ? 'text-ncat-blue border-b-2 border-ncat-blue' : 'text-gray-400 hover:text-gray-600'}`}
            >
              💬 Direct
              {threads.filter(t => t.unread > 0).length > 0 && (
                <span className="ml-1 bg-ncat-blue text-white text-xs px-1.5 py-0.5 rounded-full">
                  {threads.filter(t => t.unread > 0).length}
                </span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('sessions'); setSelectedThread(null) }}
              className={`flex-1 py-3 text-sm font-semibold transition ${activeTab === 'sessions' ? 'text-ncat-blue border-b-2 border-ncat-blue' : 'text-gray-400 hover:text-gray-600'}`}
            >
              👥 Session Chats
              {groupChats.length > 0 && (
                <span className="ml-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {groupChats.length}
                </span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'direct' && (
              threads.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-500 font-medium text-sm">No messages yet</p>
                  <button onClick={() => navigate('/partners')} className="mt-4 bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">
                    Find Partners
                  </button>
                </div>
              ) : (
                threads.map(thread => (
                  <button
                    key={thread.userId}
                    onClick={() => openThread(thread)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${selectedThread?.userId === thread.userId ? 'bg-blue-50 border-l-4 border-l-ncat-blue' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${getColor(thread.name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {getInitials(thread.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-gray-800 truncate">{thread.name}</p>
                          {thread.unread > 0 && (
                            <span className="bg-ncat-blue text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ml-2">
                              {thread.unread}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 truncate">{thread.lastMessage?.text || 'Start a conversation'}</p>
                      </div>
                    </div>
                  </button>
                ))
              )
            )}

            {activeTab === 'sessions' && (
              groupChats.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">👥</p>
                  <p className="text-gray-500 font-medium text-sm">No session chats yet</p>
                  <p className="text-gray-400 text-xs mt-1">Join a study session to get added!</p>
                  <button onClick={() => navigate('/find-sessions')} className="mt-4 bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">
                    Find Sessions
                  </button>
                </div>
              ) : (
                groupChats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => openGroupChat(chat)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${selectedGroupChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-ncat-blue' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-ncat-blue rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        👥
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{chat.name}</p>
                        <p className="text-xs text-gray-400">{chat.members?.filter(m => !m.leftAt).length} members</p>
                        {chat.messages?.[0] && (
                          <p className="text-xs text-gray-400 truncate">{chat.messages[0].sender?.name}: {chat.messages[0].text}</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat Window — hidden on mobile when list is showing */}
        <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>
          {!selectedThread && !selectedGroupChat ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-6xl mb-4">💬</p>
                <p className="text-gray-500 font-medium">Select a conversation to start chatting</p>
              </div>
            </div>
          ) : selectedThread ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Back button mobile */}
              <button onClick={() => setShowChat(false)} className="md:hidden bg-white px-4 py-2 text-ncat-blue font-semibold text-sm border-b border-gray-100 text-left">
                ← Back
              </button>

              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className={`w-10 h-10 ${getColor(selectedThread.name)} rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer`}
                  onClick={() => navigate(`/profile/${selectedThread.userId}`)}>
                  {getInitials(selectedThread.name)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 cursor-pointer hover:text-ncat-blue" onClick={() => navigate(`/profile/${selectedThread.userId}`)}>
                    {selectedThread.name}
                  </p>
                  <p className="text-xs text-gray-400">{selectedThread.major || 'NC A&T Student'}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-400 text-sm">No messages yet — say hi! 👋</p></div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      {msg.senderId !== currentUser?.id && (
                        <div className={`w-8 h-8 ${getColor(msg.sender?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end`}>
                          {getInitials(msg.sender?.name)}
                        </div>
                      )}
                      <div className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-ncat-blue text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                        <p className="text-sm">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendDirect()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                />
                <button onClick={handleSendDirect} disabled={sending || !newMessage.trim()}
                  className="bg-ncat-blue text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40">
                  Send
                </button>
              </div>
            </div>
          ) : selectedGroupChat ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Back button mobile */}
              <button onClick={() => setShowChat(false)} className="md:hidden bg-white px-4 py-2 text-ncat-blue font-semibold text-sm border-b border-gray-100 text-left">
                ← Back
              </button>

              {/* Header */}
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 bg-ncat-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">👥</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{selectedGroupChat.name}</p>
                  <p className="text-xs text-gray-400">{selectedGroupChat.members?.filter(m => !m.leftAt).length} members · {selectedGroupChat.session?.courseCode}</p>
                </div>
                <button onClick={() => handleLeaveGroupChat(selectedGroupChat.id)} className="text-red-400 hover:text-red-600 text-sm font-semibold transition">
                  Leave
                </button>
              </div>

              {/* Member avatars strip */}
              <div className="bg-white px-6 py-2 border-b border-gray-50 flex items-center gap-3 overflow-x-auto">
                {selectedGroupChat.members?.filter(m => !m.leftAt).map((member, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer" onClick={() => navigate(`/profile/${member.userId}`)}>
                    <div className={`w-8 h-8 ${getColor(member.user?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs hover:opacity-80 transition`}>
                      {getInitials(member.user?.name)}
                    </div>
                    <span className="text-xs text-gray-400 max-w-12 truncate">{member.user?.name?.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {groupMessages.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-400 text-sm">No messages yet — start the conversation! 👋</p></div>
                ) : (
                  groupMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                      {msg.senderId !== currentUser?.id && (
                        <div className={`w-8 h-8 ${getColor(msg.sender?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end cursor-pointer`}
                          onClick={() => navigate(`/profile/${msg.senderId}`)}>
                          {getInitials(msg.sender?.name)}
                        </div>
                      )}
                      <div className={`max-w-xs md:max-w-md`}>
                        {msg.senderId !== currentUser?.id && (
                          <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.name}</p>
                        )}
                        <div className={`px-4 py-3 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-ncat-blue text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={groupMessagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendGroup()}
                  placeholder={`Message ${selectedGroupChat.name}...`}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                />
                <button onClick={handleSendGroup} disabled={sending || !newMessage.trim()}
                  className="bg-ncat-blue text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40">
                  Send
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}