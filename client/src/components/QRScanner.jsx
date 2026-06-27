import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import axios from 'axios'
import API_URL from '../config'

export default function QRScanner({ session, onSuccess, onClose }) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const html5QrRef = useRef(null)
  const successRef = useRef(false)

  useEffect(() => {
    const scanner = new Html5Qrcode('qr-reader')
    html5QrRef.current = scanner

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      async (decodedText) => {
        if (successRef.current) return
        successRef.current = true

        try {
          const data = JSON.parse(decodedText)
          if (data.sessionId !== session.id) {
            setError('This QR code is for a different session')
            successRef.current = false
            return
          }

          const token = localStorage.getItem('token')
          await axios.post(
            `${API_URL}/api/sessions/${session.id}/checkin`,
            { token: data.token },
            { headers: { Authorization: `Bearer ${token}` } }
          )

          setSuccess(true)

          try {
  if (scanner.isScanning) {
    await scanner.stop()
  }
} catch (e) {}
          setTimeout(() => onSuccess(), 2000)
        } catch (err) {
          successRef.current = false
          setError(err.response?.data?.error || 'Failed to check in')
        }
      },
      () => {}
    ).catch(() => {
      setError('Could not access camera. Please allow camera permissions.')
    })

    return () => {
  try {
    if (scanner.isScanning) {
      scanner.stop().catch(() => {})
    }
  } catch (e) {}
}
  }, [])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-ncat-blue">Scan QR Code</h2>
          <button onClick={() => {
            html5QrRef.current?.stop().catch(() => {})
            onClose()
          }} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        </div>

        {success ? (
          <div className="py-8">
            <p className="text-5xl mb-3">✅</p>
            <p className="text-green-600 font-bold text-lg">Checked In!</p>
            <p className="text-gray-400 text-sm mt-1">You're marked as attended for {session.courseCode}</p>
          </div>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-4">Point your camera at the host's QR code</p>
            <div id="qr-reader" className="rounded-2xl overflow-hidden mb-4" />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mt-3">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}