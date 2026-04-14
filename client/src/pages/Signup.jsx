import Logo from '../components/Logo'
import API_URL from '../config'
import MajorSelector from '../components/MajorSelector'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

const getPasswordStrength = (password) => {
  if (password.length === 0) return null
  if (password.length < 6) return { label: 'Too Short', color: 'bg-red-400', width: '20%' }
  if (password.length < 8) return { label: 'Weak', color: 'bg-orange-400', width: '40%' }
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length
  if (score === 0) return { label: 'Fair', color: 'bg-yellow-400', width: '60%' }
  if (score === 1) return { label: 'Good', color: 'bg-blue-400', width: '75%' }
  return { label: 'Strong', color: 'bg-green-500', width: '100%' }
}

export default function Signup() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', major: '', year: '', isPrivate: false
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (!form.major) {
      setError('Please select your major')
      return
    }
    if (!form.year) {
      setError('Please select your year')
      return
    }

    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, {
        name: `${form.firstName} ${form.lastName}`,
        email: form.email,
        password: form.password,
        major: form.major,
        year: form.year,
        isPrivate: form.isPrivate
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed')
    }
    setLoading(false)
  }

  const strength = getPasswordStrength(form.password)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <Logo size={48} />
          </div>
          <h1 className="text-3xl font-bold text-ncat-blue">Welcome, Aggie!</h1>
          <p className="text-gray-500 mt-1">Create your Aggie StudyBuddy account</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ncat-blue mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ncat-blue mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-ncat-blue mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="yourname@aggies.ncat.edu"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-semibold text-ncat-blue">Password</label>
              <div className="relative group">
                <div className="w-4 h-4 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer text-white text-xs font-bold">i</div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                  <p className="font-semibold mb-1">Password must have:</p>
                  <ul className="space-y-0.5">
                    <li>• At least 8 characters</li>
                    <li>• One uppercase letter</li>
                    <li>• One number</li>
                    <li>• One special character</li>
                  </ul>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
                </div>
              </div>
            </div>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password (min 8 characters)"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
              required
            />
            {strength && (
              <div className="mt-2">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                </div>
                <p className={`text-xs mt-1 font-semibold ${
                  strength.label === 'Strong' ? 'text-green-500' :
                  strength.label === 'Good' ? 'text-blue-400' :
                  strength.label === 'Fair' ? 'text-yellow-500' : 'text-red-400'
                }`}>{strength.label}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-ncat-blue mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue ${
                form.confirmPassword && form.password !== form.confirmPassword
                  ? 'border-red-300 bg-red-50'
                  : form.confirmPassword && form.password === form.confirmPassword
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-200'
              }`}
              required
            />
            {form.confirmPassword && form.password !== form.confirmPassword && (
              <p className="text-xs text-red-400 mt-1">Passwords don't match</p>
            )}
            {form.confirmPassword && form.password === form.confirmPassword && (
              <p className="text-xs text-green-500 mt-1">✓ Passwords match</p>
            )}
          </div>

          {/* Major & Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ncat-blue mb-1">Major <span className="text-red-400">*</span></label>
              <MajorSelector
                value={form.major}
                onChange={(val) => setForm({...form, major: val})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ncat-blue mb-1">Year <span className="text-red-400">*</span></label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
                required
              >
                <option value="">Select</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          </div>

          {/* Privacy Option */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <input
              type="checkbox"
              id="isPrivate"
              checked={form.isPrivate}
              onChange={e => setForm({...form, isPrivate: e.target.checked})}
              className="mt-0.5 w-4 h-4 accent-ncat-blue cursor-pointer"
            />
            <div>
              <label htmlFor="isPrivate" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Make my profile private 🔒
              </label>
              <p className="text-xs text-gray-400 mt-0.5">
                You won't appear in course or major suggestions. People can still find you by searching your name.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition mt-2"
          >
            {loading ? 'Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-ncat-blue font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}