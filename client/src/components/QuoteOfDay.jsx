import { useState, useEffect } from 'react'
import axios from 'axios'
import API_URL from '../config'

export default function QuoteOfDay() {
  const [quote, setQuote] = useState(null)
  const [wikiImage, setWikiImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/quotes/today`)
        setQuote(res.data)
        fetchWikiImage(res.data.wikiTitle)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    fetchQuote()
  }, [])

  const fetchWikiImage = async (wikiTitle) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${wikiTitle}`
      )
      const data = await res.json()
      if (data.thumbnail?.source) {
        setWikiImage(data.thumbnail.source)
      }
    } catch (err) {
      console.error('Wiki image fetch failed', err)
    }
  }

  // Slideshow effect — cycle background position to simulate movement on single image
  useEffect(() => {
    if (!wikiImage) return
    const interval = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [wikiImage])

  const bgPositions = ['center top', 'center center', 'center bottom']

  const handleShare = () => {
    navigator.clipboard.writeText(`"${quote.text}" — ${quote.author}`)
    alert('Quote copied to clipboard! 📋')
  }

  if (loading) return (
    <div className="rounded-2xl border border-gray-100 p-6 animate-pulse bg-white">
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-6 bg-gray-200 rounded w-1/2" />
    </div>
  )

  if (!quote) return null

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '280px' }}>

      {/* Background — Wikipedia image with slideshow pan effect, fallback to gradient */}
      {wikiImage ? (
        <div
          className="absolute inset-0 transition-all duration-[3000ms] ease-in-out"
          style={{
            backgroundImage: `url(${wikiImage})`,
            backgroundSize: 'cover',
            backgroundPosition: bgPositions[slideIndex],
            filter: 'brightness(0.25) saturate(1.2)',
            transform: 'scale(1.05)'
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, #0039A6 0%, #002580 50%, #001a5e 100%)'
        }} />
      )}

      {/* Blue tint overlay for readability */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(135deg, rgba(0,57,166,0.85) 0%, rgba(0,26,94,0.9) 100%)'
      }} />

      {/* Decorative floating circles */}
      <style>{`
        @keyframes float1 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-15px); } }
        @keyframes float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(12px); } }
        .f1 { animation: float1 7s ease-in-out infinite; }
        .f2 { animation: float2 9s ease-in-out infinite; }
      `}</style>
      <div className="f1 absolute -top-8 -right-8 w-48 h-48 rounded-full border border-ncat-gold opacity-20" />
      <div className="f2 absolute -bottom-12 -left-12 w-64 h-64 rounded-full border border-white opacity-10" />

      {/* Giant quote marks */}
      <div className="absolute top-2 left-6 text-8xl font-serif text-ncat-gold opacity-20 leading-none select-none">"</div>
      <div className="absolute bottom-2 right-6 text-8xl font-serif text-ncat-gold opacity-20 leading-none select-none rotate-180">"</div>

      {/* Content */}
      <div className="relative z-10 p-7">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-ncat-gold text-lg">✨</span>
            <span className="text-white font-bold text-sm tracking-widest uppercase">Today's Inspiration</span>
          </div>
          <span className="bg-white bg-opacity-10 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full border border-white border-opacity-20">
            {quote.field}
          </span>
        </div>

        {/* Gold divider */}
        <div className="w-12 h-0.5 bg-ncat-gold mb-5 rounded-full" />

        {/* Quote text */}
        <blockquote className="text-xl md:text-2xl font-light leading-relaxed mb-8 text-white tracking-wide">
          "{quote.text}"
        </blockquote>

        {/* Author row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 relative">

            {/* Author avatar */}
            <div
              className="relative cursor-pointer flex-shrink-0"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={() => window.open(quote.wikiUrl, '_blank')}
            >
              {/* Gold ring around image */}
              <div className="w-14 h-14 rounded-full p-0.5 bg-ncat-gold hover:scale-105 transition-transform">
                {wikiImage ? (
                  <img
                    src={wikiImage}
                    alt={quote.author}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-ncat-blue flex items-center justify-center">
                    <span className="text-ncat-gold font-bold text-lg">{getInitials(quote.author)}</span>
                  </div>
                )}
              </div>

              {/* Green dot */}
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />

              {/* Hover card */}
              {hovering && (
                <div className="absolute bottom-16 left-0 w-64 bg-white rounded-2xl shadow-2xl p-4 z-50">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full p-0.5 bg-ncat-gold flex-shrink-0">
                      {wikiImage ? (
                        <img
                          src={wikiImage}
                          alt={quote.author}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-ncat-blue flex items-center justify-center">
                          <span className="text-ncat-gold font-bold text-sm">{getInitials(quote.author)}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-ncat-blue leading-tight">{quote.author}</p>
                      <p className="text-xs text-gray-400 leading-tight mt-0.5">{quote.authorTitle}</p>
                    </div>
                  </div>
                  <div className="bg-blue-50 rounded-xl px-3 py-2">
                    <p className="text-xs text-ncat-blue font-semibold">🔗 Click to learn more on Wikipedia</p>
                  </div>
                  <div className="absolute top-full left-5 border-8 border-transparent border-t-white" />
                </div>
              )}
            </div>

            <div>
              <p
                className="font-bold text-white cursor-pointer hover:text-ncat-gold transition text-base"
                onClick={() => window.open(quote.wikiUrl, '_blank')}
              >
                {quote.author}
              </p>
              <p className="text-blue-200 text-xs leading-relaxed max-w-xs">{quote.authorTitle}</p>
            </div>
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-ncat-gold text-ncat-blue text-xs font-bold px-4 py-2.5 rounded-xl hover:opacity-90 transition shadow-lg flex-shrink-0"
          >
            Share 📋
          </button>
        </div>
      </div>
    </div>
  )
}