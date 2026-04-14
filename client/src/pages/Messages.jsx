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
  const [requests, setRequests] = useState([])
  const [groupChats, setGroupChats] = useState([])
  const [unreadGroupCount, setUnreadGroupCount] = useState(0)
  const [selectedThread, setSelectedThread] = useState(null)
  const [selectedGroupChat, setSelectedGroupChat] = useState(null)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [messages, setMessages] = useState([])
  const [groupMessages, setGroupMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [leaveGroupConfirm, setLeaveGroupConfirm] = useState(null)
  const [rejoinRequests, setRejoinRequests] = useState([])
  const messagesEndRef = useRef(null)
  const groupMessagesEndRef = useRef(null)
  const currentUser = JSON.parse(localStorage.getItem('user'))
  const directPollRef = useRef(null)
  const groupPollRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

 useEffect(() => {
  const token = localStorage.getItem('token')
  if (!token) { navigate('/login'); return }
  
  const params = new URLSearchParams(window.location.search)
  const userId = params.get('userId')
  
  fetchAll(token).then(() => {
    if (userId) {
      // Auto open thread with this user
      const thread = threads.find(t => t.userId === userId)
      if (thread) {
        openThread(thread)
      } else {
        // Create a temporary thread object
        axios.get(`${API_URL}/api/users/profile/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
          openThread({ userId, name: res.data.name, major: res.data.major })
        })
      }
    }
  })
}, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    groupMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [groupMessages])

  useEffect(() => {
    if (selectedThread) {
      const token = localStorage.getItem('token')
      directPollRef.current = setInterval(() => {
        fetchDirectMessages(token, selectedThread.userId)
      }, 5000)
    }
    return () => clearInterval(directPollRef.current)
  }, [selectedThread])

  useEffect(() => {
    if (selectedGroupChat) {
      const token = localStorage.getItem('token')
      groupPollRef.current = setInterval(() => {
        fetchGroupMessages(token, selectedGroupChat.id)
      }, 5000)
    }
    return () => clearInterval(groupPollRef.current)
  }, [selectedGroupChat])


  const fetchAll = async (token) => {
    try {
      const [threadsRes, requestsRes, groupChatsRes, notifsRes] = await Promise.all([
        axios.get(`${API_URL}/api/messages`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/messages/requests`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/groupchats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setThreads(threadsRes.data)
      setRequests(requestsRes.data)
      setGroupChats(groupChatsRes.data)
      setUnreadGroupCount(notifsRes.data.unreadGroup?.length || 0)

      // Check for rejoin requests if host
      const myGroupChats = groupChatsRes.data
      const pendingRejoins = []
      for (const chat of myGroupChats) {
        if (chat.session?.hostId === currentUser?.id) {
          try {
            const rejoinRes = await axios.get(`${API_URL}/api/groupchats/${chat.id}/rejoin-requests`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            if (rejoinRes.data.length > 0) {
              pendingRejoins.push(...rejoinRes.data.map(r => ({ ...r, chatId: chat.id, chatName: chat.name, sessionId: chat.sessionId })))
            }
          } catch (err) {}
        }
      }
      setRejoinRequests(pendingRejoins)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const fetchDirectMessages = async (token, userId) => {
    try {
      const res = await axios.get(`${API_URL}/api/messages/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
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

  const openThread = async (thread) => {
    const token = localStorage.getItem('token')
    setSelectedThread(thread)
    setSelectedGroupChat(null)
    setSelectedRequest(null)
    setShowChat(true)
    clearInterval(directPollRef.current)
    clearInterval(groupPollRef.current)
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

  const openRequest = async (request) => {
    const token = localStorage.getItem('token')
    setSelectedRequest(request)
    setSelectedThread(null)
    setSelectedGroupChat(null)
    setShowChat(true)
    try {
      const res = await axios.get(`${API_URL}/api/messages/${request.userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const openGroupChat = async (chat) => {
    const token = localStorage.getItem('token')
    setSelectedGroupChat(chat)
    setSelectedThread(null)
    setSelectedRequest(null)
    setShowChat(true)
    clearInterval(directPollRef.current)
    clearInterval(groupPollRef.current)
    fetchGroupMessages(token, chat.id)
    try {
      await axios.post(`${API_URL}/api/notifications/groupchat/${chat.id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUnreadGroupCount(prev => Math.max(0, prev - 1))
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

  const handleAcceptRequest = async (userId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/messages/requests/${userId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Message request accepted! 💬')
      fetchAll(token)
      setSelectedRequest(null)
      setShowChat(false)
      setActiveTab('direct')
    } catch (err) {
      showToast('Failed to accept request', 'error')
    }
  }

  const handleDeclineRequest = async (userId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/messages/requests/${userId}/decline`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Request declined')
      fetchAll(token)
      setSelectedRequest(null)
      setShowChat(false)
    } catch (err) {
      showToast('Failed to decline request', 'error')
    }
  }

  const handleLeaveGroupChat = async (chatId) => {
    const token = localStorage.getItem('token')
    const chat = groupChats.find(c => c.id === chatId)
    try {
      await axios.post(`${API_URL}/api/sessions/${chat?.sessionId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSelectedGroupChat(null)
      setShowChat(false)
      setLeaveGroupConfirm(null)
      showToast('You have left the session and group chat')
      fetchAll(token)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to leave', 'error')
    }
  }

  const handleRequestRejoin = async (sessionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/request-rejoin`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Rejoin request sent to host! 🙏')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to send request', 'error')
    }
  }

  const handleApproveRejoin = async (sessionId, userId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/approve/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('User approved to rejoin! ✅')
      fetchAll(token)
    } catch (err) {
      showToast('Failed to approve', 'error')
    }
  }

  const handleDeclineRejoin = async (sessionId, userId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/decline/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Rejoin request declined')
      fetchAll(token)
    } catch (err) {
      showToast('Failed to decline', 'error')
    }
  }

  const handleSearchUsers = async (q) => {
    setUserSearch(q)
    if (!q.trim()) { setSearchResults([]); return }
    const token = localStorage.getItem('token')
    const me = JSON.parse(localStorage.getItem('user'))
    setSearching(true)
    try {
      const res = await axios.get(`${API_URL}/api/users/search?q=${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSearchResults(res.data.filter(u => u.id !== me?.id))
    } catch (err) {
      console.error(err)
    }
    setSearching(false)
  }

  const handleStartNewMessage = async (user) => {
    const token = localStorage.getItem('token')
    setShowNewMessage(false)
    setUserSearch('')
    setSearchResults([])
    const existing = threads.find(t => t.userId === user.id)
    if (existing) {
      openThread(existing)
      return
    }
    try {
      await axios.post(`${API_URL}/api/messages`, {
        receiverId: user.id,
        text: `Hey ${user.name?.split(' ')[0]}! 👋`
      }, { headers: { Authorization: `Bearer ${token}` } })
      fetchAll(token)
      const newThread = { userId: user.id, name: user.name, major: user.major, unread: 0, lastMessage: null }
      openThread(newThread)
    } catch (err) {
      showToast('Failed to start conversation', 'error')
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
        <div 
  className="flex items-center gap-3 cursor-pointer"
  onClick={() => navigate('/dashboard')}
>
  <Logo size={36} />
  <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
</div>
        <button onClick={() => navigate('/dashboard')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Dashboard
        </button>
      </nav>

      {/* Rejoin Request Popups for Host */}
      {rejoinRequests.map(req => (
        <div key={req.userId} className="fixed top-20 right-4 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-10 h-10 ${getColor(req.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
              {getInitials(req.name)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-800">{req.name}</p>
              <p className="text-xs text-gray-500">wants to rejoin <span className="font-semibold">{req.chatName}</span></p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleDeclineRejoin(req.sessionId, req.userId)}
              className="flex-1 border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-xl hover:bg-gray-50 transition"
            >
              Decline
            </button>
            <button
              onClick={() => handleApproveRejoin(req.sessionId, req.userId)}
              className="flex-1 bg-ncat-blue text-white text-xs font-bold py-2 rounded-xl hover:opacity-90 transition"
            >
              Approve ✅
            </button>
          </div>
        </div>
      ))}

      <div className="flex flex-1 overflow-hidden">

        {/* Sidebar */}
        <div className={`${showChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 bg-white border-r border-gray-100 flex-shrink-0`}>

          {/* Tabs + New Message Button */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-gray-800">Messages</p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="w-8 h-8 bg-ncat-blue rounded-full flex items-center justify-center text-white hover:opacity-90 transition"
                title="New Message"
              >
                ✏️
              </button>
            </div>
            <div className="flex">
              <button
                onClick={() => setActiveTab('direct')}
                className={`flex-1 py-2 text-xs font-semibold transition rounded-l-xl border ${activeTab === 'direct' ? 'bg-ncat-blue text-white border-ncat-blue' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                💬 Direct
                {threads.filter(t => t.unread > 0).length > 0 && (
                  <span className="ml-1 bg-white text-ncat-blue text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {threads.filter(t => t.unread > 0).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-2 text-xs font-semibold transition border-t border-b ${activeTab === 'requests' ? 'bg-ncat-blue text-white border-ncat-blue' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                📬 Requests
                {requests.length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {requests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('sessions')}
                className={`flex-1 py-2 text-xs font-semibold transition rounded-r-xl border ${activeTab === 'sessions' ? 'bg-ncat-blue text-white border-ncat-blue' : 'text-gray-500 border-gray-200 hover:bg-gray-50'}`}
              >
                👥 Groups
                {unreadGroupCount > 0 && (
                  <span className="ml-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
                    {unreadGroupCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'direct' && (
              threads.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-500 font-medium text-sm">No messages yet</p>
                  <button onClick={() => setShowNewMessage(true)} className="mt-4 bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">
                    Start a conversation
                  </button>
                </div>
              ) : (
                threads.map(thread => (
                  <button key={thread.userId} onClick={() => openThread(thread)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${selectedThread?.userId === thread.userId ? 'bg-blue-50 border-l-4 border-l-ncat-blue' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${getColor(thread.name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {getInitials(thread.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-semibold text-sm text-gray-800 truncate">{thread.name}</p>
                          {thread.unread > 0 && (
                            <span className="bg-ncat-blue text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center ml-2">{thread.unread}</span>
                          )}
                        </div>
                        <p className={`text-xs truncate ${thread.unread > 0 ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
                          {thread.lastMessage?.text || 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )
            )}

            {activeTab === 'requests' && (
              requests.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-4xl mb-3">📬</p>
                  <p className="text-gray-500 font-medium text-sm">No message requests</p>
                </div>
              ) : (
                requests.map(request => (
                  <button key={request.userId} onClick={() => openRequest(request)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${selectedRequest?.userId === request.userId ? 'bg-blue-50 border-l-4 border-l-ncat-blue' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${getColor(request.name)} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
                        {getInitials(request.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{request.name}</p>
                        <p className="text-xs text-gray-400 truncate">{request.firstMessage?.text}</p>
                        <p className="text-xs text-orange-400 font-semibold mt-0.5">Pending request</p>
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
                  <button onClick={() => navigate('/find-sessions')} className="mt-4 bg-ncat-blue text-white font-bold px-4 py-2 rounded-xl hover:opacity-90 transition text-sm">
                    Find Sessions
                  </button>
                </div>
              ) : (
                groupChats.map(chat => (
                  <button key={chat.id} onClick={() => openGroupChat(chat)}
                    className={`w-full text-left p-4 border-b border-gray-50 hover:bg-gray-50 transition ${selectedGroupChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-l-ncat-blue' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-ncat-blue rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">👥</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-800 truncate">{chat.name}</p>
                        <p className="text-xs text-gray-400">{chat.members?.filter(m => !m.leftAt).length} members</p>
                        {chat.messages?.[0] && (
  <p className={`text-xs truncate ${chat.hasUnread ? 'text-gray-800 font-semibold' : 'text-gray-400'}`}>
    {chat.messages[0].isSystem ? chat.messages[0].text : `${chat.messages[0].sender?.name}: ${chat.messages[0].text}`}
  </p>
)}
                      </div>
                    </div>
                  </button>
                ))
              )
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${!showChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col overflow-hidden`}>

          {!selectedThread && !selectedGroupChat && !selectedRequest ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-6xl mb-4">💬</p>
                <p className="text-gray-500 font-medium">Select a conversation</p>
                <button onClick={() => setShowNewMessage(true)} className="mt-4 bg-ncat-blue text-white font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm">
                  ✏️ New Message
                </button>
              </div>
            </div>

          ) : selectedRequest ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <button onClick={() => setShowChat(false)} className="md:hidden bg-white px-4 py-2 text-ncat-blue font-semibold text-sm border-b border-gray-100 text-left">← Back</button>
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className={`w-10 h-10 ${getColor(selectedRequest.name)} rounded-full flex items-center justify-center text-white font-bold text-sm cursor-pointer`}
                  onClick={() => navigate(`/profile/${selectedRequest.userId}`)}>
                  {getInitials(selectedRequest.name)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{selectedRequest.name}</p>
                  <p className="text-xs text-orange-400 font-semibold">Message Request</p>
                </div>
              </div>
              <div className="bg-orange-50 border-b border-orange-100 px-6 py-3 text-center">
                <p className="text-sm text-orange-600 font-semibold">{selectedRequest.name} wants to send you a message</p>
                <p className="text-xs text-orange-400 mt-0.5">They can't see if you've read this until you accept</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.map(msg => (
                  <div key={msg.id} className="flex justify-start">
                    <div className={`w-8 h-8 ${getColor(msg.sender?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end`}>
                      {getInitials(msg.sender?.name)}
                    </div>
                    <div className="max-w-xs md:max-w-md px-4 py-3 rounded-2xl bg-white text-gray-800 rounded-bl-sm shadow-sm">
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 text-gray-400">{formatTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-100 bg-white">
                <p className="text-sm text-gray-500 text-center mb-3">Accept to reply to {selectedRequest.name}</p>
                <div className="flex gap-3">
                  <button onClick={() => handleDeclineRequest(selectedRequest.userId)}
                    className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                    Decline
                  </button>
                  <button onClick={() => handleAcceptRequest(selectedRequest.userId)}
                    className="flex-1 bg-ncat-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
                    Accept ✓
                  </button>
                </div>
              </div>
            </div>

          ) : selectedThread ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <button onClick={() => setShowChat(false)} className="md:hidden bg-white px-4 py-2 text-ncat-blue font-semibold text-sm border-b border-gray-100 text-left">← Back</button>
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
                        <div className="flex items-center gap-1 justify-end mt-1">
                          <p className={`text-xs ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                          {msg.senderId === currentUser?.id && (
                            <p className="text-xs text-blue-200">{msg.read ? '✓✓' : '✓'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendDirect()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue" />
                <button onClick={handleSendDirect} disabled={sending || !newMessage.trim()}
                  className="bg-ncat-blue text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40">Send</button>
              </div>
            </div>

          ) : selectedGroupChat ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <button onClick={() => setShowChat(false)} className="md:hidden bg-white px-4 py-2 text-ncat-blue font-semibold text-sm border-b border-gray-100 text-left">← Back</button>
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 bg-ncat-blue rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">👥</div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{selectedGroupChat.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedGroupChat.members?.filter(m => !m.leftAt).length} members · Expires {new Date(selectedGroupChat.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button onClick={() => setLeaveGroupConfirm(selectedGroupChat)} className="text-red-400 hover:text-red-600 text-sm font-semibold transition">Leave</button>
              </div>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {groupMessages.length === 0 ? (
                  <div className="text-center py-8"><p className="text-gray-400 text-sm">No messages yet!</p></div>
                ) : (
                  groupMessages.map(msg => (
                    msg.isSystem ? (
                      // System messages — centered grey text
                      <div key={msg.id} className="flex justify-center my-2">
                        <p className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{msg.text}</p>
                      </div>
                    ) : (
                      <div key={msg.id} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                        {msg.senderId !== currentUser?.id && (
                          <div className={`w-8 h-8 ${getColor(msg.sender?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs mr-2 flex-shrink-0 self-end cursor-pointer`}
                            onClick={() => navigate(`/profile/${msg.senderId}`)}>
                            {getInitials(msg.sender?.name)}
                          </div>
                        )}
                        <div className="max-w-xs md:max-w-md">
                          {msg.senderId !== currentUser?.id && (
                            <p className="text-xs text-gray-400 mb-1 ml-1">{msg.sender?.name}</p>
                          )}
                          <div className={`px-4 py-3 rounded-2xl ${msg.senderId === currentUser?.id ? 'bg-ncat-blue text-white rounded-br-sm' : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.senderId === currentUser?.id ? 'text-blue-200' : 'text-gray-400'}`}>{formatTime(msg.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    )
                  ))
                )}
                <div ref={groupMessagesEndRef} />
              </div>
              <div className="p-4 border-t border-gray-100 bg-white flex gap-3">
                <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendGroup()}
                  placeholder={`Message ${selectedGroupChat.name}...`}
                  className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue" />
                <button onClick={handleSendGroup} disabled={sending || !newMessage.trim()}
                  className="bg-ncat-blue text-white font-bold px-6 py-3 rounded-2xl hover:opacity-90 transition disabled:opacity-40">Send</button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Leave Group Chat Warning Modal */}
      {leaveGroupConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <p className="text-4xl mb-3">⚠️</p>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Leave Session?</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                If you leave <span className="font-semibold text-ncat-blue">{leaveGroupConfirm.name}</span> you will also be removed from the session.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                You'll need to wait <span className="font-semibold">30 minutes</span> or get host approval to rejoin.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setLeaveGroupConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition">
                Stay
              </button>
              <button onClick={() => handleLeaveGroupChat(leaveGroupConfirm.id)}
                className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Message Modal */}
      {showNewMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-ncat-blue">New Message</h2>
              <button onClick={() => { setShowNewMessage(false); setUserSearch(''); setSearchResults([]) }} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="relative mb-4">
              <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
              <input type="text" placeholder="Search for an Aggie..." value={userSearch}
                onChange={e => handleSearchUsers(e.target.value)}
                className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                autoFocus />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {searching ? (
                <p className="text-center text-gray-400 text-sm py-4">Searching...</p>
              ) : searchResults.length === 0 && userSearch ? (
                <p className="text-center text-gray-400 text-sm py-4">No Aggies found</p>
              ) : (
                searchResults.map(user => (
                  <button key={user.id} onClick={() => handleStartNewMessage(user)}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition flex items-center gap-3">
                    <div className={`w-10 h-10 ${getColor(user.name)} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        {user.name}
                        {user.isPrivate && <span className="ml-1 text-xs text-gray-400">🔒</span>}
                      </p>
                      <p className="text-xs text-gray-400">{user.major} · {user.year}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}