import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Partners from './pages/Partners'
import FindSessions from './pages/FindSessions'
import CourseSessions from './pages/CourseSessions'
import Profile from './pages/Profile'




function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/sessions/:courseCode" element={<CourseSessions />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/find-sessions" element={<FindSessions />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App