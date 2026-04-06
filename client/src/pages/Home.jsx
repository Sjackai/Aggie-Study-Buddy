import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-ncat-blue">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-ncat-gold rounded-full flex items-center justify-center">
            <span className="text-ncat-blue font-bold text-sm">A&T</span>
          </div>
          <span className="text-white font-bold text-xl">Aggie StudyBuddy</span>
        </div>
        <div className="flex gap-4">
          <Link to="/login" className="text-white hover:text-ncat-gold transition font-medium">
            Log In
          </Link>
          <Link to="/signup" className="bg-ncat-gold text-ncat-blue font-bold px-5 py-2 rounded-xl hover:opacity-90 transition">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex flex-col items-center justify-center text-center px-4 pt-20 pb-32">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-lg">
          <span className="text-ncat-blue font-bold text-3xl">A&T</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">
          Study Smarter,<br />
          <span className="text-ncat-gold">Together</span>
        </h1>
        <p className="text-blue-200 text-xl max-w-xl mb-10">
          Connect with fellow Aggies, join study sessions, and ace your courses together.
        </p>
        <div className="flex gap-4">
          <Link to="/signup" className="bg-ncat-gold text-ncat-blue font-bold px-8 py-4 rounded-xl text-lg hover:opacity-90 transition">
            Get Started →
          </Link>
          <Link to="/login" className="border-2 border-white text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white hover:text-ncat-blue transition">
            Log In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-20 px-8">
        <h2 className="text-3xl font-bold text-center text-ncat-blue mb-12">
          Everything you need to succeed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { emoji: '📚', title: 'Find Study Groups', desc: 'Browse and join study sessions for your courses across campus.' },
            { emoji: '🤝', title: 'Connect with Partners', desc: 'Find study partners who share your courses and learning style.' },
            { emoji: '🗺️', title: 'Campus Locations', desc: 'Discover the best study spots at NC A&T and see who\'s there.' },
          ].map((feature, i) => (
            <div key={i} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition">
              <div className="text-5xl mb-4">{feature.emoji}</div>
              <h3 className="text-xl font-bold text-ncat-blue mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-ncat-blue py-8 text-center">
        <p className="text-blue-200 text-sm">© 2026 Aggie StudyBuddy · North Carolina A&T State University</p>
      </div>
    </div>
  )
}