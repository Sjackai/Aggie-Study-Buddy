import Logo from '../components/Logo'
import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const STUDENT_CENTER = 'https://res.cloudinary.com/dvuplpfpw/image/upload/v1783029829/nc-at-su_student-center-min_exrv95.jpg'

const stats = [
  { number: '500+', label: 'Aggies Connected' },
  { number: '200+', label: 'Study Sessions' },
  { number: '50+', label: 'Courses Covered' },
  { number: '4.9★', label: 'Average Rating' },
]

const features = [
  {
    emoji: '📚',
    title: 'Find Study Groups',
    desc: 'Browse and join study sessions for your courses across campus. Filter by course, location, and time.',
    accent: '#0039A6',
  },
  {
    emoji: '🎮',
    title: 'Brain Games',
    desc: 'Compete in live quizzes, daily trivia, and flash challenges to earn XP and climb the leaderboard.',
    accent: '#FFB81C',
  },
  {
    emoji: '🤝',
    title: 'Connect with Partners',
    desc: 'Find study partners who share your courses. Send kudos, earn achievements, and build your Aggie network.',
    accent: '#0039A6',
  },
  {
    emoji: '🗺️',
    title: 'Campus Map',
    desc: 'Discover the best study spots at NC A&T — from Bluford Library to McNair Hall, with walking directions.',
    accent: '#FFB81C',
  },
  {
    emoji: '✅',
    title: 'QR Check-In',
    desc: 'Hosts generate rotating QR codes. Members scan to check in and track attendance seamlessly.',
    accent: '#0039A6',
  },
  {
    emoji: '🏆',
    title: 'Achievements',
    desc: 'Unlock 150+ tiered achievements across sessions, games, and connections. Show off your Aggie grind.',
    accent: '#FFB81C',
  },
]

