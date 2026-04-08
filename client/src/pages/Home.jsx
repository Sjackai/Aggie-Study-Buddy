import { Link } from 'react-router-dom'

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
    color: 'bg-blue-50',
  },
  {
    emoji: '🤝',
    title: 'Connect with Partners',
    desc: 'Find study partners who share your courses. Send kudos and build your Aggie network.',
    color: 'bg-yellow-50',
  },
  {
    emoji: '🗺️',
    title: 'Campus Locations',
    desc: 'Discover the best study spots at NC A&T — from Bluford Library to McNair Hall.',
    color: 'bg-green-50',
  },
]

const photos = [
  {
    url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    caption: 'Study Together',
  },
  {
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&q=80',
    caption: 'Find Your Group',
  },
  {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
    caption: 'Succeed Together',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-ncat-blue shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-ncat-gold rounded-full flex items-center justify-center">
              <span className="text-ncat-blue font-bold text-sm">A&T</span>
            </div>
            <div>
              <span className="text-white font-bold text-xl">Aggie StudyBuddy</span>
              <p className="text-blue-300 text-xs">North Carolina A&T State University</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-white hover:text-ncat-gold transition font-medium hidden md:block">
              Log In
            </Link>
            <Link to="/signup" className="bg-ncat-gold text-ncat-blue font-bold px-5 py-2 rounded-xl hover:opacity-90 transition text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=1600&q=80)',
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-ncat-blue opacity-85" />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-ncat-gold bg-opacity-20 border border-ncat-gold border-opacity-40 rounded-full px-4 py-2 mb-6">
            <span className="text-ncat-gold text-sm font-semibold">🐾 Built for Aggies, by Aggies</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Study Smarter,
            <br />
            <span className="text-ncat-gold">Together</span>
          </h1>

          <p className="text-blue-200 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with fellow Aggies, join study sessions, and ace your courses together. 
            Your academic success starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-ncat-gold text-ncat-blue font-bold px-10 py-4 rounded-2xl text-lg hover:opacity-90 transition shadow-lg"
            >
              Join Free Today →
            </Link>
            <Link
              to="/login"
              className="border-2 border-white text-white font-bold px-10 py-4 rounded-2xl text-lg hover:bg-white hover:text-ncat-blue transition"
            >
              Log In
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 animate-bounce">
            <span className="text-white opacity-60 text-2xl">↓</span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-ncat-blue py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-ncat-gold text-4xl font-bold mb-1">{stat.number}</p>
                <p className="text-blue-300 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Photo Strip */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ncat-blue mb-4">Aggies Helping Aggies 🐾</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Join hundreds of NC A&T students already studying smarter together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {photos.map((photo, i) => (
              <div key={i} className="relative rounded-2xl overflow-hidden shadow-lg group">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-64 object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-ncat-blue opacity-0 group-hover:opacity-40 transition duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                  <p className="text-white font-semibold">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ncat-blue mb-4">Everything You Need to Succeed</h2>
            <p className="text-gray-500 text-lg">Powerful tools built specifically for NC A&T students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className={`${feature.color} rounded-2xl p-8 hover:shadow-lg transition`}>
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold text-ncat-blue mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mascot/CTA Section */}
      <div className="py-20 bg-ncat-blue">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="text-8xl mb-6">🐾</div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Succeed,
            <br />
            <span className="text-ncat-gold">Aggie?</span>
          </h2>
          <p className="text-blue-200 text-xl mb-10 max-w-xl mx-auto">
            Join your fellow Aggies and start building the study network that will carry you through to graduation.
          </p>
          <Link
            to="/signup"
            className="bg-ncat-gold text-ncat-blue font-bold px-12 py-5 rounded-2xl text-xl hover:opacity-90 transition shadow-lg inline-block"
          >
            Join Aggie StudyBuddy →
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ncat-blue mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Get started in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create an Account', desc: 'Sign up with your NC A&T email and set up your profile with your major and courses.', emoji: '✍️' },
              { step: '2', title: 'Find or Create Sessions', desc: 'Browse upcoming study sessions or create your own for any course on campus.', emoji: '🔍' },
              { step: '3', title: 'Study & Succeed', desc: 'Join sessions, connect with partners, earn kudos, and watch your grades improve.', emoji: '🎓' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 bg-ncat-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-ncat-gold font-bold text-2xl">{item.step}</span>
                </div>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="text-xl font-bold text-ncat-blue mb-2">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-ncat-blue py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-ncat-gold rounded-full flex items-center justify-center">
                <span className="text-ncat-blue font-bold text-xs">A&T</span>
              </div>
              <span className="text-white font-bold">Aggie StudyBuddy</span>
            </div>
            <p className="text-blue-300 text-sm">© 2026 Aggie StudyBuddy · North Carolina A&T State University</p>
            <div className="flex gap-4">
              <Link to="/login" className="text-blue-300 hover:text-white text-sm transition">Log In</Link>
              <Link to="/signup" className="text-blue-300 hover:text-white text-sm transition">Sign Up</Link>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}