import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import axios from 'axios'
import API_URL from '../config'
import Logo from '../components/Logo'
import Toast from '../components/Toast'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN

const NCAT_CENTER = [-79.7738, 36.0726]

const BUILDINGS = [
  { name: 'Bluford Library', coordinates: [-79.77374092321054, 36.07278730088831] },
  { name: 'Crosby Hall', coordinates: [-79.76997368852828, 36.07876321349174] },
  { name: 'McNair Hall', coordinates: [-79.77598932959891, 36.07212666271959] },
  { name: 'Merrick Hall', coordinates: [-79.76997214940299, 36.07941164611666] },
  { name: 'Proctor Hall', coordinates: [-79.77127922056748, 36.07463604295844] },
  { name: 'Smith Hall', coordinates: [-79.77318374052375, 36.078538407761705] },
  { name: 'Martin Sr. Engineering Complex', coordinates: [-79.77788950440859, 36.07205662612841] },
  { name: 'Marteena Hall', coordinates: [-79.77126591208388, 36.07867362152236] },
  { name: 'GCB', coordinates: [-79.7693064628953, 36.07891920839281] },
  { name: 'Frye Hall', coordinates: [-79.7719672142127, 36.07455751599009] },
]

const formatTime = (time) => {
  if (!time) return ''
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${minutes} ${ampm}`
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500']
const getColor = (name) => colors[(name?.charCodeAt(0) || 0) % colors.length]

export default function CampusMap() {
  const navigate = useNavigate()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const markersRef = useRef([])
  const userMarkerRef = useRef(null)
  const [sessions, setSessions] = useState([])
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [buildingSessions, setBuildingSessions] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [is3D, setIs3D] = useState(true)
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [mapLoaded, setMapLoaded] = useState(false)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { navigate('/login'); return }
    fetchSessions(token)
    getUserLocation()
  }, [])

  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: NCAT_CENTER,
      zoom: 15.5,
      pitch: 60,
      bearing: -20,
      antialias: true
    })

    map.current.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-right')

    map.current.on('load', () => {
      // All buildings light grey by default
      map.current.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#cbd5e1',
          'fill-extrusion-height': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            14.05, ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate', ['linear'], ['zoom'],
            14, 0,
            14.05, ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.85
        }
      })

      setMapLoaded(true)
    })

    return () => {
      markersRef.current.forEach(m => m.remove())
      if (userMarkerRef.current) userMarkerRef.current.remove()
      map.current?.remove()
    }
  }, [])

  useEffect(() => {
    if (!userLocation || !mapLoaded) return
    if (userMarkerRef.current) userMarkerRef.current.remove()

    const el = document.createElement('div')
    el.style.cssText = `
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #22c55e;
      border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(34,197,94,0.3);
      animation: pulse 2s infinite;
    `

    userMarkerRef.current = new mapboxgl.Marker({ element: el, anchor: 'center' })
      .setLngLat(userLocation)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML('<p style="color:#000;font-weight:bold;padding:4px;">You are here 📍</p>'))
      .addTo(map.current)
  }, [userLocation, mapLoaded])

  const fetchSessions = async (token) => {
    try {
      const res = await axios.get(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const today = new Date().toISOString().split('T')[0]
      const upcoming = res.data.filter(s => s.date >= today)
      setSessions(upcoming)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.longitude, pos.coords.latitude]),
      (err) => console.log('Location denied:', err)
    )
  }

  const handleJoin = async (sessionId) => {
    const token = localStorage.getItem('token')
    try {
      await axios.post(`${API_URL}/api/sessions/${sessionId}/join`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Joined session! 🐾')
      fetchSessions(token)
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to join', 'error')
    }
  }

  const getWalkTime = (coords) => {
    if (!userLocation) return null
    const R = 6371e3
    const lat1 = userLocation[1] * Math.PI / 180
    const lat2 = coords[1] * Math.PI / 180
    const dLat = (coords[1] - userLocation[1]) * Math.PI / 180
    const dLon = (coords[0] - userLocation[0]) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    return Math.ceil(distance / (1.4 * 60))
  }

  const addSessionMarkers = useCallback(() => {
    // Remove old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    const today = new Date().toISOString().split('T')[0]
    const now = new Date()

    const filtered = sessions.filter(s => {
      if (activeFilter === 'open') return s.status === 'open'
      if (activeFilter === 'today') return s.date === today
      return true
    })

    // Group by building
    const byBuilding = {}
    filtered.forEach(session => {
      const building = BUILDINGS.find(b => b.name === session.location)
      if (!building) return
      if (!byBuilding[building.name]) byBuilding[building.name] = { building, sessions: [] }
      byBuilding[building.name].sessions.push(session)
    })

    // Update 3D building colors using a data source
    const sessionBuildingCoords = Object.values(byBuilding).map(({ building, sessions: bSessions }) => {
      const isLive = bSessions.some(s => {
        const sessionDateTime = new Date(`${s.date}T${s.time}`)
        return Math.abs(now - sessionDateTime) < 2 * 60 * 60 * 1000
      })
      return { name: building.name, isLive }
    })

    // Add markers for each building with sessions
    Object.values(byBuilding).forEach(({ building, sessions: bSessions }) => {
      const isLive = bSessions.some(s => {
        const sessionDateTime = new Date(`${s.date}T${s.time}`)
        return Math.abs(now - sessionDateTime) < 2 * 60 * 60 * 1000
      })

      const pinColor = isLive ? '#FFB81C' : '#0039A6'
      const count = bSessions.length

      const el = document.createElement('div')
      el.style.cssText = `
        width: ${count > 1 ? '40px' : '32px'};
        height: ${count > 1 ? '40px' : '32px'};
        border-radius: 50%;
        background: ${pinColor};
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: ${count > 1 ? '13px' : '11px'};
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        font-family: system-ui, sans-serif;
        user-select: none;
        pointer-events: auto;
      `
      el.innerHTML = count > 1 ? `${count}` : '●'

      // Hover — scale without transform drift
      el.addEventListener('mouseenter', () => { el.style.boxShadow = '0 6px 20px rgba(0,0,0,0.35)' })
      el.addEventListener('mouseleave', () => { el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)' })

      el.addEventListener('click', (e) => {
        e.stopPropagation()
        setSelectedBuilding(building)
        setBuildingSessions(bSessions)
        map.current.flyTo({
          center: building.coordinates,
          zoom: 17.5,
          pitch: 50,
          duration: 1000
        })
      })

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'center'
      })
        .setLngLat(building.coordinates)
        .addTo(map.current)

      markersRef.current.push(marker)
    })
  }, [sessions, activeFilter])

  useEffect(() => {
    if (!mapLoaded || sessions.length === 0) return
    addSessionMarkers()
  }, [mapLoaded, sessions, activeFilter, addSessionMarkers])

  const toggle3D = () => {
    if (!map.current) return
    if (is3D) {
      map.current.easeTo({ pitch: 0, bearing: 0, duration: 800 })
    } else {
      map.current.easeTo({ pitch: 60, bearing: -20, duration: 800 })
    }
    setIs3D(!is3D)
  }

  const flyToNCAT = () => {
    map.current?.flyTo({
      center: NCAT_CENTER,
      zoom: 15.5,
      pitch: 60,
      bearing: -20,
      duration: 1500
    })
  }

  const openDirections = (building) => {
    const [lng, lat] = building.coordinates
    const url = userLocation
      ? `https://www.google.com/maps/dir/${userLocation[1]},${userLocation[0]}/${lat},${lng}`
      : `https://www.google.com/maps/search/${encodeURIComponent(building.name + ' NC A&T State University')}`
    window.open(url, '_blank')
  }

  const userId = JSON.parse(localStorage.getItem('user'))?.id

  return (
    <div className="h-screen flex flex-col">

      <nav className="bg-ncat-blue px-6 py-4 flex justify-between items-center flex-shrink-0 z-10">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Logo size={36} />
          <span className="text-white font-bold text-lg">Aggie StudyBuddy</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-blue-200 text-sm hidden md:block">🗺️ Campus Map</span>
          <button onClick={() => navigate('/dashboard')} className="text-white hover:text-ncat-gold transition font-medium text-sm">
            ← Dashboard
          </button>
        </div>
      </nav>

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
      `}</style>

      <div className="flex flex-1 overflow-hidden relative">

        <div ref={mapContainer} className="flex-1 h-full" />

        {/* Top left controls */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          <div className="flex gap-2 flex-wrap">
            {[
              { id: 'all', label: '📚 All' },
              { id: 'open', label: '🟢 Open' },
              { id: 'today', label: '📅 Today' },
            ].map(f => (
              <button key={f.id} onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md transition border ${
                  activeFilter === f.id
                    ? 'bg-ncat-blue text-white border-ncat-blue'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-ncat-blue hover:text-ncat-blue'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={toggle3D}
              className="bg-white text-gray-700 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-md hover:border-ncat-blue hover:text-ncat-blue transition">
              {is3D ? '2D View' : '3D View'}
            </button>
            <button onClick={flyToNCAT}
              className="bg-white text-gray-700 border border-gray-200 text-xs font-bold px-3 py-1.5 rounded-full shadow-md hover:border-ncat-blue hover:text-ncat-blue transition">
              🎓 NC A&T
            </button>
            {userLocation && (
              <button onClick={() => map.current?.flyTo({ center: userLocation, zoom: 17, duration: 1000 })}
                className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md hover:opacity-90 transition">
                📍 My Location
              </button>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-2xl shadow-lg p-3 z-10 border border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Legend</p>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-ncat-blue border-2 border-white shadow" />
              <span className="text-gray-700 text-xs">Upcoming Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-ncat-gold border-2 border-white shadow" />
              <span className="text-gray-700 text-xs">Happening Now</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow" />
              <span className="text-gray-700 text-xs">Your Location</span>
            </div>
          </div>
        </div>

        {/* Session count */}
        {sessions.length > 0 && (
          <div className="absolute top-4 right-16 bg-white border border-gray-200 text-ncat-blue text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-10">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} on campus
          </div>
        )}

        {/* Side Panel */}
        <div className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 z-20 flex flex-col border-l border-gray-100 ${
          selectedBuilding ? 'translate-x-0' : 'translate-x-full'
        }`}>
          {selectedBuilding && (
            <>
              <div className="bg-ncat-blue p-5 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-white font-bold text-lg leading-tight">{selectedBuilding.name}</h2>
                    <p className="text-blue-200 text-sm mt-1">
                      {buildingSessions.length} session{buildingSessions.length !== 1 ? 's' : ''} here
                    </p>
                    {userLocation && (
                      <p className="text-blue-300 text-xs mt-1">
                        🚶 ~{getWalkTime(selectedBuilding.coordinates)} min walk
                      </p>
                    )}
                  </div>
                  <button onClick={() => setSelectedBuilding(null)}
                    className="text-white opacity-70 hover:opacity-100 text-2xl">✕</button>
                </div>
                <button onClick={() => openDirections(selectedBuilding)}
                  className="mt-3 w-full bg-ncat-gold text-ncat-blue font-bold py-2 rounded-xl text-sm hover:opacity-90 transition">
                  🗺️ Get Directions
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {buildingSessions.map(session => {
                  const isOwn = session.hostId === userId
                  const isMember = session.members?.some(m => m.userId === userId)
                  const isFull = session.status === 'full'

                  return (
                    <div key={session.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-ncat-blue font-bold">{session.courseCode}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          isFull ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {isFull ? 'Full' : 'Open'}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mb-1">📅 {session.date} at {formatTime(session.time)}</p>
                      <p className="text-gray-400 text-xs mb-2">👥 {session.members?.length}/{session.maxParticipants} members</p>

                      <div className="flex items-center gap-2 mb-3 cursor-pointer"
                        onClick={() => navigate(`/profile/${session.host?.id}`)}>
                        <div className={`w-6 h-6 ${getColor(session.host?.name)} rounded-full flex items-center justify-center text-white font-bold text-xs`}>
                          {getInitials(session.host?.name)}
                        </div>
                        <span className="text-ncat-blue text-xs hover:underline">{session.host?.name}</span>
                      </div>

                      {session.description && (
                        <p className="text-gray-500 text-xs mb-3 bg-gray-50 rounded-lg p-2">{session.description}</p>
                      )}

                      {session.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {session.tags.map(tag => (
                            <span key={tag} className="text-xs bg-blue-50 text-ncat-blue px-2 py-0.5 rounded-full">{tag}</span>
                          ))}
                        </div>
                      )}

                      {!isOwn && !isMember && (
                        <button onClick={() => handleJoin(session.id)} disabled={isFull}
                          className="w-full bg-ncat-gold text-ncat-blue font-bold py-2 rounded-xl text-sm hover:opacity-90 transition disabled:opacity-40">
                          {isFull ? 'Session Full' : 'Join Session 🐾'}
                        </button>
                      )}
                      {isMember && !isOwn && (
                        <div className="w-full bg-green-50 text-green-600 font-bold py-2 rounded-xl text-sm text-center border border-green-200">
                          ✓ Joined
                        </div>
                      )}
                      {isOwn && (
                        <div className="w-full bg-blue-50 text-ncat-blue font-bold py-2 rounded-xl text-sm text-center border border-blue-200">
                          👑 Your Session
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}