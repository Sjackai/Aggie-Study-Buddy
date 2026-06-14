import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email })
      setSent(true)
    } catch (err) {
      setSent(true) // still show success to not reveal account existence
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <Logo size={36} />
          <h1 className="text-2xl font-bold text-ncat-blue mt-2">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-4xl mb-3">📬</p>
            <p className="text-gray-600 text-sm mb-6">
              If an account exists for <span className="font-semibold">{email}</span>, you'll receive a password reset link shortly.
            </p>
            <Link to="/login" className="text-ncat-blue font-semibold hover:underline text-sm">
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ncat-blue mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@aggies.ncat.edu"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ncat-blue"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition shadow-md disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-ncat-blue font-semibold hover:underline">← Back to Login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