export default function Home() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroHeight = typeof window !== 'undefined' ? window.innerHeight : 800
  const parallaxOffset = scrollY * 0.35

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#0039A6', boxShadow: '0 2px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo size={40} />
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 18, lineHeight: 1.2 }}>Aggie StudyBuddy</div>
              <div style={{ color: '#93B8E8', fontSize: 11 }}>North Carolina A&T State University</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>
              Log In
            </Link>
            <Link to="/signup" style={{
              background: '#FFB81C', color: '#0039A6', fontWeight: 700,
              padding: '10px 22px', borderRadius: 12, textDecoration: 'none', fontSize: 14
            }}>
              Get Started →
            </Link>
          </div>
        </div>
      </nav>

      {/* === HERO === */}
      <div style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>

        {/* Photo with parallax + GTA color treatment */}
        <div style={{
          position: 'absolute', inset: 0,
          transform: `translateY(${parallaxOffset}px)`,
          top: -60, bottom: -60,
        }}>
          <img
            src={STUDENT_CENTER}
            alt="NC A&T Student Center"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center 40%',
              filter: 'saturate(1.6) contrast(1.15) brightness(0.85)',
            }}
          />
        </div>

        {/* Blue tint overlay to unify with brand palette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(0,25,80,0.45) 0%, rgba(0,57,166,0.2) 50%, rgba(0,0,0,0) 100%)'
        }} />

        {/* Bottom gradient for text legibility */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,20,60,0.5) 65%, rgba(0,10,40,0.85) 100%)'
        }} />

        {/* Gold top accent line */}
        <div style={{ position: 'absolute', top: 64, left: 0, right: 0, height: 3, background: '#FFB81C', opacity: 0.6 }} />

        {/* Hero text */}
        <div style={{
          position: 'absolute', bottom: 80, left: 0, right: 0,
          textAlign: 'center', padding: '0 24px', zIndex: 10
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,184,28,0.15)', border: '1px solid rgba(255,184,28,0.5)',
            borderRadius: 50, padding: '6px 18px', marginBottom: 20
          }}>
            <span style={{ color: '#FFB81C', fontSize: 13, fontWeight: 600 }}>🐾 Built for Aggies, by Aggies</span>
          </div>

          <h1 style={{
            color: '#fff', fontSize: 'clamp(38px, 6vw, 76px)',
            fontWeight: 800, lineHeight: 1.1, margin: '0 0 18px',
            textShadow: '0 2px 20px rgba(0,0,0,0.4)'
          }}>
            Study Smarter,{' '}
            <span style={{ color: '#FFB81C' }}>Together</span>
          </h1>

          <p style={{
            color: 'rgba(255,255,255,0.88)', fontSize: 'clamp(15px, 2vw, 20px)',
            maxWidth: 580, margin: '0 auto 36px', lineHeight: 1.65,
            textShadow: '0 1px 8px rgba(0,0,0,0.3)'
          }}>
            Connect with fellow Aggies, join study sessions, and ace your courses together.
            Your academic success starts here.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/signup" style={{
              background: '#FFB81C', color: '#0039A6', fontWeight: 700,
              padding: '16px 38px', borderRadius: 16, textDecoration: 'none', fontSize: 17,
              boxShadow: '0 4px 24px rgba(255,184,28,0.45)'
            }}>
              Join Free Today →
            </Link>
            <Link to="/login" style={{
              border: '2px solid rgba(255,255,255,0.75)', color: '#fff', fontWeight: 700,
              padding: '16px 38px', borderRadius: 16, textDecoration: 'none', fontSize: 17,
              backdropFilter: 'blur(4px)'
            }}>
              Log In
            </Link>
          </div>

          <div style={{ marginTop: 44, color: 'rgba(255,255,255,0.45)', fontSize: 13, animation: 'bounce 2s infinite' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>↓</div>
            scroll to explore
          </div>
        </div>
      </div>

      {/* === STATS === */}
      <div style={{ background: '#0039A6', padding: '52px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {stats.map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#FFB81C', fontSize: 44, fontWeight: 800, lineHeight: 1 }}>{stat.number}</div>
              <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 8 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* === FEATURES === */}
      <div style={{ background: '#F8F7F4', padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ color: '#0039A6', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px' }}>
              Everything You Need to Succeed
            </h2>
            <p style={{ color: '#666', fontSize: 18, margin: 0 }}>
              Powerful tools built specifically for NC A&T students
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {features.map((feature, i) => (
              <div key={i} style={{
                background: '#fff', borderRadius: 20, padding: 32,
                borderTop: `4px solid ${feature.accent}`,
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)' }}
              >
                <div style={{ fontSize: 42, marginBottom: 16 }}>{feature.emoji}</div>
                <h3 style={{ color: '#0039A6', fontSize: 20, fontWeight: 700, margin: '0 0 12px' }}>{feature.title}</h3>
                <p style={{ color: '#555', lineHeight: 1.7, margin: 0, fontSize: 15 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === HOW IT WORKS === */}
      <div style={{ background: '#fff', padding: '88px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ color: '#0039A6', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, margin: '0 0 16px' }}>
              How It Works
            </h2>
            <p style={{ color: '#666', fontSize: 18, margin: 0 }}>Get started in 3 simple steps</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {[
              { step: '1', title: 'Create an Account', desc: 'Sign up with your NC A&T email and set up your profile with your major and courses.', emoji: '✍️' },
              { step: '2', title: 'Find or Create Sessions', desc: 'Browse upcoming study sessions or create your own for any course on campus.', emoji: '🔍' },
              { step: '3', title: 'Study & Succeed', desc: 'Join sessions, connect with partners, earn kudos and achievements, and watch your grades improve.', emoji: '🎓' },
            ].map((item, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', background: '#0039A6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 18px', boxShadow: '0 4px 16px rgba(0,57,166,0.3)'
                }}>
                  <span style={{ color: '#FFB81C', fontWeight: 800, fontSize: 26 }}>{item.step}</span>
                </div>
                <div style={{ fontSize: 38, marginBottom: 14 }}>{item.emoji}</div>
                <h3 style={{ color: '#0039A6', fontSize: 19, fontWeight: 700, margin: '0 0 12px' }}>{item.title}</h3>
                <p style={{ color: '#666', lineHeight: 1.7, margin: 0, fontSize: 15 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === CTA === */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Background photo with strong overlay */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <img
            src={STUDENT_CENTER}
            alt=""
            style={{
              width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 60%',
              filter: 'saturate(1.4) contrast(1.1) brightness(0.5)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,25,90,0.75)' }} />
        </div>

        <div style={{ position: 'relative', zIndex: 1, padding: '88px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🐾</div>
          <h2 style={{
            color: '#fff', fontSize: 'clamp(28px, 4vw, 52px)',
            fontWeight: 800, margin: '0 0 18px', lineHeight: 1.2
          }}>
            Ready to Succeed,{' '}
            <span style={{ color: '#FFB81C' }}>Aggie?</span>
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.82)', fontSize: 18,
            margin: '0 auto 40px', maxWidth: 520, lineHeight: 1.65
          }}>
            Join your fellow Aggies and start building the study network that will carry you through to graduation.
          </p>
          <Link to="/signup" style={{
            background: '#FFB81C', color: '#0039A6', fontWeight: 800,
            padding: '18px 52px', borderRadius: 16, textDecoration: 'none', fontSize: 18,
            boxShadow: '0 4px 24px rgba(255,184,28,0.4)', display: 'inline-block'
          }}>
            Join Aggie StudyBuddy →
          </Link>
        </div>
      </div>

      {/* === FOOTER === */}
      <div style={{ background: '#001040', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={40} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Aggie StudyBuddy</span>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, margin: 0 }}>
            © 2026 Aggie StudyBuddy · North Carolina A&T State University
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14 }}>Log In</Link>
            <Link to="/signup" style={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: 14 }}>Sign Up</Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @media (max-width: 640px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}