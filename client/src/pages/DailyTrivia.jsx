import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

export default function DailyTrivia() {
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [trivia, setTrivia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [phase, setPhase] = useState('ready') // ready | playing | result
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState([])
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [result, setResult] = useState(null)
  const [startTime, setStartTime] = useState(null)
  const timerRef = useRef(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchTrivia(token)
  }, [])

  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  const fetchTrivia = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/games/daily-trivia`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTrivia(res.data)
      if (res.data.myAttempt) setPhase('result')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const startTrivia = () => {
    setPhase('playing')
    setCurrentQ(0)
    setAnswers([])
    setStartTime(Date.now())
    startTimer()
  }

  const startTimer = () => {
    clearInterval(timerRef.current)
    setTimeLeft(30)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleNextQuestion(-1) // timeout = wrong
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleNextQuestion = (answerIndex) => {
    clearInterval(timerRef.current)
    setSelectedAnswer(answerIndex)

    setTimeout(() => {
      const newAnswers = [...answers, answerIndex]
      setAnswers(newAnswers)
      setSelectedAnswer(null)

      if (currentQ + 1 >= trivia.questions.length) {
        submitTrivia(newAnswers)
      } else {
        setCurrentQ(prev => prev + 1)
        startTimer()
      }
    }, 800)
  }

  const submitTrivia = async (finalAnswers) => {
    const token = localStorage.getItem('token')
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    try {
      const res = await axios.post(`${API_URL}/api/games/daily-trivia/submit`, {
        triviaId: trivia.id,
        answers: finalAnswers,
        timeTaken
      }, { headers: { Authorization: `Bearer ${token}` } })
      setResult(res.data)
      setPhase('result')
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit', 'error')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-ncat-blue font-semibold">Loading trivia...</p>
    </div>
  )

  const question = trivia?.questions?.[currentQ]

  return (
    <div className={`min-h-screen transition-colors duration-500 ${phase === 'playing' ? 'bg-ncat-blue' : 'bg-gray-50'}`}>
      <nav className={`px-6 py-4 flex justify-between items-center shadow-md ${phase === 'playing' ? 'bg-blue-900' : 'bg-ncat-blue'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/games')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <button onClick={() => navigate('/games')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
          ← Brain Games
        </button>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Ready */}
        {phase === 'ready' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-3xl p-6 text-white shadow-lg">
              <h1 className="text-2xl font-bold mb-1">🧠 Daily Trivia</h1>
              <p className="text-purple-100 text-sm">Today's theme: <span className="font-bold text-white">{trivia?.category}</span></p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
              <p className="text-5xl mb-4">🧠</p>
              <h2 className="text-xl font-bold text-ncat-blue mb-2">Ready to test your knowledge?</h2>
              <p className="text-gray-500 text-sm mb-6">{trivia?.totalQuestions} questions · 30 seconds each · One attempt!</p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: 'Questions', value: trivia?.totalQuestions, emoji: '❓' },
                  { label: 'Time each', value: '7s', emoji: '⏱️' },
                  { label: 'Max XP', value: `${trivia?.totalQuestions * 10 + 50}`, emoji: '⚡' },
                ].map((s, i) => (
                  <div key={i} className="bg-gray-50 rounded-2xl p-3 text-center">
                    <p className="text-xl mb-1">{s.emoji}</p>
                    <p className="font-bold text-ncat-blue">{s.value}</p>
                    <p className="text-xs text-gray-400">{s.label}</p>
                  </div>
                ))}
              </div>
              <button onClick={startTrivia} className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition shadow-md text-lg">
                Start Trivia 🧠
              </button>
            </div>
          </div>
        )}

        {/* Playing */}
        {phase === 'playing' && question && (
          <div className="space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-ncat-gold rounded-full transition-all"
                  style={{ width: `${((currentQ) / trivia.questions.length) * 100}%` }}
                />
              </div>
              <span className="text-white text-sm font-bold">{currentQ + 1}/{trivia.questions.length}</span>
            </div>

            {/* Timer */}
            <div className={`rounded-2xl p-3 flex items-center justify-between ${timeLeft <= 8 ? 'bg-red-500' : 'bg-white bg-opacity-10 border border-white border-opacity-20'} text-white`}>
              <span className="font-bold text-sm">⏱️ Time</span>
              <span className={`text-2xl font-bold ${timeLeft <= 3 ? 'animate-pulse' : ''}`}>{timeLeft}s</span>
            </div>

            <div className="h-1.5 bg-white bg-opacity-20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 3 ? 'bg-red-400' : 'bg-ncat-gold'}`}
                style={{ width: `${(timeLeft / 30) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="bg-white bg-opacity-10 rounded-2xl p-6 border border-white border-opacity-20">
              <p className="text-white font-bold text-lg text-center leading-relaxed">{question.question}</p>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {question.options.map((option, i) => (
                <button
                  key={i}
                  onClick={() => handleNextQuestion(i)}
                  disabled={selectedAnswer !== null}
                  className={`rounded-2xl p-4 text-left font-semibold transition-all border-2 ${
                    selectedAnswer === i
                      ? 'bg-ncat-gold border-ncat-gold text-ncat-blue'
                      : 'bg-white bg-opacity-10 border-white border-opacity-30 text-white hover:bg-opacity-20'
                  }`}
                >
                  <span className="text-xs font-bold opacity-60 mr-2">{['A', 'B', 'C', 'D'][i]}</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="space-y-6">
            <div className={`rounded-3xl p-8 text-white text-center shadow-lg ${
              (result?.score || trivia?.myAttempt?.score) === trivia?.totalQuestions
                ? 'bg-gradient-to-br from-ncat-gold to-yellow-500'
                : (result?.score || trivia?.myAttempt?.score) >= trivia?.totalQuestions * 0.7
                ? 'bg-gradient-to-br from-green-500 to-green-700'
                : 'bg-gradient-to-br from-ncat-blue to-blue-900'
            }`}>
              <p className="text-5xl mb-3">
                {(result?.score || trivia?.myAttempt?.score) === trivia?.totalQuestions ? '🏆' :
                 (result?.score || trivia?.myAttempt?.score) >= trivia?.totalQuestions * 0.7 ? '🎉' : '📚'}
              </p>
              <h2 className="text-2xl font-bold mb-2">
                {(result?.score || trivia?.myAttempt?.score) === trivia?.totalQuestions ? 'Perfect Score!' :
                 (result?.score || trivia?.myAttempt?.score) >= trivia?.totalQuestions * 0.7 ? 'Great Job!' : 'Keep Studying!'}
              </h2>
              <p className="text-3xl font-bold mb-2">
                {result?.score || trivia?.myAttempt?.score}/{trivia?.totalQuestions}
              </p>
              <p className="text-white text-opacity-80 text-sm mb-2">correct answers</p>
              <p className="text-2xl font-bold text-ncat-gold">
                +{result?.xpEarned || trivia?.myAttempt?.xpEarned} XP
              </p>
            </div>

            {/* Answer breakdown */}
{result?.results && trivia?.questions && (
  <div className="bg-white rounded-2xl shadow-sm p-6">
    <h3 className="font-bold text-ncat-blue mb-4">Answer Breakdown</h3>
    <div className="space-y-3">
      {result.results.map((r, i) => (
        <div key={i} className={`p-4 rounded-xl ${r.isCorrect ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
          <div className="flex items-start gap-2 mb-2">
            <span className="flex-shrink-0">{r.isCorrect ? '✅' : '❌'}</span>
            <p className="text-sm font-semibold text-gray-800">{trivia.questions[i]?.question}</p>
          </div>
          {!r.isCorrect && (
            <div className="ml-6 space-y-1">
              <p className="text-xs text-red-500">
                Your answer: {trivia.questions[i]?.options[r.yourAnswer] || 'No answer (timed out)'}
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Correct: {trivia.questions[i]?.options[r.correctIndex]}
              </p>
            </div>
          )}
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