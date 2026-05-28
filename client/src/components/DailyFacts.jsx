import { useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../config'

export default function DailyFacts() {
  const [fact, setFact] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [factRes, historyRes] = await Promise.all([
          axios.get(`${API_URL}/api/daily/fact`),
          axios.get(`${API_URL}/api/daily/history`)
        ])
        setFact(factRes.data)
        setHistory(historyRes.data)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

 if (loading) return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const newsItems = [
    { title: 'Summer 2026 Registration Now Open', date: 'May 1, 2026', tag: '🎓 Academic' },
    { title: 'Bluford Library Extended Hours During Finals', date: 'Apr 28, 2026', tag: '📚 Library' },
    { title: 'Career Fair - Engineering and Technology', date: 'Apr 25, 2026', tag: '💼 Career' },
    { title: 'Aggie Pride Week Kicks Off May 12', date: 'Apr 20, 2026', tag: '🐾 Events' },
    { title: 'New Tutoring Center Opens in Crosby Hall', date: 'Apr 15, 2026', tag: '🧠 Resources' },
  ]

 return (
    <div className="space-y-4">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Did You Know */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-ncat-gold bg-opacity-20 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="font-bold text-ncat-blue">Did You Know?</h3>
              <p className="text-xs text-gray-400">Daily HBCU Fact</p>
            </div>
          </div>
          {fact ? (
            <>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">{fact.fact}</p>
              {fact.source && (
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Source:</span>
                  <span className="text-xs text-ncat-blue font-semibold">{fact.source}</span>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-400 text-sm">No fact available today.</p>
          )}
        </div>

        {/* Today in HBCU History */}
        <div className="bg-ncat-blue rounded-2xl p-6 hover:shadow-md transition">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-10 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📖</span>
            </div>
            <div>
              <h3 className="font-bold text-white">Today in HBCU History</h3>
              <p className="text-xs text-blue-300">{today}</p>
            </div>
          </div>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((event, i) => (
                <div key={i} className="border-l-2 border-ncat-gold pl-4">
                  <span className="inline-block bg-ncat-gold text-ncat-blue text-xs font-bold px-2 py-0.5 rounded-full mb-1">
                    {event.year}
                  </span>
                  <p className="text-white text-sm font-semibold mb-1">{event.event}</p>
                  {event.significance && (
                    <p className="text-blue-200 text-xs leading-relaxed">{event.significance}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-5xl mb-3">📅</p>
              <p className="text-blue-200 text-sm font-semibold">No historical events recorded for today.</p>
              <p className="text-blue-300 text-xs mt-1">Check back tomorrow!</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">📢</span>
            </div>
            <div>
              <h3 className="font-bold text-ncat-blue">NC A&amp;T News and Updates</h3>
              <p className="text-xs text-gray-400">Latest campus announcements</p>
            </div>
          </div>
          <a href="https://www.ncat.edu/news" target="_blank" rel="noreferrer" className="text-xs text-ncat-blue font-semibold hover:underline transition">View all</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {newsItems.map((item, i) => (
            <a key={i} href="https://www.ncat.edu/news" target="_blank" rel="noreferrer" className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 border border-transparent hover:border-ncat-blue transition">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800 leading-tight mb-1">{item.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-400">{item.date}</span>
                  <span className="text-xs bg-white text-ncat-blue font-semibold px-2 py-0.5 rounded-full border border-gray-200">{item.tag}</span>
                </div>
              </div>
              <span className="text-gray-300 text-sm mt-0.5 flex-shrink-0">→</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}