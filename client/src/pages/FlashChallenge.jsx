import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'
const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function FlashChallenge() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('ready') // ready | answering | result
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [result, setResult] = useState(null)
  const [timeLeft, setTimeLeft] = useState(60)
  const [startTime, setStartTime] = useState(null)
  const timerRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchChallenge(token)
  }, [])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const fetchChallenge = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/games/daily-challenge`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setChallenge(res.data)
      if (res.data.myAttempt) setPhase('result')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const startChallenge = () => {
    setPhase('answering')
    setStartTime(Date.now())
    setTimeLeft(60)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleTimeout()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleTimeout = async () => {
    clearInterval(timerRef.current)
    await submitAnswer(-1, 60)
  }

  const handleAnswer = async (index) => {
    if (selectedAnswer !== null) return
    clearInterval(timerRef.current)
    setSelectedAnswer(index)
    const timeTaken = (Date.now() - startTime) / 1000
    await submitAnswer(index, timeTaken)
  }

  const submitAnswer = async (answerIndex, timeSeconds) => {
    const token = localStorage.getItem('token')
    try {
      const res = await axios.post(`${API_URL}/api/games/daily-challenge/submit`, {
        challengeId: challenge.id,
        answerIndex,
        timeSeconds
      }, { headers: { Authorization: `Bearer ${token}` } })
      setResult(res.data)
      setPhase('result')
      fetchChallenge(token)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit', 'error')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold">Loading challenge...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/games')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/games')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Brain Games
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 mb-6 text-white relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 opacity-10 text-6xl flex items-center justify-around">
            🔥🔥🔥
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl font-bold mb-1">🔥 Daily Flash Challenge</h1>
            <p className="text-orange-100 text-sm">One question · 60 seconds · Speed earns bonus XP</p>
          </div>
        </div>

        {/* Ready phase */}
        {phase === 'ready' && challenge && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <p className="text-5xl mb-4">⚡</p>
            <h2 className="text-xl font-bold text-ncat-blue mb-2">Ready for today's challenge?</h2>
            <p className="text-gray-500 text-sm mb-2">Category: <span className="font-semibold text-ncat-blue">{challenge.question?.category}</span></p>
            <p className="text-gray-400 text-xs mb-6">You have 60 seconds once you start. Answer fast for bonus XP!</p>
            <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100">
              <p className="text-orange-700 text-sm font-semibold">⚠️ One attempt only — no going back!</p>
            </div>
            <button onClick={startChallenge} className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-md text-lg">
              Start Challenge 🔥
            </button>
          </div>
        )}

        {/* Answering phase */}
        {phase === 'answering' && challenge && (
          <div className="space-y-4">
            {/* Timer */}
            <div className={`rounded-2xl p-4 flex items-center justify-between ${timeLeft <= 10 ? 'bg-red-500' : 'bg-ncat-blue'} text-white shadow-sm`}>
              <span className="font-bold">⏱️ Time Left</span>
              <span className={`text-3xl font-bold ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>{timeLeft}s</span>
            </div>

            {/* Timer bar */}
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-lg font-bold text-gray-800 text-center leading-relaxed">
                {challenge.question?.question}
              </p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {challenge.question?.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={selectedAnswer !== null}
                  className={`rounded-2xl p-4 text-left font-semibold transition-all border-2 ${
                    selectedAnswer === i
                      ? 'bg-ncat-blue border-ncat-blue text-white'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                  }`}
                >
                  <span className="text-xs font-bold opacity-60 mr-2">{['A', 'B', 'C', 'D'][i]}</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result phase */}
        {phase === 'result' && (
          <div className="space-y-6">
            {/* Result card */}
            <div className={`rounded-3xl p-8 text-white text-center shadow-lg ${
              challenge?.myAttempt?.isCorrect || result?.isCorrect
                ? 'bg-gradient-to-br from-green-500 to-green-700'
                : 'bg-gradient-to-br from-red-500 to-red-700'
            }`}>
              <p className="text-5xl mb-3">
                {challenge?.myAttempt?.isCorrect || result?.isCorrect ? '✅' : '❌'}
              </p>
              <h2 className="text-2xl font-bold mb-2">
                {challenge?.myAttempt?.isCorrect || result?.isCorrect ? 'Correct!' : 'Wrong Answer'}
              </h2>
              {(result || challenge?.myAttempt) && (
                <>
                  <p className="text-white text-opacity-80 text-sm mb-2">
                    Time: {(result?.timeSeconds || challenge?.myAttempt?.timeSeconds)?.toFixed(1)}s
                  </p>
                  <p className="text-3xl font-bold text-ncat-gold">
                    +{result?.xpEarned || challenge?.myAttempt?.xpEarned} XP
                  </p>
                </>
              )}
            </div>

            {/* Correct answer reveal */}
            {challenge?.question && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <p className="font-bold text-ncat-blue mb-3">Today's Question</p>
                <p className="text-gray-700 mb-4">{challenge.question.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {challenge.question.options.map((option, i) => (
                    <div key={i} className={`p-3 rounded-xl text-sm font-semibold ${
                      i === (result?.correctIndex ?? challenge.myAttempt?.answerIndex === i ? i : -1)
                        ? 'bg-green-100 text-green-700 border border-green-300'
                        : 'bg-gray-50 text-gray-500'
                    }`}>
                      <span className="opacity-60 mr-1">{['A', 'B', 'C', 'D'][i]}</span> {option}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {challenge?.leaderboard?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-ncat-blue mb-4">Today's Fastest ⚡</h3>
                <div className="space-y-3">
                  {challenge.leaderboard.map((entry, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${i < 3 ? 'bg-orange-50' : 'bg-gray-50'}`}>
                      <span className="text-lg font-bold w-8 text-center">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
                      </span>
                      <div className={`w-8 h-8 ${getColor(entry.name)} rounded-full flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0`}>
                        {entry.avatar ? <img src={entry.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(entry.name)}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{entry.name}</p>
                        <p className="text-xs text-gray-400">{entry.timeSeconds?.toFixed(1)}s</p>
                      </div>
                      <span className="text-orange-500 font-bold text-sm">+{entry.xpEarned} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => navigate('/games')} className="w-full bg-ncat-gold text-ncat-blue font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-md">
              Back to Hub 🎮
            </button>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}