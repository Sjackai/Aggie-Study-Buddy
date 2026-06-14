import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('verifying')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) { setStatus('error'); return }

    axios.post(`${API_URL}/api/auth/verify-email`, { token })
      .then(async () => {
        setStatus('success')
        const authToken = localStorage.getItem('token')
        if (authToken) {
          try {
            const res = await axios.get(`${API_URL}/api/users/me`, {
              headers: { Authorization: `Bearer ${authToken}` }
            })
            localStorage.setItem('user', JSON.stringify(res.data))
          } catch (err) {
            const stored = localStorage.getItem('user')
            if (stored) {
              const user = JSON.parse(stored)
              user.emailVerified = true
              localStorage.setItem('user', JSON.stringify(user))
            }
          }
        }
      })
      .catch(() => {
        // Even if token is "expired", check if user is already verified
        const authToken = localStorage.getItem('token')
        if (authToken) {
          axios.get(`${API_URL}/api/users/me`, {
            headers: { Authorization: `Bearer ${authToken}` }
          }).then(res => {
            if (res.data.emailVerified) {
              setStatus('success')
              localStorage.setItem('user', JSON.stringify(res.data))
            } else {
              setStatus('error')
            }
          }).catch(() => setStatus('error'))
        } else {
          setStatus('error')
        }
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-8 w-full max-w-md text-center">
        <Logo size={36} />

        {status === 'verifying' && (
          <>
            <p className="text-4xl mb-3 mt-4">⏳</p>
            <h1 className="text-xl font-bold text-ncat-blue mb-2">Verifying your email...</h1>
            <p className="text-gray-500 text-sm">Hang tight, this'll just take a second.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <p className="text-4xl mb-3 mt-4">✅</p>
            <h1 className="text-xl font-bold text-ncat-blue mb-2">Email Verified!</h1>
            <p className="text-gray-500 text-sm mb-6">Your account is now fully verified. Welcome to Aggie StudyBuddy 🐾</p>
            <button onClick={() => navigate('/dashboard')}
              className="w-full bg-ncat-gold text-ncat-blue font-bold py-3 rounded-xl hover:opacity-90 transition shadow-md">
              Go to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <p className="text-4xl mb-3 mt-4">❌</p>
            <h1 className="text-xl font-bold text-ncat-blue mb-2">Invalid or Expired Link</h1>
            <p className="text-gray-500 text-sm mb-6">This verification link is no longer valid. You can request a new one from your dashboard.</p>
            <button onClick={() => navigate('/dashboard')}
              className="w-full bg-ncat-blue text-white font-bold py-3 rounded-xl hover:opacity-90 transition shadow-md">
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  )
}