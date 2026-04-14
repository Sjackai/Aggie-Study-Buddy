import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import courses from '../data/courses'

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [courseSearch, setCourseSearch] = useState('')
  const [studyStyles, setStudyStyles] = useState([])
  const [studyTimes, setStudyTimes] = useState([])
  const [goals, setGoals] = useState([])
  const [saving, setSaving] = useState(false)

  const goalOptions = [
    { id: 'find_partners', label: 'Find people to study with regularly', emoji: '🤝' },
    { id: 'get_help', label: 'Get help with specific courses', emoji: '🧠' },
    { id: 'help_others', label: 'Help others with subjects I\'m good at', emoji: '💡' },
    { id: 'exam_prep', label: 'Prep for exams', emoji: '📝' },
    { id: 'explore', label: 'Just exploring for now', emoji: '👀' },
  ]

  const toggleCourse = (code) => {
    if (selectedCourses.includes(code)) {
      setSelectedCourses(prev => prev.filter(c => c !== code))
    } else {
      if (selectedCourses.length >= 8) return
      setSelectedCourses(prev => [...prev, code])
    }
  }

  const toggleStudyStyle = (value) => {
    if (studyStyles.includes(value)) {
      setStudyStyles(prev => prev.filter(s => s !== value))
    } else {
      setStudyStyles(prev => [...prev, value])
    }
  }

  const toggleStudyTime = (value) => {
    if (studyTimes.includes(value)) {
      setStudyTimes(prev => prev.filter(t => t !== value))
    } else {
      if (studyTimes.length >= 2) return
      setStudyTimes(prev => [...prev, value])
    }
  }

  const toggleGoal = (id) => {
    if (goals.includes(id)) {
      setGoals(prev => prev.filter(g => g !== id))
    } else {
      setGoals(prev => [...prev, id])
    }
  }

  const handleFinish = async () => {
    const token = localStorage.getItem('token')
    setSaving(true)
    try {
      await axios.post(`${API_URL}/api/users/preferences`, {
        studyStyle: studyStyles.join(','),
        studyTime: studyTimes.join(','),
        goals: goals.join(','),
        courses: selectedCourses
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
      navigate('/dashboard')
    }
    setSaving(false)
  }

  const filteredCourses = courses.filter(c =>
    c.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.name.toLowerCase().includes(courseSearch.toLowerCase())
  )

  const user = JSON.parse(localStorage.getItem('user'))

  return (
    <div className="min-h-screen bg-ncat-blue flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <div 
  className="flex items-center gap-3 cursor-pointer"
  onClick={() => navigate('/dashboard')}
>
  <Logo size={36} />
  <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
</div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${
              s === step ? 'bg-ncat-gold text-ncat-blue' :
              s < step ? 'bg-white text-ncat-blue' :
              'bg-white bg-opacity-20 text-white'
            }`}>
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-6 py-8">
        <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">

          {/* Step 1 — Courses */}
          {step === 1 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ncat-blue mb-2">
                  Welcome, {user?.name?.split(' ')[0]}! 🐾
                </h2>
                <p className="text-gray-500">
                  What courses are you taking this semester? We'll use this to find the best study sessions for you.
                </p>
                <p className="text-sm text-gray-400 mt-1">Select up to 8 courses (required)</p>
              </div>

              <div className="relative mb-4">
                <span className="absolute left-4 top-3.5 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={courseSearch}
                  onChange={e => setCourseSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                />
              </div>

              {selectedCourses.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                  {selectedCourses.map(code => (
                    <span
                      key={code}
                      onClick={() => toggleCourse(code)}
                      className="bg-ncat-blue text-white text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 flex items-center gap-1"
                    >
                      {code} ✕
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-xl">
                {filteredCourses.map(course => (
                  <button
                    key={course.code}
                    onClick={() => toggleCourse(course.code)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition flex justify-between items-center ${
                      selectedCourses.includes(course.code) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-ncat-blue text-sm">{course.code}</span>
                      <span className="text-gray-500 text-sm ml-2">{course.name}</span>
                    </div>
                    {selectedCourses.includes(course.code) && (
                      <span className="text-ncat-blue font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedCourses.length > 0 && setStep(2)}
                disabled={selectedCourses.length === 0}
                className="w-full mt-6 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40"
              >
                Continue → ({selectedCourses.length} selected)
              </button>
            </div>
          )}

          {/* Step 2 — Study Style */}
          {step === 2 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ncat-blue mb-2">Your Study Style 📚</h2>
                <p className="text-gray-500">Help us find sessions that match how you like to study.</p>
              </div>

              <div className="mb-6">
                <p className="font-semibold text-gray-700 mb-1">How do you prefer to study?</p>
                <p className="text-xs text-gray-400 mb-3">Select all that apply</p>
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { value: 'solo', label: 'Solo with occasional help', emoji: '🧑‍💻' },
                    { value: 'small', label: 'Small groups (2-3 people)', emoji: '👥' },
                    { value: 'medium', label: 'Medium groups (4-6 people)', emoji: '👨‍👩‍👧‍👦' },
                    { value: 'any', label: 'Any size is fine', emoji: '🤷' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleStudyStyle(option.value)}
                      className={`p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ${
                        studyStyles.includes(option.value)
                          ? 'border-ncat-blue bg-blue-50'
                          : 'border-gray-200 hover:border-ncat-blue'
                      }`}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="font-semibold text-gray-700">{option.label}</span>
                      {studyStyles.includes(option.value) && <span className="ml-auto text-ncat-blue font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <p className="font-semibold text-gray-700 mb-1">When do you usually study?</p>
                <p className="text-xs text-gray-400 mb-3">Select up to 2</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'morning', label: 'Morning', sub: '8am - 12pm', emoji: '🌅' },
                    { value: 'afternoon', label: 'Afternoon', sub: '12pm - 5pm', emoji: '☀️' },
                    { value: 'evening', label: 'Evening', sub: '5pm - 9pm', emoji: '🌆' },
                    { value: 'latenight', label: 'Late Night', sub: '9pm+', emoji: '🌙' },
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => toggleStudyTime(option.value)}
                      disabled={studyTimes.length >= 2 && !studyTimes.includes(option.value)}
                      className={`p-4 rounded-xl border-2 text-left transition ${
                        studyTimes.includes(option.value)
                          ? 'border-ncat-blue bg-blue-50'
                          : studyTimes.length >= 2
                          ? 'border-gray-200 opacity-40 cursor-not-allowed'
                          : 'border-gray-200 hover:border-ncat-blue'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{option.emoji}</span>
                      <span className="font-semibold text-gray-700 text-sm">{option.label}</span>
                      <span className="text-gray-400 text-xs block">{option.sub}</span>
                      {studyTimes.includes(option.value) && <span className="text-ncat-blue font-bold text-xs">✓ Selected</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition"
                >
                  Continue →
                </button>
              </div>

              <button
                onClick={() => setStep(3)}
                className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600 transition"
              >
                Skip this step
              </button>
            </div>
          )}

          {/* Step 3 — Goals */}
          {step === 3 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-ncat-blue mb-2">Your Goals 🎯</h2>
                <p className="text-gray-500">What are you looking to get out of Aggie StudyBuddy?</p>
                <p className="text-sm text-gray-400 mt-1">Select all that apply</p>
              </div>

              <div className="space-y-3 mb-6">
                {goalOptions.map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-3 transition ${
                      goals.includes(goal.id)
                        ? 'border-ncat-blue bg-blue-50'
                        : 'border-gray-200 hover:border-ncat-blue'
                    }`}
                  >
                    <span className="text-2xl">{goal.emoji}</span>
                    <span className="font-semibold text-gray-700">{goal.label}</span>
                    {goals.includes(goal.id) && <span className="ml-auto text-ncat-blue font-bold">✓</span>}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 border border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-1 bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-40"
                >
                  {saving ? 'Saving...' : "Let's Go! 🐾"}
                </button>
              </div>

              <button
                onClick={handleFinish}
                className="w-full mt-3 text-gray-400 text-sm hover:text-gray-600 transition"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}